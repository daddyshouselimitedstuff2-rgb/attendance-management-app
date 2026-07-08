import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const body = await request.json();

  const employee = await prisma.employee.findUnique({
    where: {
      id: body.employeeId,
    },
    include: {
      leaveRequests: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    employee,
    paidLeaveDays: employee?.paidLeaveDays ?? 0,
    leaveRequests: employee?.leaveRequests ?? [],
  });
}