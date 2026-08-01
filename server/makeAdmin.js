const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' }
    });
    console.log('Updated user ' + user.email + ' to admin');
  } else {
    console.log('No user found');
  }
}
run();
