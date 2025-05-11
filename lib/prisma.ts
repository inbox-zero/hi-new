import { PrismaClient } from "@prisma/client";

// Declare a global variable to hold the Prisma Client instance.
// This helps in reusing the same instance across hot reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// biome-ignore lint/suspicious/noRedeclare: <explanation>
export const prisma =
  global.prisma ||
  new PrismaClient({
    // You can add Prisma Client options here, e.g., log levels
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
