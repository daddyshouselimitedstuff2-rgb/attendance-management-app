import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const employees = await prisma.employee.findMany();

  const today = new Date();

  for (const employee of employees) {
    if (!employee.hireDate) continue;

    const hireDate = new Date(employee.hireDate);

    const years =
      today.getFullYear() - hireDate.getFullYear() -
      (
        today.getMonth() < hireDate.getMonth() ||
        (
          today.getMonth() === hireDate.getMonth() &&
          today.getDate() < hireDate.getDate()
        )
          ? 1
          : 0
      );

    let grantDays = employee.paidLeaveDays;

    if (years >= 6) {
      grantDays = 20;
    } else if (years >= 5) {
      grantDays = 18;
    } else if (years >= 4) {
      grantDays = 16;
    } else if (years >= 3) {
      grantDays = 14;
    } else if (years >= 2) {
      grantDays = 12;
    } else if (years >= 1) {
      grantDays = 10;
    }

    await prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        paidLeaveDays: grantDays,
      },
    });
  }

  return NextResponse.json({
    success: true,
    message: "有給を自動付与しました",
  });
}
