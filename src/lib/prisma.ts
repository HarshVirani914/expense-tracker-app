import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString,
    max: process.env.VERCEL === "1" ? 1 : 10,
    // keep TCP connection alive across warm Lambda invocations
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
    // free idle connections quickly to avoid Postgres max_connections
    idleTimeoutMillis: 10_000,
    // fail fast rather than hang if DB is unreachable
    connectionTimeoutMillis: 5_000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
