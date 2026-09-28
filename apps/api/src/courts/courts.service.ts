import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DayType, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';

export interface CourtDto {
  name: string;
  surfaceType: string;
  photoUrl?: string;
  capacity?: number;
  status?: 'AKTIF' | 'NONAKTIF';
}

export interface PricingRuleDto {
  dayType: 'WEEKDAY' | 'WEEKEND';
  startHour: number;
  endHour: number;
  price: number;
  memberPrice?: number | null;
}

@Injectable()
export class CourtsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  /** Daftar lapangan aktif utk publik; semua utk admin */
  async findAll(includeInactive = false) {
    const venue = await this.prisma.venue.findFirst();
    if (!venue) throw new NotFoundException('Venue belum dikonfigurasi');

    return this.prisma.court.findMany({
      where: { venueId: venue.id, ...(includeInactive ? {} : { status: 'AKTIF' }) },
      include: { pricingRules: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.court.findUnique({
      where: { id },
      include: { pricingRules: true },
    });
  }

  /** Owner CRUD lapangan (FR-COURT-01) */
  async create(dto: CourtDto) {
    const venue = await this.prisma.venue.findFirst();
    if (!venue) throw new NotFoundException('Venue belum dikonfigurasi');

    const court = await this.prisma.court.create({
      data: {
        venueId: venue.id,
        name: dto.name,
        surfaceType: dto.surfaceType,
        photoUrl: dto.photoUrl,
        capacity: dto.capacity ?? 10,
        status: dto.status ?? 'AKTIF',
      },
      include: { pricingRules: true },
    });

    await this.audit.log({ venueId: venue.id, action: 'COURT_CREATE', detail: `Lapangan ${court.name} dibuat` });
    return court;
  }

  /** Admin edit terbatas: tidak boleh mengubah status (FR 4.1) */
  async update(id: string, dto: Partial<CourtDto>, userRole: Role) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) throw new NotFoundException('Lapangan tidak ditemukan');

    const data: any = { ...dto };
    if (userRole !== Role.OWNER) {
      delete data.status;
      if (dto.status && dto.status !== court.status) {
        throw new ForbiddenException('Hanya Owner dapat mengubah status lapangan');
      }
      delete data.name;
      delete data.surfaceType;
      delete data.capacity;
      // Admin hanya boleh ubah foto
      const photoOnly = { photoUrl: dto.photoUrl };
      const updated = await this.prisma.court.update({ where: { id }, data: photoOnly, include: { pricingRules: true } });
      await this.audit.log({ venueId: court.venueId, action: 'COURT_UPDATE', detail: `Foto lapangan ${court.name} diubah` });
      return updated;
    }

    const updated = await this.prisma.court.update({ where: { id }, data, include: { pricingRules: true } });
    await this.audit.log({ venueId: court.venueId, action: 'COURT_UPDATE', detail: `Lapangan ${court.name} diperbarui` });
    return updated;
  }

  /** Owner nonaktifkan lapangan sementara (FR-COURT-04) */
  async setStatus(id: string, status: 'AKTIF' | 'NONAKTIF') {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) throw new NotFoundException('Lapangan tidak ditemukan');

    const updated = await this.prisma.court.update({ where: { id }, data: { status } });
    await this.audit.log({
      venueId: court.venueId,
      action: 'COURT_STATUS',
      detail: `Lapangan ${court.name} → ${status}`,
    });
    return updated;
  }

  /** Owner kelola harga per slot (FR-COURT-03/05): replace semua rule lapangan */
  async setPricingRules(courtId: string, rules: PricingRuleDto[]) {
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) throw new NotFoundException('Lapangan tidak ditemukan');

    await this.prisma.$transaction([
      this.prisma.pricingRule.deleteMany({ where: { courtId } }),
      this.prisma.pricingRule.createMany({
        data: rules.map((r) => ({
          courtId,
          dayType: r.dayType as DayType,
          startHour: r.startHour,
          endHour: r.endHour,
          price: r.price,
          memberPrice: r.memberPrice ?? null,
        })),
      }),
    ]);

    await this.audit.log({
      venueId: court.venueId,
      action: 'PRICING_UPDATE',
      detail: `Harga lapangan ${court.name} diperbarui (${rules.length} aturan)`,
    });
    return this.prisma.pricingRule.findMany({ where: { courtId } });
  }
}
