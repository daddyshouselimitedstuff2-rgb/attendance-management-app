import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
  const email = "admin@example.com";
  const password = "admin123456";

  const exists = await prisma.employee.findUnique({
    where: { email },
  });

  if (exists) {
    return NextResponse.json({
      success: false,
      message: "管理者はすでに存在します",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const employee = await prisma.employee.create({
    data: {
      name: "管理者",
      email,
      password: hashedPassword,
      role: "admin",
      paidLeaveDays: 10,
      hireDate: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    message: "管理者を作成しました",
    email,
    password,
    employee,
  });
}