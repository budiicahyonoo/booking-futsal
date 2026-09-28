import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { formatHour, NAMA_BULAN, NAMA_HARI } from '../helpers/time.helper';

export interface NotificationRecipient {
  name: string;
  phone?: string | null;
  email?: string | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  private renderTemplate(template: string, vars: Record<string, string>): string {
    let out = template;
    for (const [key, value] of Object.entries(vars)) {
      out = out.split(`{{${key}}}`).join(value);
    }
    return out;
  }

  private async venueTemplate(venueId: string | null | undefined, channel: NotificationChannel) {
    if (!venueId) return null;
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) return null;
    return channel === NotificationChannel.WA ? venue.waTemplate : venue.emailTemplate;
  }

  /**
   * Membuat baris notifikasi & "mengirimkannya".
   * V1: pengiriman disimulasikan (logger) — integrasi provider WA/email
   * (Fonnte/Wablas/SMTP sesuai PRD 10) tinggal mengganti bagian kirim().
   */
  async enqueue(params: {
    type: NotificationType;
    bookingId?: string | null;
    userId?: string | null;
    venueId?: string | null;
    recipient: NotificationRecipient;
    vars: Record<string, string>;
  }) {
    const channel = params.recipient.email
      ? NotificationChannel.EMAIL
      : NotificationChannel.WA;
    const template = (await this.venueTemplate(params.venueId, channel)) ??
      'Halo {{nama}}, booking {{kode}} berstatus {{status}}.';

    const content = this.renderTemplate(template, params.vars);
    const notification = await this.prisma.notification.create({
      data: {
        type: params.type,
        bookingId: params.bookingId ?? null,
        userId: params.userId ?? null,
        channel,
        status: 'ANTRIAN',
        content,
      },
    });

    await this.send(notification.id, channel, params.recipient, content);
    return notification;
  }

  /** Titik integrasi provider WA/email (Fonnte/Wablas/SMTP). */
  private async send(
    notificationId: string,
    channel: NotificationChannel,
    recipient: NotificationRecipient,
    content: string,
  ) {
    // Simulasi pengiriman: log ke server. Ganti dengan HTTP call provider.
    this.logger.log(
      `[${channel}] ke ${recipient.phone || recipient.email || 'unknown'}: ${content}`,
    );
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'TERKIRIM', sentAt: new Date() },
    });
  }

  /** Notifikasi ke Admin/Owner saat ada booking transfer manual menunggu konfirmasi (FR-NOTIF-03) */
  async notifyAdminsNewManualPayment(booking: {
    id: string;
    code: string;
    bookerName: string;
    date: Date;
    startHour: number;
  }) {
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['OWNER', 'ADMIN'] } },
    });
    for (const admin of admins) {
      await this.enqueue({
        type: 'KONFIRMASI',
        bookingId: booking.id,
        userId: admin.id,
        venueId: admin.venueId,
        recipient: { name: admin.name || 'Admin', email: admin.email },
        vars: {
          nama: admin.name || 'Admin',
          kode: booking.code,
          status: 'menunggu konfirmasi pembayaran manual',
        },
      });
    }
  }

  /** Pengingat H-1 (FR-NOTIF-02) dipanggil cron */
  async notifyUpcomingBookings(bookings: Array<{
    id: string;
    code: string;
    bookerName: string;
    bookerPhone: string;
    court: { name: string };
    date: Date;
    startHour: number;
  }>) {
    for (const b of bookings) {
      const tgl = `${NAMA_HARI[b.date.getUTCDay()]}, ${b.date.getUTCDate()} ${NAMA_BULAN[b.date.getUTCMonth()]}`;
      await this.enqueue({
        type: 'PENGINGAT',
        bookingId: b.id,
        venueId: null,
        recipient: { name: b.bookerName, phone: b.bookerPhone },
        vars: {
          nama: b.bookerName,
          kode: b.code,
          lapangan: b.court.name,
          tanggal: tgl,
          jam: formatHour(b.startHour),
          status: 'terkonfirmasi — jangan lupa datang besok!',
        },
      });
    }
  }
}
