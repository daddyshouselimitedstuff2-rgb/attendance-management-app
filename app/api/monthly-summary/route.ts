import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
