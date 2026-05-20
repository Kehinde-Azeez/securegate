import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // optional: enable query logging for debugging
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  // Attach to global object in dev to preserve across hot reloads
  global.prisma = prisma;
}
