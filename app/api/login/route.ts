import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const body = await request.json();

  const employee = await prisma.employee.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!employee) {
    return NextResponse.json(
      {
        success: false,
        message: "メールアドレスが存在しません",
      },
      { status: 404 }
    );
  }

 let isMatch = false;

if (employee.password.startsWith("$2b$")) {
  isMatch = await bcrypt.compare(body.password, employee.password);
} else {
  isMatch = employee.password === body.password;
}

if (!isMatch) {
  return NextResponse.json(
    {
      success: false,
      message: "パスワードが違います",
    },
    { status: 401 }
  );
}

  return NextResponse.json({
    success: true,
    message: "ログイン成功",
    employee,
  });
}