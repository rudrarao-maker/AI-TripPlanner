/**
 * Database Backup Script
 * 
 * Usage: npx tsx scripts/backup-db.ts
 * 
 * Creates a timestamped SQL dump of the database using pg_dump.
 * Keeps the last 7 daily backups and 4 weekly backups.
 * 
 * Prerequisites:
 * - pg_dump must be available in PATH
 * - DATABASE_URL must be set in .env.local
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const BACKUP_DIR = join(process.cwd(), "backups");
const MAX_DAILY_BACKUPS = 7;
const MAX_WEEKLY_BACKUPS = 4;

function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function ensureBackupDir(): void {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  }
}

function cleanOldBackups(): void {
  const files = readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .reverse();

  // Keep daily backups
  const dailyBackups = files.filter((f) => f.startsWith("daily-"));
  if (dailyBackups.length > MAX_DAILY_BACKUPS) {
    const toDelete = dailyBackups.slice(MAX_DAILY_BACKUPS);
    toDelete.forEach((f) => {
      unlinkSync(join(BACKUP_DIR, f));
      console.log(`🗑️  Removed old daily backup: ${f}`);
    });
  }

  // Keep weekly backups
  const weeklyBackups = files.filter((f) => f.startsWith("weekly-"));
  if (weeklyBackups.length > MAX_WEEKLY_BACKUPS) {
    const toDelete = weeklyBackups.slice(MAX_WEEKLY_BACKUPS);
    toDelete.forEach((f) => {
      unlinkSync(join(BACKUP_DIR, f));
      console.log(`🗑️  Removed old weekly backup: ${f}`);
    });
  }
}

async function main(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not set in .env.local");
    process.exit(1);
  }

  ensureBackupDir();

  const timestamp = getTimestamp();
  const isWeekly = new Date().getDay() === 0; // Sunday
  const prefix = isWeekly ? "weekly" : "daily";
  const filename = `${prefix}-${timestamp}.sql`;
  const filepath = join(BACKUP_DIR, filename);

  console.log(`💾 Starting ${prefix} backup...`);
  console.log(`📄 Output: ${filepath}`);

  try {
    execSync(`pg_dump "${dbUrl}" --no-owner --no-privileges --clean --if-exists > "${filepath}"`, {
      stdio: "inherit",
      timeout: 120_000, // 2 minute timeout
    });

    console.log(`✅ Backup completed successfully: ${filename}`);
    
    // Cleanup old backups
    cleanOldBackups();
    
    console.log("🧹 Cleanup completed.");
  } catch (error: any) {
    console.error("❌ Backup failed:", error.message);
    console.error("");
    console.error("Make sure pg_dump is installed and DATABASE_URL is correct.");
    console.error("Install PostgreSQL client tools: https://www.postgresql.org/download/");
    process.exit(1);
  }
}

main();
