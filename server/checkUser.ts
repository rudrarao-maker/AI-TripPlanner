import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUser() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => `${u.email} - ${u.role}`));
  process.exit(0);
}

checkUser();
