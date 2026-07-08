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

 const hashedPassword = await bcrypt.hash(body.password, 10);

const employee = await prisma.employee.create({
  data: {
    name: body.name,
    email: body.email,
    password: hashedPassword,
    role: body.role,
  },
});

  return NextResponse.json({
    success: true,
    employee,
  });
}
export async function DELETE(request: Request) {
  const body = await request.json();

  await prisma.employee.delete({
    where: {
      id: body.id,
    },
  });

  return NextResponse.json({
    success: true,
    message: "社員を削除しました",
  });
}
export async function PUT(request: Request) {
  const body = await request.json();

 const employee = await prisma.employee.update({
  where: {
    id: body.id,
  },
  data: {
    name: body.name,
    email: body.email,
    role: body.role,
    hireDate: body.hireDate
      ? new Date(body.hireDate)
      : null,
  },
});

  return NextResponse.json({
    success: true,
    message: "社員情報を更新しました",
    employee,
  });
}