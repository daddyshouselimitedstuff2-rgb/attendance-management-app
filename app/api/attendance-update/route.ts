import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

const createDateTime = (baseDate: string, time: string) => {
  const date = new Date(baseDate);
  const [hours, minutes] = time.split(":").map(Number);

  date.setHours(hours, minutes, 0, 0);

  return date;
};

export async function PUT(request: Request) {
  const body = await request.json();

  const attendance = await prisma.attendance.findUnique({
    where: {
      id: body.id,
    },
  });

  if (!attendance) {
    return NextResponse.json(
      { success: false, message: "勤怠データが見つかりません" },
      { status: 404 }
    );
  }

  const updatedAttendance = await prisma.attendance.update({
    where: {
      id: body.id,
    },
    data: {
      startTime: body.startTime
        ? createDateTime(attendance.date.toISOString(), body.startTime)
        : null,
      endTime: body.endTime
        ? createDateTime(attendance.date.toISOString(), body.endTime)
        : null,
      breakStart: body.breakStart
        ? createDateTime(attendance.date.toISOString(), body.breakStart)
        : null,
      breakEnd: body.breakEnd
        ? createDateTime(attendance.date.toISOString(), body.breakEnd)
        : null,
    },
  });

  return NextResponse.json({
    success: true,
    attendance: updatedAttendance,
  });
}