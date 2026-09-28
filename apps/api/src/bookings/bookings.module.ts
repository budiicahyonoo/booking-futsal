import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { RecurringService } from './recurring.service';
import { AuditService } from '../common/services/audit.service';
import { NotificationsService } from '../common/services/notifications.service';

@Module({
  imports: [PrismaModule],
  controllers: [BookingsController],
  providers: [BookingsService, RecurringService, AuditService, NotificationsService],
  exports: [BookingsService],
})
export class BookingsModule {}
