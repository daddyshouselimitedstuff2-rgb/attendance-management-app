import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const employeeId = searchParams.get("employeeId");

  let where: any = {};

  if (month) {
  const startDate = new Date(`${month}-01T00:00:00`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  where.date = {
    gte: startDate,
    lt: endDate,
  };
}

if (employeeId) {
  where.employeeId = Number(employeeId);
}

  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      employee: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return NextResponse.json(attendances);
}