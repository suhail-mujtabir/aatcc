// app/api/change-password/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Old and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 🔍 Get current student
    const student = await prisma.student.findUnique({
      where: { userId: session.user.userId },
    });

    if (!student) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ❌ Check old password matches
    const isValid = await bcrypt.compare(oldPassword, student.password);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    // ✅ Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.student.update({
      where: { userId: session.user.userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
