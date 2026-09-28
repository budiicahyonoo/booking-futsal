import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { wibDayOfWeek } from '../common/helpers/time.helper';

export interface RecurringPreviewDto {
  courtId: string;
  dayOfWeek: number; // 0=Minggu .. 6=Sabtu
  startDate: string; // YYYY-MM-DD (harus jatuh di dayOfWeek yg diminta)
  weeksCount: number;
  startHour: number;
  endHour: number;
}

export interface RecurringCreateDto extends RecurringPreviewDto {
  bookerName: string;
  bookerPhone: string;
  paymentType: 'DP' | 'LUNAS';
  skipConflicts: boolean; // false = batalkan seluruh permintaan jika ada bentrok (PRD 7.2 langkah 3)
  email?: string;
}

const ACTIVE_STATUSES: BookingStatus[] = ['HOLD', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'];

@Injectable()
export class RecurringService {
  constructor(private prisma: PrismaService) {}

  /** Tanggal-tanggal recurring & deteksi bentrok (PRD 7.2 langkah 3) */
  async preview(dto: RecurringPreviewDto, userId?: string | null) {
    const court = await this.prisma.court.findUnique({ where: { id: dto.courtId } });
    if (!court) throw new NotFoundException('Lapangan tidak ditemukan');

    let isMember = false;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { memberProfile: true },
      });
      isMember = !!user?.memberProfile;
    }

    const startDate = new Date(`${dto.startDate}T00:00:00+07:00`);
    if (wibDayOfWeek(startDate) !== dto.dayOfWeek) {
      // cari tanggal pertama yang sesuai dayOfWeek setelah startDate
    }
    const targetDow = dto.dayOfWeek;

    const sessions: Array<{ date: string; available: boolean; conflictWith?: string }> = [];
    let firstDate = new Date(startDate);
    if (wibDayOfWeek(firstDate) !== targetDow) {
      const delta = (targetDow - wibDayOfWeek(firstDate) + 7) % 7;
      firstDate = new Date(firstDate.getTime() + delta * 24 * 3600_000);
    }

    for (let w = 0; w < dto.weeksCount; w++) {
      const d = new Date(firstDate.getTime() + w * 7 * 24 * 3600_000);
      const dateStr = d.toISOString().slice(0, 10);

      const overlap = await this.prisma.booking.findFirst({
        where: {
          courtId: dto.courtId,
          date: d,
          status: { in: ACTIVE_STATUSES },
          startHour: { lt: dto.endHour },
          endHour: { gt: dto.startHour },
        },
        select: { code: true },
      });

      sessions.push({
        date: dateStr,
        available: !overlap,
        conflictWith: overlap?.code,
      });
    }

    // Estimasi harga per sesi
    const dow = targetDow;
    const dayType = dow === 0 || dow === 6 ? 'WEEKEND' : 'WEEKDAY';
    const rule = await this.prisma.pricingRule.findFirst({
      where: { courtId: dto.courtId, dayType, startHour: { lte: dto.startHour }, endHour: { gte: dto.endHour } },
    });
    const pricePerSession = isMember && rule?.memberPrice != null ? rule.memberPrice! : rule?.price ?? 0;

    return {
      sessions,
      conflictCount: sessions.filter((s) => !s.available).length,
      pricePerSession,
      totalEstimate: pricePerSession * dto.weeksCount,
    };
  }

  /** Buat rangkaian booking recurring sekaligus (PRD 7.2 langkah 5) */
  async create(dto: RecurringCreateDto, userId?: string) {
    const previewResult = await this.preview(dto, userId);

    if (previewResult.conflictCount > 0 && !dto.skipConflicts) {
      throw new BadRequestException({
        message: 'Ada tanggal yang bentrok. Pilih skip tanggal bentrok atau batalkan.',
        sessions: previewResult.sessions,
      });
    }

    const validSessions = previewResult.sessions.filter((s) => s.available);
    if (validSessions.length === 0) {
      throw new BadRequestException('Tidak ada tanggal valid untuk dibuat');
    }

    const court = await this.prisma.court.findUnique({ where: { id: dto.courtId } });
    if (!court) throw new NotFoundException('Lapangan tidak ditemukan');

    const group = await this.prisma.recurringGroup.create({
      data: {
        courtId: dto.courtId,
        dayOfWeek: dto.dayOfWeek,
        startHour: dto.startHour,
        endHour: dto.endHour,
        startDate: new Date(`${validSessions[0].date}T00:00:00+07:00`),
        weeksCount: dto.weeksCount,
        status: 'ACTIVE',
      },
    });

    const price = previewResult.pricePerSession;
    const bookings = [];

    for (const session of validSessions) {
      const date = new Date(`${session.date}T00:00:00+07:00`);
      const dpAmount = dto.paymentType === 'LUNAS' ? price : Math.ceil((price * 50) / 100);

      const booking = await this.prisma.booking.create({
        data: {
          courtId: dto.courtId,
          userId: userId ?? null,
          bookerName: dto.bookerName,
          bookerPhone: dto.bookerPhone,
          date,
          startHour: dto.startHour,
          endHour: dto.endHour,
          status: 'PENDING_PAYMENT',
          paymentType: dto.paymentType,
          recurringGroupId: group.id,
          totalPrice: price,
          dpAmount,
        },
      });
      bookings.push(booking);
    }

    return {
      recurringGroupId: group.id,
      createdCount: bookings.length,
      skippedDates: previewResult.sessions.filter((s) => !s.available).map((s) => s.date),
      bookings: bookings.map((b) => ({ code: b.code, date: b.date, startHour: b.startHour })),
    };
  }
}
