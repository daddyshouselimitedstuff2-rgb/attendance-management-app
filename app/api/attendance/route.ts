import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const employee = await prisma.employee.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "テスト社員",
      email: "test@example.com",
      password: "123456",
      role: "employee",
    },
  });

  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId: employee.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
let workTime = "0時間00分";

if (
  attendance?.startTime &&
  attendance?.endTime &&
  attendance?.breakStart &&
  attendance?.breakEnd
) {
  const workMinutes =
    (new Date(attendance.endTime).getTime() -
      new Date(attendance.startTime).getTime()) /
      1000 /
      60 -
    (new Date(attendance.breakEnd).getTime() -
      new Date(attendance.breakStart).getTime()) /
      1000 /
      60;

  const totalSeconds = Math.floor(workMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

workTime = `${hours}時間${String(minutes).padStart(2, "0")}分${String(seconds).padStart(2, "0")}秒`;
}
  return NextResponse.json({
  message: "勤怠データ取得成功",
  employee,
  attendance,
  workTime,
});
}
export async function POST(request: Request) {
  const body = await request.json();

  console.log("POST受信:", body.type);

  const employee = await prisma.employee.findUnique({
    where: {
      email: "test@example.com",
    },
  });

  if (!employee) {
    return NextResponse.json(
      { success: false, message: "社員が見つかりません" },
      { status: 404 }
    );
  }

  const now = new Date();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayAttendance = await prisma.attendance.findFirst({
    where: {
      employeeId: employee.id,
      startTime: {
        not: null,
      },
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let attendance;

  if (body.type === "start") {
    attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: now,
        startTime: now,
      },
    });
  }

  if (body.type === "end") {
    if (!todayAttendance) {
      return NextResponse.json(
        { success: false, message: "出勤データがありません" },
        { status: 400 }
      );
    }

    attendance = await prisma.attendance.update({
      where: {
        id: todayAttendance.id,
      },
      data: {
        endTime: now,
      },
    });
  }

  if (body.type === "breakStart") {
    if (!todayAttendance) {
      return NextResponse.json(
        { success: false, message: "出勤データがありません" },
        { status: 400 }
      );
    }

    attendance = await prisma.attendance.update({
      where: {
        id: todayAttendance.id,
      },
      data: {
        breakStart: now,
      },
    });
  }

  if (body.type === "breakEnd") {
    if (!todayAttendance) {
      return NextResponse.json(
        { success: false, message: "出勤データがありません" },
        { status: 400 }
      );
    }

    attendance = await prisma.attendance.update({
      where: {
        id: todayAttendance.id,
      },
      data: {
        breakEnd: now,
      },
    });
  }

  return NextResponse.json({
    success: true,
    message: "打刻を保存しました",
    data: attendance,
  });
}

  
