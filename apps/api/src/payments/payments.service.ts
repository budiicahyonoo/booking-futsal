import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';
import { NotificationsService } from '../common/services/notifications.service';
import { formatHour } from '../common/helpers/time.helper';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Webhook payment gateway QRIS (FR-BOOK-05).
   * V1: endpoint simulasi — dipanggil manual utk menandai pembayaran QRIS sukses.
   * Fase 2: ganti dengan verifikasi signature Midtrans/Xendit.
   */
  async qrisWebhook(dto: { bookingCode: string; status: 'PAID' | 'FAILED' }) {
    const booking = await this.prisma.booking.findUnique({
      where: { code: dto.bookingCode },
      include: { payments: true, court: true },
    });
    if (!booking) throw new NotFoundException('Booking tidak ditemukan');

    const payment = booking.payments.find((p) => p.method === 'QRIS' && p.status === 'MENUNGGU');
    if (!payment) throw new BadRequestException('Tidak ada pembayaran QRIS menunggu');

    if (dto.status === 'FAILED') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'DITOLAK', rejectionReason: 'Pembayaran QRIS gagal' },
      });
      return { message: 'Pembayaran QRIS gagal dicatat' };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'TERKONFIRMASI', verifiedAt: new Date() },
      });
      return tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED', paidAmount: payment.amount },
      });
    });

    await this.audit.log({
      venueId: booking.court.venueId,
      action: 'QRIS_PAID',
      detail: `Booking ${booking.code} dibayar via QRIS (${payment.amount})`,
    });

    await this.notifications.enqueue({
      type: 'KONFIRMASI',
      bookingId: booking.id,
      venueId: booking.court.venueId,
      recipient: { name: booking.bookerName, phone: booking.bookerPhone },
      vars: {
        nama: booking.bookerName,
        kode: booking.code,
        lapangan: booking.court.name,
        tanggal: booking.date.toISOString().slice(0, 10),
        jam: formatHour(booking.startHour),
        status: 'TERKONFIRMASI via QRIS',
      },
    });

    return { message: 'Pembayaran QRIS terkonfirmasi', bookingCode: booking.code, status: 'CONFIRMED' };
  }

  /** Daftar pembayaran menunggu verifikasi admin (FR-RPT-04) */
  async findPending() {
    return this.prisma.payment.findMany({
      where: { status: 'MENUNGGU' },
      include: {
        booking: {
          include: { court: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
