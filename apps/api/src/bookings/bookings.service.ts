import {
  Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { BookingStatus, PaymentMethod, PaymentType, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';
import { NotificationsService } from '../common/services/notifications.service';
import { formatHour, NAMA_BULAN, NAMA_HARI, toWibDateString, wibDayOfWeek } from '../common/helpers/time.helper';

export interface HoldSlotDto {
  courtId: string;
  date: string; // YYYY-MM-DD
  slots: { startHour: number; endHour: number }[];
}

export interface CheckoutDto {
  sessionId: string;
  bookerName: string;
  bookerPhone: string;
  paymentType: 'DP' | 'LUNAS';
  paymentMethod: 'TRANSFER' | 'QRIS';
  email?: string;
}

const ACTIVE_STATUSES: BookingStatus[] = ['HOLD', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'];

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  // ================= HELPER =================

  private dayTypeOf(date: Date): 'WEEKDAY' | 'WEEKEND' {
    const dow = wibDayOfWeek(date);
    return dow === 0 || dow === 6 ? 'WEEKEND' : 'WEEKDAY';
  }

  /** Resolve harga slot; harga member bila pemesan member reguler (FR-COURT-05) */
  private async resolvePrice(courtId: string, date: Date, startHour: number, endHour: number, isMember: boolean) {
    const rules = await this.prisma.pricingRule.findMany({ where: { courtId } });
    const dayType = this.dayTypeOf(date);
    const rule = rules.find(
      (r) => r.dayType === dayType && r.startHour <= startHour && r.endHour >= endHour,
    );
    if (!rule) {
      throw new BadRequestException('Slot di luar jam operasional atau belum ada aturan harga');
    }
    const price = isMember && rule.memberPrice != null ? rule.memberPrice : rule.price;
    return { price };
  }

  private formatBookingDate(date: Date): string {
    const shifted = new Date(date.getTime() + 7 * 3600_000);
    return `${NAMA_HARI[shifted.getUTCDay()]}, ${shifted.getUTCDate()} ${NAMA_BULAN[shifted.getUTCMonth()]}`;
  }

  private varsFor(booking: {
    code: string; bookerName: string; date: Date; startHour: number;
    court: { name: string }; status: string;
  }) {
    return {
      nama: booking.bookerName,
      kode: booking.code,
      lapangan: booking.court.name,
      tanggal: this.formatBookingDate(booking.date),
      jam: formatHour(booking.startHour),
      status: booking.status,
    };
  }

  // ============ HOLD SLOT (FR-SCHED-03/04) ============

  /**
   * Hold slot saat checkout dimulai. Transaksi atomik per slot:
   * cek booking overlap + hold aktif sesi lain, lalu insert.
   * Mencegah double-booking saat dua user checkout slot sama bersamaan.
   */
  async holdSlots(dto: HoldSlotDto, sessionId?: string) {
    const venue = await this.prisma.venue.findFirst();
    if (!venue) throw new NotFoundException('Venue belum dikonfigurasi');

    const sid = sessionId || `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const date = new Date(`${dto.date}T00:00:00+07:00`);
    const now = new Date();

    const court = await this.prisma.court.findUnique({ where: { id: dto.courtId } });
    if (!court) throw new NotFoundException('Lapangan tidak ditemukan');
    if (court.status !== 'AKTIF') throw new BadRequestException('Lapangan sedang tidak tersedia');

    const holdMinutes = venue.holdDurationMinutes || 10;
    const expiredAt = new Date(now.getTime() + holdMinutes * 60_000);

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const slot of dto.slots) {
          // 1. Booking aktif yang overlap = bentrok
          const overlap = await tx.booking.findFirst({
            where: {
              courtId: dto.courtId,
              date,
              status: { in: ACTIVE_STATUSES },
              startHour: { lt: slot.endHour },
              endHour: { gt: slot.startHour },
            },
          });
          if (overlap) throw new ConflictException('Slot sudah dibooking');

          // 2. Hold aktif dari sesi lain = sedang di-checkout orang lain
          const holdConflict = await tx.slotHold.findFirst({
            where: {
              courtId: dto.courtId,
              date,
              expiredAt: { gt: now },
              sessionId: { not: sid },
              startHour: { lt: slot.endHour },
              endHour: { gt: slot.startHour },
            },
          });
          if (holdConflict) throw new ConflictException('Slot sedang diproses checkout orang lain');
        }

        // Insert semua hold setelah validasi lolos
        await tx.slotHold.createMany({
          data: dto.slots.map((slot) => ({
            courtId: dto.courtId,
            date,
            startHour: slot.startHour,
            endHour: slot.endHour,
            sessionId: sid,
            expiredAt,
          })),
        });
      });
    } catch (e) {
      if (e instanceof ConflictException) throw e;
      throw new BadRequestException('Gagal hold slot, silakan coba lagi');
    }

    return { sessionId: sid, expiredAt, holdMinutes };
  }

  // ============ CHECKOUT (FR-BOOK-01..04) ============

  async checkout(dto: CheckoutDto, userId?: string) {
    const venue = await this.prisma.venue.findFirst();
    if (!venue) throw new NotFoundException('Venue belum dikonfigurasi');

    // 1. Ambil hold aktif milik sesi ini
    const holds = await this.prisma.slotHold.findMany({
      where: { sessionId: dto.sessionId, expiredAt: { gt: new Date() } },
      orderBy: { startHour: 'asc' },
    });
    if (holds.length === 0) {
      throw new BadRequestException('Sesi hold kedaluwarsa. Silakan pilih slot ulang.');
    }

    const date = holds[0].date;
    const courtId = holds[0].courtId;

    // 2. Tentukan harga member
    let isMember = false;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { memberProfile: true },
      });
      isMember = !!user?.memberProfile;
    }

    // 3. Total harga (di-lock dari hold - PRD 12.1)
    let totalPrice = 0;
    for (const h of holds) {
      const { price } = await this.resolvePrice(courtId, date, h.startHour, h.endHour, isMember);
      totalPrice += price;
    }
    const dpPercentage = venue.defaultDpPercentage ?? 50;
    const dpAmount = dto.paymentType === 'LUNAS' ? totalPrice : Math.ceil((totalPrice * dpPercentage) / 100);

    // 4. Buat booking + payment dalam transaksi; hapus hold
    const booking = await this.prisma.$transaction(async (tx) => {
      // Re-check overlap (guard kedua level DB)
      for (const h of holds) {
        const overlap = await tx.booking.findFirst({
          where: {
            courtId,
            date,
            status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] as BookingStatus[] },
            startHour: { lt: h.endHour },
            endHour: { gt: h.startHour },
          },
        });
        if (overlap) throw new ConflictException('Slot sudah dibooking orang lain');
      }

      const created = await tx.booking.create({
        data: {
          courtId,
          userId: userId ?? null,
          bookerName: dto.bookerName,
          bookerPhone: dto.bookerPhone,
          date,
          startHour: holds[0].startHour,
          endHour: holds[holds.length - 1].endHour,
          status: dto.paymentMethod === 'QRIS' ? 'HOLD' : 'PENDING_PAYMENT',
          paymentType: dto.paymentType,
          totalPrice,
          dpAmount,
        },
      });

      await tx.payment.create({
        data: {
          bookingId: created.id,
          method: dto.paymentMethod,
          type: dto.paymentType,
          amount: dpAmount,
          status: dto.paymentMethod === 'QRIS' ? 'MENUNGGU' : 'MENUNGGU',
        },
      });

      await tx.slotHold.deleteMany({ where: { sessionId: dto.sessionId } });
      return created;
    });

    const full = await this.prisma.booking.findUnique({
      where: { id: booking.id },
      include: { court: true },
    });

    // 5. Notifikasi
    if (dto.paymentMethod === 'TRANSFER') {
      // Status PENDING_PAYMENT -> notif ke user + admin (FR-NOTIF-01/03)
      await this.notifications.enqueue({
        type: 'KONFIRMASI',
        bookingId: booking.id,
        userId: userId ?? null,
        venueId: venue.id,
        recipient: { name: dto.bookerName, phone: dto.bookerPhone, email: dto.email },
        vars: this.varsFor({ ...full!, status: 'menunggu konfirmasi pembayaran' }),
      });
      await this.notifications.notifyAdminsNewManualPayment(full!);
    } else {
      // QRIS: tunggu webhook; notifikasi dikirim saat pembayaran berhasil
      await this.notifications.enqueue({
        type: 'KONFIRMASI',
        bookingId: booking.id,
        userId: userId ?? null,
        venueId: venue.id,
        recipient: { name: dto.bookerName, phone: dto.bookerPhone, email: dto.email },
        vars: this.varsFor({ ...full!, status: 'menunggu pembayaran QRIS' }),
      });
    }

    return {
      bookingCode: booking.code,
      status: booking.status,
      totalPrice,
      dpAmount,
      paymentMethod: dto.paymentMethod,
      message:
        dto.paymentMethod === 'QRIS'
          ? 'Silakan selesaikan pembayaran QRIS'
          : 'Upload bukti transfer untuk konfirmasi admin',
    };
  }

  // ============ CEK STATUS BY CODE (FR-BOOK-06) ============

  async getByCode(code: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { code },
      include: {
        court: { select: { name: true, surfaceType: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!booking) throw new NotFoundException('Booking tidak ditemukan');
    return booking;
  }

  // ============ UPLOAD BUKTI TRANSFER (FR-BOOK-03/04) ============

  async uploadProof(code: string, proofUrl: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code }, include: { payments: true } });
    if (!booking) throw new NotFoundException('Booking tidak ditemukan');

    const payment = booking.payments.find((p) => p.method === 'TRANSFER' && p.status === 'MENUNGGU');
    if (!payment) throw new BadRequestException('Tidak ada pembayaran transfer yang menunggu bukti');

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { proofUrl },
    });
    return { message: 'Bukti transfer terkirim, menunggu konfirmasi admin' };
  }

  // ============ KONFIRMASI / TOLAK MANUAL (FR 7.4) ============

  async confirmPayment(bookingId: string, adminUser: { id: string; role: Role; venueId: string | null }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true, court: true },
    });
    if (!booking) throw new NotFoundException('Booking tidak ditemukan');
    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Booking tidak dalam status menunggu konfirmasi');
    }

    const payment = booking.payments.find((p) => p.status === 'MENUNGGU');
    if (!payment) throw new BadRequestException('Tidak ada pembayaran menunggu verifikasi');

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'TERKONFIRMASI', verifiedById: adminUser.id, verifiedAt: new Date() },
      });
      return tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          paidAmount: payment.amount,
        },
      });
    });

    await this.audit.log({
      venueId: booking.court.venueId,
      userId: adminUser.id,
      action: 'PAYMENT_CONFIRM',
      detail: `Booking ${booking.code} dikonfirmasi (${payment.amount})`,
    });

    await this.notifications.enqueue({
      type: 'KONFIRMASI',
      bookingId: booking.id,
      venueId: booking.court.venueId,
      recipient: { name: booking.bookerName, phone: booking.bookerPhone },
      vars: this.varsFor({ ...booking, status: 'TERKONFIRMASI' }),
    });

    return updated;
  }

  async rejectPayment(bookingId: string, reason: string, adminUser: { id: string; role: Role }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true, court: true },
    });
    if (!booking) throw new NotFoundException('Booking tidak ditemukan');
    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Booking tidak dalam status menunggu konfirmasi');
    }

    const payment = booking.payments.find((p) => p.status === 'MENUNGGU');
    if (!payment) throw new BadRequestException('Tidak ada pembayaran menunggu verifikasi');

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'DITOLAK', rejectionReason: reason, verifiedById: adminUser.id, verifiedAt: new Date() },
      });
      return tx.booking.update({ where: { id: bookingId }, data: { status: 'REJECTED' } });
    });

    await this.audit.log({
      venueId: booking.court.venueId,
      userId: adminUser.id,
      action: 'PAYMENT_REJECT',
      detail: `Booking ${booking.code} ditolak: ${reason}`,
    });

    await this.notifications.enqueue({
      type: 'PEMBATALAN',
      bookingId: booking.id,
      venueId: booking.court.venueId,
      recipient: { name: booking.bookerName, phone: booking.bookerPhone },
      vars: this.varsFor({ ...booking, status: `DITOLAK — ${reason}` }),
    });

    return updated;
  }

  // ============ CANCEL / RESCHEDULE (FR-POLICY-01..03) ============

  /** Hitung kebijakan: apakah pengajuan masih dalam batas waktu gratis */
  async evaluatePolicy(bookingId: string) {
    const venue = await this.prisma.venue.findFirst();
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || !venue) throw new NotFoundException('Booking tidak ditemukan');

    const sessionStart = new Date(booking.date.getTime() + booking.startHour * 3600_000);
    const hoursLeft = (sessionStart.getTime() - Date.now()) / 3600_000;
    const withinFreeWindow = hoursLeft >= venue.freeRescheduleHours;

    return {
      hoursLeft: Math.max(0, Math.round(hoursLeft * 10) / 10),
      freeRescheduleHours: venue.freeRescheduleHours,
      withinFreeWindow,
      penaltyPercentage: withinFreeWindow ? 0 : venue.cancellationPenaltyPercentage,
    };
  }

  async cancel(bookingId: string, user: { id: string; role: Role }, reason: string) {
    const venue = await this.prisma.venue.findFirst();
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { court: true },
    });
    if (!booking || !venue) throw new NotFoundException('Booking tidak ditemukan');

    // Member hanya boleh batalkan booking miliknya (FR 4.1)
    if (user.role === 'MEMBER' && booking.userId !== user.id) {
      throw new ForbiddenException('Bukan booking Anda');
    }

    const policy = await this.evaluatePolicy(bookingId);
    const isOverride = !policy.withinFreeWindow;

    const updated = await this.prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });
      // DP hangus sesuai persentase penalti (dp tetap tercatat sbg pendapatan)
      return b;
    });

    await this.audit.log({
      venueId: booking.court.venueId,
      userId: user.id,
      action: isOverride ? 'CANCEL_OVERRIDE' : 'CANCEL',
      detail: `Booking ${booking.code} dibatalkan: ${reason}. Penalti DP ${policy.penaltyPercentage}%`,
    });

    await this.notifications.enqueue({
      type: 'PEMBATALAN',
      bookingId: booking.id,
      venueId: booking.court.venueId,
      recipient: { name: booking.bookerName, phone: booking.bookerPhone },
      vars: this.varsFor({ ...booking, status: 'DIBATALKAN' }),
    });

    return { ...updated, policy };
  }

  async reschedule(bookingId: string, newDate: string, newStartHour: number, user: { id: string; role: Role }) {
    const venue = await this.prisma.venue.findFirst();
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { court: true },
    });
    if (!booking || !venue) throw new NotFoundException('Booking tidak ditemukan');

    if (user.role === 'MEMBER' && booking.userId !== user.id) {
      throw new ForbiddenException('Bukan booking Anda');
    }

    const policy = await this.evaluatePolicy(bookingId);
    if (!policy.withinFreeWindow) {
      throw new BadRequestException(
        `Reschedule hanya gratis ≥ H-${venue.freeRescheduleHours / 24} hari. Hubungi admin untuk bantuan.`,
      );
    }

    const newDateObj = new Date(`${newDate}T00:00:00+07:00`);
    const duration = booking.endHour - booking.startHour;
    const newEndHour = newStartHour + duration;

    // Cek bentrok slot baru
    const overlap = await this.prisma.booking.findFirst({
      where: {
        courtId: booking.courtId,
        date: newDateObj,
        status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] as BookingStatus[] },
        startHour: { lt: newEndHour },
        endHour: { gt: newStartHour },
        id: { not: bookingId },
      },
    });
    if (overlap) throw new ConflictException('Slot baru sudah terisi');

    const updated = await this.prisma.$transaction(async (tx) => {
      return tx.booking.update({
        where: { id: bookingId },
        data: { date: newDateObj, startHour: newStartHour, endHour: newEndHour },
      });
    });

    await this.audit.log({
      venueId: booking.court.venueId,
      userId: user.id,
      action: 'RESCHEDULE',
      detail: `Booking ${booking.code} dipindah ke ${newDate} ${formatHour(newStartHour)}`,
    });

    await this.notifications.enqueue({
      type: 'RESCHEDULE',
      bookingId: booking.id,
      venueId: booking.court.venueId,
      recipient: { name: booking.bookerName, phone: booking.bookerPhone },
      vars: this.varsFor({ ...booking, status: `RESCHEDULE ke ${newDate} ${formatHour(newStartHour)}` }),
    });

    return updated;
  }

  // ============ BOOKING MANUAL / WALK-IN (FR-SCHED-05) ============

  async walkIn(dto: {
    courtId: string;
    date: string;
    startHour: number;
    endHour: number;
    bookerName: string;
    bookerPhone: string;
    paymentType: 'DP' | 'LUNAS';
    totalPrice?: number;
    notes?: string;
  }, adminUser: { id: string; role: Role }) {
    const venue = await this.prisma.venue.findFirst();
    if (!venue) throw new NotFoundException('Venue belum dikonfigurasi');

    const date = new Date(`${dto.date}T00:00:00+07:00`);
    const isMember = false;

    let totalPrice = dto.totalPrice ?? 0;
    if (!totalPrice) {
      const { price } = await this.resolvePrice(dto.courtId, date, dto.startHour, dto.endHour, isMember);
      totalPrice = price * (dto.endHour - dto.startHour) / (venue.slotDurationHours || 1);
    }
    const dpAmount = dto.paymentType === 'LUNAS' ? totalPrice : Math.ceil((totalPrice * (venue.defaultDpPercentage ?? 50)) / 100);

    const overlap = await this.prisma.booking.findFirst({
      where: {
        courtId: dto.courtId,
        date,
        status: { in: ACTIVE_STATUSES },
        startHour: { lt: dto.endHour },
        endHour: { gt: dto.startHour },
      },
    });
    if (overlap) throw new ConflictException('Slot sudah terisi');

    const booking = await this.prisma.booking.create({
      data: {
        courtId: dto.courtId,
        bookerName: dto.bookerName,
        bookerPhone: dto.bookerPhone,
        date,
        startHour: dto.startHour,
        endHour: dto.endHour,
        status: 'CONFIRMED', // walk-in langsung terkonfirmasi (bayar di tempat)
        paymentType: dto.paymentType,
        totalPrice,
        dpAmount,
        notes: dto.notes,
        isWalkIn: true,
        paidAmount: dto.paymentType === 'LUNAS' ? totalPrice : 0,
      },
    });

    await this.audit.log({
      venueId: venue.id,
      userId: adminUser.id,
      action: 'WALK_IN',
      detail: `Walk-in ${booking.code} oleh ${adminUser.id}`,
    });

    return booking;
  }

  // ============ RIWAYAT BOOKING MEMBER (FR-BOOK-08) ============

  async findUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { court: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  // ============ LIST UTK ADMIN ============

  async findAllForAdmin(filters: { status?: string; date?: string; pending?: boolean }) {
    const where: any = {};
    if (filters.pending) where.status = 'PENDING_PAYMENT';
    else if (filters.status) where.status = filters.status;
    if (filters.date) {
      const d = new Date(`${filters.date}T00:00:00+07:00`);
      where.date = { gte: d, lt: new Date(d.getTime() + 24 * 3600_000) };
    }
    return this.prisma.booking.findMany({
      where,
      include: { court: { select: { name: true } }, payments: true, user: { select: { name: true, phone: true } } },
      orderBy: [{ date: 'desc' }, { startHour: 'asc' }],
    });
  }

  // ============ RECURRING (FR-SCHED-06) — dipanggil via modul terpisah ============
}
