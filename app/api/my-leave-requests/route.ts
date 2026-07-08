import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
