import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "@/lib/logger";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  { name: "Family", color: "#EF4444", isDefault: true },
  { name: "Friends", color: "#F59E0B", isDefault: true },
  { name: "Lifestyle", color: "#8B5CF6", isDefault: true },
  { name: "Food", color: "#10B981", isDefault: true },
  { name: "Transportation", color: "#3B82F6", isDefault: true },
  { name: "Entertainment", color: "#EC4899", isDefault: true },
  { name: "Shopping", color: "#F97316", isDefault: true },
  { name: "Bills & Utilities", color: "#06B6D4", isDefault: true },
  { name: "Healthcare", color: "#14B8A6", isDefault: true },
  { name: "Education", color: "#6366F1", isDefault: true },
  { name: "Other", color: "#6B7280", isDefault: true },
];

const main = async () => {
  logger.info("Starting database seed (default categories only)...");

  let created = 0;
  let skipped = 0;

  for (const category of DEFAULT_CATEGORIES) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: category.name,
        isDefault: true,
        userId: null,
      },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: category,
      });
      created += 1;
      logger.info(`Created default category: ${category.name}`);
    } else {
      skipped += 1;
      logger.info(`Category already exists: ${category.name}`);
    }
  }

  logger.info(
    `Seed finished. Default categories created: ${created}, skipped: ${skipped}.`,
  );
};

main()
  .catch((e) => {
    logger.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
