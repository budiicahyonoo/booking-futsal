import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';
import { AuditService } from '../common/services/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [CourtsController],
  providers: [CourtsService, AuditService],
  exports: [CourtsService],
})
export class CourtsModule {}
