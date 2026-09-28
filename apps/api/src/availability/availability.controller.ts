import { Controller, Get, Query, Req, UseGuards, Optional } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /**
   * Grid ketersediaan per tanggal.
   * Publik (guest) maupun member (harga member otomatis jika login).
   * Contoh: GET /availability?date=2026-10-01
   */
  @Get()
  getAvailability(@Query('date') date: string, @Req() req: any) {
    const auth = req.headers['authorization'];
    let isMember = false;
    // Deteksi member ditangani di service via flag sederhana (tanpa validasi penuh di sini)
    if (auth) isMember = true;
    return this.availabilityService.getAvailability(date, isMember);
  }
}
