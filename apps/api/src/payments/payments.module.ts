import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AuditService } from '../common/services/audit.service';
import { NotificationsService } from '../common/services/notifications.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, AuditService, NotificationsService],
})
export class PaymentsModule {}
