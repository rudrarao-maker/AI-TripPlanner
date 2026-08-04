const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const res = await prisma.user.updateMany({
    data: { role: 'admin' }
  });
  console.log(`Updated ${res.count} users to admin.`);
  
  const allUsers = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log(allUsers);
}
run().catch(console.error).finally(() => prisma.$disconnect());
