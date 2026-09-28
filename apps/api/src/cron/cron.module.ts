import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsService } from '../common/services/notifications.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [CronService, NotificationsService],
})
export class CronModule {}
