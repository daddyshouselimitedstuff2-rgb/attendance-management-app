import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 一覧取得
export async function GET() {
  const requests = await prisma.leaveRequest.findMany({
    include: {
      employee: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return NextResponse.json(requests);
}

// 有給申請
export async function POST(request: Request) {
  const body = await request.json();

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: body.employeeId,
      date: new Date(body.date),
      reason: body.reason,
    },
  });

  return NextResponse.json({
    success: true,
    leave,
  });
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const oldLeave = await prisma.leaveRequest.findUnique({
      where: {
        id: Number(body.id),
      },
    });

    if (!oldLeave) {
      return NextResponse.json(
        { success: false, message: "申請が見つかりません" },
        { status: 404 }
      );
    }

    const leave = await prisma.leaveRequest.update({
      where: {
        id: Number(body.id),
      },
      data: {
        status: body.status,
      },
    });

    if (body.status === "approved" && oldLeave.status !== "approved") {
      await prisma.employee.update({
        where: {
          id: leave.employeeId,
        },
        data: {
          paidLeaveDays: {
            decrement: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      leave,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "有給申請の更新に失敗しました",
      },
      { status: 500 }
    );
  }
}
