import { prisma } from "@/lib/prisma";

const formatDate = (value: Date | null) => {
  if (!value) return "";
  return value.toLocaleDateString("ja-JP");
};

const formatTime = (value: Date | null) => {
  if (!value) return "";
  return value.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export async function GET() {
  const attendances = await prisma.attendance.findMany({
    include: {
      employee: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  const header = "社員名,メールアドレス,日付,出勤,退勤\n";

  const rows = attendances
    .map((attendance) => {
      return [
        attendance.employee.name,
        attendance.employee.email,
        formatDate(attendance.date),
        formatTime(attendance.startTime),
        formatTime(attendance.endTime),
      ].join(",");
    })
    .join("\n");

  const csv = "\uFEFF" + header + rows;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="attendance.csv"',
    },
  });
}
