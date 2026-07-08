import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
  const attendances = await prisma.attendance.findMany({
    include: {
      employee: true,
    },
  });

  const workTimeByEmployee: Record<string, number> = {};

  attendances.forEach((attendance) => {
    if (attendance.startTime && attendance.endTime) {
      const workSeconds =
        (attendance.endTime.getTime() - attendance.startTime.getTime()) / 1000;

      const workMinutes = Math.round(workSeconds / 60);
      const employeeName = attendance.employee.name;

      if (!workTimeByEmployee[employeeName]) {
        workTimeByEmployee[employeeName] = 0;
      }

      workTimeByEmployee[employeeName] += workMinutes;
    }
  });

  const result = Object.entries(workTimeByEmployee).map(([name, minutes]) => ({
    name,
    hours: minutes,
  }));

  return NextResponse.json(result);
}