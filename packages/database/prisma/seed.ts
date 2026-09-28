import { PrismaClient, CourtStatus, DayType, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ===== VENUE (FR-SET-01) =====
  const venue = await prisma.venue.upsert({
    where: { id: 'venue-mampang' },
    update: {},
    create: {
      id: 'venue-mampang',
      name: 'GOR Mampang Arena',
      address: 'Jl. Mampang Prapatan Raya No. 88, Mampang Prapatan, Jakarta Selatan',
      contactWa: '6281234567890',
      openHour: 8,
      closeHour: 24,
      slotDurationHours: 1,
      holdDurationMinutes: 10,
      defaultDpPercentage: 50,
      freeRescheduleHours: 24,
      cancellationPenaltyPercentage: 100,
      bankName: 'BCA',
      bankAccount: '1234567890',
      bankAccountName: 'PT GOR Mampang Arena',
      waTemplate:
        'Halo {{nama}}! Booking Anda ({{kode}}) di GOR Mampang Arena: {{lapangan}}, {{tanggal}} {{jam}}. Status: {{status}}.',
      emailTemplate:
        'Terima kasih {{nama}}, booking {{kode}} Anda ({{lapangan}}, {{tanggal}} {{jam}}) berstatus {{status}}.',
    },
  });

  // ===== USERS (RBAC) =====
  await prisma.user.upsert({
    where: { email: 'owner@mampangarena.id' },
    update: {},
    create: {
      id: 'user-owner',
      email: 'owner@mampangarena.id',
      password: hashedPassword,
      name: 'Pak Herman',
      role: Role.OWNER,
      venueId: venue.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@mampangarena.id' },
    update: {},
    create: {
      id: 'user-admin',
      email: 'admin@mampangarena.id',
      password: hashedPassword,
      name: 'Mbak Tari',
      role: Role.ADMIN,
      venueId: venue.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'member@mampangarena.id' },
    update: {},
    create: {
      id: 'user-member',
      email: 'member@mampangarena.id',
      password: hashedPassword,
      name: 'Rian',
      phone: '628111222333',
      role: Role.MEMBER,
    },
  });

  const memberUser = await prisma.user.findUnique({ where: { email: 'member@mampangarena.id' } });
  if (memberUser) {
    await prisma.member.upsert({
      where: { userId: memberUser.id },
      update: { type: 'REGULER' },
      create: {
        userId: memberUser.id,
        type: 'REGULER',
        totalBooking: 12,
        totalSpend: 3_600_000,
        lastBookingAt: new Date(),
      },
    });
  }

  // ===== COURTS (FR-COURT-01) =====
  const courtDefs = [
    { id: 'court-a', name: 'Lapangan A', surfaceType: 'vinyl', capacity: 12 },
    { id: 'court-b', name: 'Lapangan B', surfaceType: 'rumput sintetis', capacity: 12 },
    { id: 'court-c', name: 'Lapangan C', surfaceType: 'interlock', capacity: 10 },
  ];

  for (const def of courtDefs) {
    await prisma.court.upsert({
      where: { id: def.id },
      update: {},
      create: { ...def, venueId: venue.id, status: CourtStatus.AKTIF },
    });
  }

  // ===== PRICING RULES (FR-COURT-03/05) =====
  // Weekday: 08-17 off-peak 100k (member 90k), 17-24 peak 150k (member 135k)
  // Weekend: 08-15 150k (member 135k), 15-24 peak 200k (member 180k)
  const courts = await prisma.court.findMany({ where: { venueId: venue.id } });
  for (const court of courts) {
    const existing = await prisma.pricingRule.findFirst({ where: { courtId: court.id } });
    if (existing) continue;
    await prisma.pricingRule.createMany({
      data: [
        { courtId: court.id, dayType: DayType.WEEKDAY, startHour: 8, endHour: 17, price: 100_000, memberPrice: 90_000 },
        { courtId: court.id, dayType: DayType.WEEKDAY, startHour: 17, endHour: 24, price: 150_000, memberPrice: 135_000 },
        { courtId: court.id, dayType: DayType.WEEKEND, startHour: 8, endHour: 15, price: 150_000, memberPrice: 135_000 },
        { courtId: court.id, dayType: DayType.WEEKEND, startHour: 15, endHour: 24, price: 200_000, memberPrice: 180_000 },
      ],
    });
  }

  console.log('Seed selesai:');
  console.log('- Venue: GOR Mampang Arena');
  console.log('- Owner: owner@mampangarena.id / password123');
  console.log('- Admin: admin@mampangarena.id / password123');
  console.log('- Member: member@mampangarena.id / password123');
  console.log('- 3 lapangan + aturan harga weekday/weekend peak & off-peak');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
