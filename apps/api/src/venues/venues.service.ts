import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  findOne(id: string) {
    return this.prisma.venue.findUnique({ where: { id } });
  }

  /** Single-venue V1: ambil venue pertama */
  findDefault() {
    return this.prisma.venue.findFirst();
  }

  /** Owner kelola pengaturan venue (FR-SET-01..05) */
  async update(id: string, dto: {
    name?: string; address?: string; logoUrl?: string; contactWa?: string;
    openHour?: number; closeHour?: number; slotDurationHours?: number;
    holdDurationMinutes?: number; defaultDpPercentage?: number;
    freeRescheduleHours?: number; cancellationPenaltyPercentage?: number;
    bankName?: string; bankAccount?: string; bankAccountName?: string;
    qrisImageUrl?: string; waTemplate?: string; emailTemplate?: string;
  }) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Venue tidak ditemukan');

    return this.prisma.venue.update({ where: { id }, data: dto });
  }
}
