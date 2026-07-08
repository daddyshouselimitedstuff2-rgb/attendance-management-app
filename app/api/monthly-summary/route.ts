import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
  const attendances = await prisma.attendance.findMany({
    where: {
      startTime: { not: null },
      endTime: { not: null },
    },
  });

  let totalMinutes = 0;

  for (const attendance of attendances) {
    let minutes =
      (attendance.endTime!.getTime() - attendance.startTime!.getTime()) /
      1000 /
      60;

    if (attendance.breakStart && attendance.breakEnd) {
      minutes -=
        (attendance.breakEnd.getTime() - attendance.breakStart.getTime()) /
        1000 /
        60;
    }

    totalMinutes += minutes;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  return NextResponse.json({
    workingDays: attendances.length,
    totalWorkTime: `${hours}時間${minutes}分`,
  });
}