import { Controller, Get, Post, Put, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CourtsService } from './courts.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  /** Publik: daftar lapangan aktif + harga (halaman booking) */
  @Get()
  findAll() {
    return this.courtsService.findAll(false);
  }

  /** Admin: termasuk lapangan nonaktif */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Get('all')
  findAllAdmin() {
    return this.courtsService.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER)
  @Post()
  create(@Body() dto: any) {
    return this.courtsService.create(dto);
  }

  /** Owner full edit; Admin edit terbatas (matriks 4.1) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.courtsService.update(id, dto, req.user.role);
  }

  /** Owner nonaktifkan/aktifkan lapangan (FR-COURT-04) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER)
  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: { status: 'AKTIF' | 'NONAKTIF' }) {
    return this.courtsService.setStatus(id, dto.status);
  }

  /** Owner atur harga per slot (FR-COURT-03/05) */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER)
  @Put(':id/pricing-rules')
  setPricingRules(@Param('id') id: string, @Body() dto: { rules: any[] }) {
    return this.courtsService.setPricingRules(id, dto.rules);
  }
}
