import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../common/services/notifications.service';
import { toWibDateString } from '../common/helpers/time.helper';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * FR-SCHED-04: hold yang tidak diselesaikan otomatis kembali "Kosong".
   * Dijalankan tiap menit.
   */
  @Cron('* * * * *')
  async cleanupExpiredHolds() {
    const result = await this.prisma.slotHold.deleteMany({
      where: { expiredAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      this.logger.log(`Melepas ${result.count} hold kedaluwarsa`);
    }
  }

  /**
   * FR-NOTIF-02: pengingat H-1 jam 08:00 WIB = 01:00 UTC.
   */
  @Cron('0 1 * * *')
  async sendH1Reminders() {
    const tomorrow = new Date(Date.now() + 24 * 3600_000);
    const target = toWibDateString(tomorrow);

    const startOfDay = new Date(`${target}T00:00:00+07:00`);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 3600_000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
        status: 'CONFIRMED',
      },
      include: { court: { select: { name: true } } },
    });

    if (bookings.length > 0) {
      await this.notifications.notifyUpcomingBookings(bookings);
      this.logger.log(`Pengingat H-1 terkirim utk ${bookings.length} booking`);
    }
  }

  /** Tandai booking CONFIRMED yang sudah lewat menjadi COMPLETED (dihitung okupansi) */
  @Cron('5 1 * * *')
  async completePastBookings() {
    const todayStart = new Date(`${toWibDateString(new Date())}T00:00:00+07:00`);
    const result = await this.prisma.booking.updateMany({
      where: {
        status: 'CONFIRMED',
        date: { lt: todayStart },
      },
      data: { status: 'COMPLETED' },
    });
    if (result.count > 0) {
      this.logger.log(`${result.count} booking ditandai COMPLETED`);
    }
  }
}
