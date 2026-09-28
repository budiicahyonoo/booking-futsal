import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  /** Daftar member + statistik booking (FR-MEMBER-02) */
  async findAll() {
    const members = await this.prisma.member.findMany({
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, isRegularMember: true },
        },
      },
    });

    // Hitung statistik riil dari booking
    const stats = await this.prisma.booking.groupBy({
      by: ['userId'],
      _count: { id: true },
      _sum: { paidAmount: true },
      where: { userId: { not: null }, status: { in: ['CONFIRMED', 'COMPLETED'] } },
    });

    const lastBookings = await this.prisma.booking.findMany({
      where: { userId: { not: null } },
      orderBy: { date: 'desc' },
      distinct: ['userId'],
      select: { userId: true, date: true },
    });

    return members.map((m) => {
      const stat = stats.find((s) => s.userId === m.userId);
      const last = lastBookings.find((l) => l.userId === m.userId);
      return {
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        phone: m.user.phone,
        email: m.user.email,
        type: m.type,
        isRegular: m.user.isRegularMember,
        totalBooking: stat?._count.id ?? 0,
        totalSpend: stat?._sum.paidAmount ?? 0,
        lastBookingAt: last?.date ?? m.lastBookingAt,
      };
    });
  }

  /** Owner tandai member reguler utk harga khusus otomatis (FR-MEMBER-03) */
  async setRegular(userId: string, isRegular: boolean, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { isRegularMember: isRegular } }),
      this.prisma.member.upsert({
        where: { userId },
        update: { type: isRegular ? 'REGULER' : 'BIASA' },
        create: { userId, type: isRegular ? 'REGULER' : 'BIASA' },
      }),
    ]);

    await this.audit.log({
      userId: adminId,
      action: 'MEMBER_SET_REGULAR',
      detail: `${user.name || user.phone} → ${isRegular ? 'REGULER' : 'BIASA'}`,
    });

    return { message: `Member ditandai ${isRegular ? 'reguler' : 'biasa'}` };
  }
}
