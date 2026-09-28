import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { VenuesModule } from './venues/venues.module';
import { CourtsModule } from './courts/courts.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { MembersModule } from './members/members.module';
import { ReportsModule } from './reports/reports.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VenuesModule,
    CourtsModule,
    AvailabilityModule,
    BookingsModule,
    PaymentsModule,
    MembersModule,
    ReportsModule,
    CronModule,
  ],
})
export class AppModule {}
