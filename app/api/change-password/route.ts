import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function PUT(request: Request) {
  const body = await request.json();

  const employee = await prisma.employee.findUnique({
    where: {
      id: body.employeeId,
    },
  });

  if (!employee) {
    return NextResponse.json(
      { success: false, message: "社員が見つかりません" },
      { status: 404 }
    );
  }

  let isMatch = false;

  if (employee.password.startsWith("$2b$")) {
    isMatch = await bcrypt.compare(body.currentPassword, employee.password);
  } else {
    isMatch = employee.password === body.currentPassword;
  }

  if (!isMatch) {
    return NextResponse.json(
      { success: false, message: "現在のパスワードが違います" },
      { status: 401 }
    );
  }

  const hashedPassword = await bcrypt.hash(body.newPassword, 10);

  await prisma.employee.update({
    where: {
      id: body.employeeId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return NextResponse.json({
    success: true,
    message: "パスワードを変更しました",
  });
}