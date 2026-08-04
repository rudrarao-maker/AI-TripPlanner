import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testCreate() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password123!", salt);

    const newUser = await prisma.user.create({
      data: {
        name: "Alice Smith",
        email: "alice.smith@example.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        verified: true,
      },
    });
    console.log("Created successfully:", newUser);
  } catch (err) {
    console.error("Failed to create:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate();
