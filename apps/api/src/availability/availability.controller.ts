import { Controller, Get, Query, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

/** Decorator userId opsional: terisi jika Bearer token valid, null jika guest */
export const OptionalUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const auth: string | undefined = request.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const jwt = require('jsonwebtoken');
      const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'secret-cahyodev');
      return payload.sub ?? null;
    } catch {
      return null;
    }
  },
);

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /**
   * Grid ketersediaan per tanggal (FR-SCHED-01).
   * Guest melihat harga umum; member reguler otomatis melihat harga member.
   * Contoh: GET /availability?date=2026-10-01
   */
  @Get()
  getAvailability(@Query('date') date: string, @OptionalUserId() userId: string | null) {
    return this.availabilityService.getAvailability(date, userId);
  }
}
