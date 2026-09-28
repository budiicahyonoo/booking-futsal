import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** Ringkasan harian (FR-RPT-01) — Owner & Admin */
  @Get('daily')
  @Roles(Role.OWNER, Role.ADMIN)
  daily(@Query('date') date?: string) {
    return this.reportsService.dailySummary(date);
  }

  /** Okupansi heatmap (FR-RPT-02) — Owner saja */
  @Get('occupancy')
  @Roles(Role.OWNER)
  occupancy(@Query('from') from: string, @Query('to') to: string) {
    return this.reportsService.occupancy(from, to);
  }

  /** Pendapatan per periode (FR-RPT-03) — Owner saja */
  @Get('revenue')
  @Roles(Role.OWNER)
  revenue(@Query('from') from: string, @Query('to') to: string) {
    return this.reportsService.revenue(from, to);
  }
}
