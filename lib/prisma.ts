// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Avoid multiple PrismaClient instances in dev
  // (Next.js hot reload can otherwise cause "too many clients" error)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
