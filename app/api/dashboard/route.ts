import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
  const employees = await prisma.employee.count();

  const attendances = await prisma.attendance.findMany();

  const today = new Date().toLocaleDateString("ja-JP");

  const todayAttendances = attendances.filter(
    (attendance) =>
      new Date(attendance.date).toLocaleDateString("ja-JP") === today
  );

  const working = todayAttendances.filter(
    (attendance) => attendance.startTime && !attendance.endTime
  ).length;

  const finished = todayAttendances.filter(
    (attendance) => attendance.endTime
  ).length;

  return NextResponse.json({
    totalEmployees: employees,
    todayWorking: working,
    todayFinished: finished,
  });
}