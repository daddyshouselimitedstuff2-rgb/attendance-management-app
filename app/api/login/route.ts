import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();

  const employee = await prisma.employee.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!employee) {
    return NextResponse.json(
      {
        success: false,
        message: "メールアドレスが存在しません",
      },
      { status: 404 }
    );
  }

 let isMatch = false;

if (employee.password.startsWith("$2b$")) {
  isMatch = await bcrypt.compare(body.password, employee.password);
} else {
  isMatch = employee.password === body.password;
}

if (!isMatch) {
  return NextResponse.json(
    {
      success: false,
      message: "パスワードが違います",
    },
    { status: 401 }
  );
}

  return NextResponse.json({
    success: true,
    message: "ログイン成功",
    employee,
  });
}
