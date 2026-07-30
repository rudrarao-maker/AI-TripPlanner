import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tripcraft.ai' },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      email: 'admin@tripcraft.ai',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@tripcraft.ai' },
    update: {
      password: hashedPassword,
      role: 'user',
    },
    create: {
      email: 'user@tripcraft.ai',
      name: 'Test User',
      password: hashedPassword,
      role: 'user',
    },
  });

  console.log('Database seeded with admin and test user! Password is: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
