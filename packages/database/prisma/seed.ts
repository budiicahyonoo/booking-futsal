import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('budiicahyonoo', 10);
  
  await prisma.user.upsert({
    where: { email: 'budicahyono.dev@gmail.com' },
    update: {},
    create: {
      email: 'budicahyono.dev@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Budi Cahyono',
    },
  });
}

main();