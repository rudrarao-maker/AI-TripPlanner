import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
  for (const u of users) {
    console.log(u.email, u.role);
  }
  const result = await prisma.user.updateMany({
    data: { role: 'admin' }
  });
  console.log('Updated users to admin:', result.count);
}
run().catch(console.error).finally(() => prisma.$disconnect());
