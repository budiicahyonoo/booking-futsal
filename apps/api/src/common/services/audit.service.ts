import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Auditability (PRD 8): aksi sensitif tercatat dengan user & timestamp
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: {
    venueId?: string | null;
    userId?: string | null;
    action: string;
    detail?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          venueId: params.venueId ?? null,
          userId: params.userId ?? null,
          action: params.action,
          detail: params.detail ?? null,
        },
      });
    } catch (err) {
      this.logger.warn(`Gagal mencatat audit log: ${err}`);
    }
  }
}
