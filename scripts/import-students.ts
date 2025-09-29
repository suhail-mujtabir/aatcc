import { PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import { parse } from "csv-parse";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const records: { userId: string; password: string }[] = [];

  // Adjust path if your CSV is elsewhere
  const parser = createReadStream("students.csv").pipe(
    parse({ columns: true, skip_empty_lines: true })
  );

  for await (const record of parser) {
    records.push({
      userId: record.userId,      // must match column name in CSV
      password: record.password,  // must match column name in CSV
    });
  }

  for (const student of records) {
    const hashedPassword = await bcrypt.hash(student.password, 10);

    await prisma.student.upsert({
      where: { userId: student.userId },
      update: { password: hashedPassword },
      create: {
        userId: student.userId,
        password: hashedPassword,
        mustChangePassword: true, // force first login change
      },
    });

    console.log(`Imported: ${student.userId}`);
  }

  console.log("✅ Import complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
