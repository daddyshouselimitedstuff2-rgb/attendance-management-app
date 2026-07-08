import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const body = await request.json();

  const employeeId = Number(body.employeeId);

  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      startTime: {
        not: null,
      },
      endTime: {
        not: null,
      },
    },
  });

  let totalMinutes = 0;

  for (const attendance of attendances) {
    const start = attendance.startTime!;
    const end = attendance.endTime!;

    const minutes = Math.floor(
      (end.getTime() - start.getTime()) / 1000 / 60
    );

    totalMinutes += minutes;
  }

  const workingDays = attendances.length;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return NextResponse.json({
    success: true,
    workingDays,
    totalWorkTime: `${hours}時間${minutes}分`,
  });
}