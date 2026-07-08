import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        message: "メールアドレスとパスワードを入力してください",
      },
      { status: 400 }
    );
  }

  const employee = await prisma.employee.findUnique({
    where: {
      email,
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

  if (employee.password.startsWith("$2")) {
    isMatch = await bcrypt.compare(password, employee.password);
  } else {
    isMatch = employee.password === password;
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

  const { password: _password, ...safeEmployee } = employee;

  return NextResponse.json({
    success: true,
    message: "ログイン成功",
    employee: safeEmployee,
  });
}
