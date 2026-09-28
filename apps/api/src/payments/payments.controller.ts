import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Webhook payment gateway (FR-BOOK-05). V1: simulasi.
   * Dipanggil gateway: POST /payments/qris/webhook
   */
  @Post('qris/webhook')
  qrisWebhook(@Body() dto: { bookingCode: string; status: 'PAID' | 'FAILED' }) {
    return this.paymentsService.qrisWebhook(dto);
  }

  /** List pembayaran menunggu verifikasi (FR-RPT-04) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Get('pending')
  findPending() {
    return this.paymentsService.findPending();
  }
}
