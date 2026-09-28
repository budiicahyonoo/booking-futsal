import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toWibDateString } from '../common/helpers/time.helper';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /** Dashboard ringkasan harian (FR-RPT-01) */
  async dailySummary(dateStr?: string) {
    const venue = await this.prisma.venue.findFirst();
    if (!venue) throw new NotFoundException('Venue belum dikonfigurasi');

    const dateStrFinal = dateStr || toWibDateString(new Date());
    const date = new Date(`${dateStrFinal}T00:00:00+07:00`);
    const dayEnd = new Date(date.getTime() + 24 * 3600_000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        date: { gte: date, lt: dayEnd },
        status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] },
      },
      include: { court: { select: { name: true } } },
    });

    const courts = await this.prisma.court.count({ where: { venueId: venue.id, status: 'AKTIF' } });
    const operationalHours = (venue.closeHour - venue.openHour) * courts;
    const bookedHours = bookings.reduce((sum, b) => sum + (b.endHour - b.startHour), 0);

    const revenue = bookings
      .filter((b) => b.status !== 'PENDING_PAYMENT')
      .reduce((sum, b) => sum + b.paidAmount, 0);

    return {
      date: dateStrFinal,
      totalBookings: bookings.length,
      revenue,
      occupancyPercentage: operationalHours > 0 ? Math.round((bookedHours / operationalHours) * 100) : 0,
      bookedHours,
      operationalHours,
      pendingPayments: await this.prisma.booking.count({
        where: { status: 'PENDING_PAYMENT' },
      }),
      statusBreakdown: {
        pending: bookings.filter((b) => b.status === 'PENDING_PAYMENT').length,
        confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
        completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      },
    };
  }

  /**
   * Okupansi per lapangan per rentang (FR-RPT-02).
   * Heatmap: jam x hari — persentase terisi per sel.
   */
  async occupancy(fromStr: string, toStr: string) {
    const venue = await this.prisma.venue.findFirst();
    if (!venue) throw new NotFoundException('Venue belum dikonfigurasi');

    const from = new Date(`${fromStr}T00:00:00+07:00`);
    const to = new Date(`${toStr}T00:00:00+07:00`);
    const toEnd = new Date(to.getTime() + 24 * 3600_000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        date: { gte: from, lt: toEnd },
        status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] },
      },
      include: { court: { select: { name: true } } },
    });

    const courts = await this.prisma.court.findMany({ where: { venueId: venue.id, status: 'AKTIF' } });

    // Buat daftar tanggal dalam rentang
    const dates: string[] = [];
    for (let d = new Date(from); d <= to; d = new Date(d.getTime() + 24 * 3600_000)) {
      dates.push(toWibDateString(d));
    }

    // Heatmap per lapangan: jam (baris) x tanggal (kolom)
    const heatmap = courts.map((court) => {
      const courtBookings = bookings.filter((b) => b.courtId === court.id);
      const rows: Array<{ hour: number; cells: Array<{ date: string; occupied: boolean; bookingCode?: string }> }> = [];

      for (let h = venue.openHour; h < venue.closeHour; h += venue.slotDurationHours) {
        const cells = dates.map((dateStr) => {
          const dayBookings = courtBookings.filter(
            (b) =>
              toWibDateString(b.date) === dateStr &&
              b.startHour <= h &&
              b.endHour >= h + venue.slotDurationHours,
          );
          return {
            date: dateStr,
            occupied: dayBookings.length > 0,
            bookingCode: dayBookings[0]?.code,
          };
        });
        rows.push({ hour: h, cells });
      }

      const totalSlots = rows.length * dates.length;
      const occupiedSlots = rows.reduce(
        (sum, row) => sum + row.cells.filter((c) => c.occupied).length, 0,
      );

      return {
        courtId: court.id,
        courtName: court.name,
        rows,
        occupancyPercentage: totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0,
      };
    });

    return { from: fromStr, to: toStr, dates, heatmap };
  }

  /** Laporan pendapatan per periode (FR-RPT-03) */
  async revenue(fromStr: string, toStr: string) {
    const from = new Date(`${fromStr}T00:00:00+07:00`);
    const to = new Date(`${toStr}T00:00:00+07:00`);
    const toEnd = new Date(to.getTime() + 24 * 3600_000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        date: { gte: from, lt: toEnd },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: {
        court: { select: { name: true } },
        payments: true,
      },
    });

    const byCourt: Record<string, number> = {};
    const byMethod: Record<string, number> = {};
    const byDate: Record<string, number> = {};
    let total = 0;

    for (const b of bookings) {
      const amount = b.paidAmount;
      if (amount <= 0) continue;
      total += amount;
      byCourt[b.court.name] = (byCourt[b.court.name] || 0) + amount;
      const method = b.payments.find((p) => p.status === 'TERKONFIRMASI')?.method || 'UNKNOWN';
      byMethod[method] = (byMethod[method] || 0) + amount;
      const d = toWibDateString(b.date);
      byDate[d] = (byDate[d] || 0) + amount;
    }

    return { from: fromStr, to: toStr, total, byCourt, byMethod, byDate };
  }
}
