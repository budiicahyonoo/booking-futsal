import { Controller, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MembersService } from './members.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('members')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  /** Daftar member + statistik (Owner full, Admin lihat saja - matriks 4.1) */
  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  findAll() {
    return this.membersService.findAll();
  }

  /** Owner tandai member reguler (FR-MEMBER-03) */
  @Patch(':userId/regular')
  @Roles(Role.OWNER)
  setRegular(@Param('userId') userId: string, @Body() dto: { isRegular: boolean }, @Req() req: any) {
    return this.membersService.setRegular(userId, dto.isRegular, req.user.id);
  }
}
