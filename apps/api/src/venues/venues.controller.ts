import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VenuesService } from './venues.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  /** Profil venue publik (halaman booking publik) */
  @Get('venues/:id')
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  /** Venue utama (single-venue V1) — dipakai halaman publik & dashboard */
  @Get('venues')
  findDefault() {
    return this.venuesService.findDefault();
  }

  /** Owner kelola pengaturan venue (FR-SET-01..05) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER)
  @Put('venues/:id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.venuesService.update(id, dto);
  }
}
