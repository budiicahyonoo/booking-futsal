import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { AuditService } from '../common/services/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [MembersController],
  providers: [MembersService, AuditService],
})
export class MembersModule {}
