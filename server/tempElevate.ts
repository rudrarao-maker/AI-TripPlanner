import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function makeAdmin() {
  await prisma.user.updateMany({
    where: { email: "user_3HRu9H06KGELTUSB8KMyZeOllGM@clerk.local" },
    data: { role: "admin" }
  });
  console.log("Elevated to admin!");
}
makeAdmin();
