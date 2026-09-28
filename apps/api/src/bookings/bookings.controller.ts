import {
  Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards, UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { RecurringService } from './recurring.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

// Endpoint publik (tanpa JWT): hold, checkout, status by code, upload bukti
// Endpoint member: riwayat, cancel, reschedule
// Endpoint admin: list, confirm/reject, walk-in
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly recurringService: RecurringService,
  ) {}

  /** Hold slot saat mulai checkout (FR-SCHED-03) */
  @Post('hold')
  async hold(@Body() dto: any) {
    return this.bookingsService.holdSlots(dto);
  }

  /** Checkout: buat booking + payment (FR-BOOK-01..04) */
  @Post('checkout')
  async checkout(@Body() dto: any, @Req() req: any) {
    const userId = await this.optionalAuth(req);
    return this.bookingsService.checkout(dto, userId ?? undefined);
  }

  /** Cek status booking tanpa login (FR-BOOK-06) */
  @Get('status/:code')
  getByCode(@Param('code') code: string) {
    return this.bookingsService.getByCode(code);
  }

  /** Upload bukti transfer (FR-BOOK-03) */
  @Post('status/:code/proof')
  uploadProof(@Param('code') code: string, @Body() dto: { proofUrl: string }) {
    return this.bookingsService.uploadProof(code, dto.proofUrl);
  }

  /** List booking utk admin (FR-RPT-04 dsb) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Get()
  findAll(@Query('status') status?: string, @Query('date') date?: string, @Query('pending') pending?: string) {
    return this.bookingsService.findAllForAdmin({
      status, date, pending: pending === 'true',
    });
  }

  /** Riwayat booking member (FR-BOOK-08) */
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  myBookings(@Req() req: any) {
    return this.bookingsService.findUserBookings(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any, @Body() dto: { reason: string }) {
    return this.bookingsService.cancel(id, req.user, dto.reason);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/reschedule')
  reschedule(
    @Param('id') id: string, @Req() req: any,
    @Body() dto: { newDate: string; newStartHour: number },
  ) {
    return this.bookingsService.reschedule(id, dto.newDate, dto.newStartHour, req.user);
  }

  /** Evaluasi kebijakan pembatalan utk UI (FR-POLICY-02) */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/policy')
  policy(@Param('id') id: string) {
    return this.bookingsService.evaluatePolicy(id);
  }

  /** Konfirmasi pembayaran manual (FR 7.4) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.confirmPayment(id, req.user);
  }

  /** Tolak pembayaran dengan alasan wajib (FR 7.4 langkah 4) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Post(':id/reject')
  reject(@Param('id') id: string, @Req() req: any, @Body() dto: { reason: string }) {
    return this.bookingsService.rejectPayment(id, dto.reason, req.user);
  }

  /** Booking manual walk-in (FR-SCHED-05) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Post('walk-in')
  walkIn(@Body() dto: any, @Req() req: any) {
    return this.bookingsService.walkIn(dto, req.user);
  }

  /** Preview tanggal recurring + bentrok (PRD 7.2) */
  @Post('recurring/preview')
  async recurringPreview(@Body() dto: any, @Req() req: any) {
    const userId = await this.optionalAuth(req);
    return this.recurringService.preview(dto, userId);
  }

  /** Buat booking recurring (FR-SCHED-06) */
  @Post('recurring')
  async recurring(@Body() dto: any, @Req() req: any) {
    const userId = await this.optionalAuth(req);
    return this.recurringService.create(dto, userId ?? undefined);
  }

  /** Helper: JWT optional — user id jika token valid, null jika guest */
  private async optionalAuth(req: any): Promise<string | null> {
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth?.startsWith('Bearer ')) return null;
    try {
      // Delegasi ke JwtStrategy via guard di route lain; di sini verifikasi manual ringan
      const token = auth.slice(7);
      const jwt = require('jsonwebtoken');
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-cahyodev');
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }
}
