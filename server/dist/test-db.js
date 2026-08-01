"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log("Connecting to database...");
        await prisma.$connect();
        console.log("Connected successfully!");
        const userCount = await prisma.user.count();
        console.log(`Number of users in DB: ${userCount}`);
    }
    catch (err) {
        console.error("Database connection failed:", err);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
