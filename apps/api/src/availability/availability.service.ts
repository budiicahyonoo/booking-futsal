import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isWeekend, nowWibHourFraction, toWibDateString } from '../common/helpers/time.helper';

export interface SlotCell {
  startHour: number;
  endHour: number;
  price: number;
  memberPrice: number | null;
  status: 'KOSONG' | 'TERISI' | 'HOLD' | 'LEWAT';
  bookingCode?: string;
  holdExpiresAt?: string;
}

export interface CourtAvailability {
  courtId: string;
  courtName: string;
  surfaceType: string;
  slots: SlotCell[];
}

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Grid ketersediaan real-time per lapangan utk satu tanggal (FR-SCHED-01/02).
   * Slot terisi = Booking aktif (HOLD/PENDING/CONFIRMED/COMPLETED) + SlotHold belum expired.
   * Slot yang sudah lewat di hari ini ditandai LEWAT dan tidak bisa dipilih.
   */
  async getAvailability(dateStr: string, isMember: boolean) {
    const venue = await this.prisma.venue.findFirst();
    if (!venue) throw new NotFoundException('Venue belum dikonfigurasi');

    const date = new Date(`${dateStr}T00:00:00+07:00`);
    const courts = await this.prisma.court.findMany({
      where: { venueId: venue.id, status: 'AKTIF' },
      include: { pricingRules: true },
      orderBy: { createdAt: 'asc' },
    });

    const activeStatuses: BookingStatus[] = ['HOLD', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'];
    const dayEnd = new Date(date.getTime() + 24 * 3600_000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        court: { venueId: venue.id },
        date: { gte: date, lt: dayEnd },
        status: { in: activeStatuses },
      },
      select: { courtId: true, startHour: true, endHour: true, code: true },
    });

    const holds = await this.prisma.slotHold.findMany({
      where: {
        court: { venueId: venue.id },
        date: { gte: date, lt: dayEnd },
        expiredAt: { gt: new Date() },
      },
      select: { courtId: true, startHour: true, endHour: true, expiredAt: true },
    });

    const isToday = toWibDateString(new Date()) === dateStr;
    const nowHour = nowWibHourFraction(new Date());
    const dayType = isWeekend(date) ? 'WEEKEND' : 'WEEKDAY';

    const result: CourtAvailability[] = courts.map((court) => {
      const courtBookings = bookings.filter((b) => b.courtId === court.id);
      const courtHolds = holds.filter((h) => h.courtId === court.id);

      const slots: SlotCell[] = [];
      for (let h = venue.openHour; h < venue.closeHour; h += venue.slotDurationHours) {
        const slotStart = h;
        const slotEnd = Math.min(h + venue.slotDurationHours, venue.closeHour);

        const booking = courtBookings.find(
          (b) => b.startHour < slotEnd && b.endHour > slotStart,
        );
        const hold = courtHolds.find(
          (hl) => hl.startHour < slotEnd && hl.endHour > slotStart,
        );

        // Rule harga yang mencakup slot penuh
        const rule = court.pricingRules.find(
          (r) => r.dayType === dayType && r.startHour <= slotStart && r.endHour >= slotEnd,
        );

        let status: SlotCell['status'] = 'KOSONG';
        if (booking) status = 'TERISI';
        else if (hold) status = 'HOLD';
        else if (isToday && slotStart <= nowHour) status = 'LEWAT';

        slots.push({
          startHour: slotStart,
          endHour: slotEnd,
          price: rule?.price ?? 0,
          memberPrice: rule?.memberPrice ?? null,
          status,
          bookingCode: booking?.code,
          holdExpiresAt: hold?.expiredAt?.toISOString(),
        });
      }

      return {
        courtId: court.id,
        courtName: court.name,
        surfaceType: court.surfaceType,
        slots,
      };
    });

    return {
      venue: {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        contactWa: venue.contactWa,
        openHour: venue.openHour,
        closeHour: venue.closeHour,
        slotDurationHours: venue.slotDurationHours,
      },
      date: dateStr,
      dayType,
      isToday,
      nowHour,
      isMember,
      courts: result,
    };
  }
}
