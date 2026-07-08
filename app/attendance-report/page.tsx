"use client";

import { useEffect, useState } from "react";

type Attendance = {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  employee: {
    name: string;
  };
};

export default function AttendanceReportPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
  new Date().toISOString().slice(0, 7)
);

  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
  async function loadData() {
    const attendanceRes = await fetch(
  `/api/attendance-history?month=${selectedMonth}&employeeId=${selectedEmployee}`
);
    const attendanceData = await attendanceRes.json();

    const employeeRes = await fetch("/api/employees");
    const employeeData = await employeeRes.json();

    setAttendances(attendanceData);
    setEmployees(employeeData);
  }

  loadData();
}, [selectedMonth, selectedEmployee]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("ja-JP");

  const formatTime = (time: string | null) => {
    if (!time) return "-";

    return new Date(time).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateWorkTime = (attendance: Attendance) => {
    if (!attendance.startTime || !attendance.endTime) return "-";

    let minutes =
      (new Date(attendance.endTime).getTime() -
        new Date(attendance.startTime).getTime()) /
      1000 /
      60;

    if (attendance.breakStart && attendance.breakEnd) {
      minutes -=
        (new Date(attendance.breakEnd).getTime() -
          new Date(attendance.breakStart).getTime()) /
        1000 /
        60;
    }

    const hours = Math.floor(minutes / 60);
    const remainMinutes = Math.floor(minutes % 60);

    return `${hours}時間${remainMinutes}分`;
  };
const filteredAttendances = selectedEmployee
  ? attendances.filter(
      (attendance: any) =>
        String(attendance.employee?.id) === selectedEmployee
    )
  : attendances;
  return (
    <main className="mx-auto max-w-5xl bg-white p-10 text-black">
      
<div className="mb-8 flex items-center justify-between print:hidden">
  <div className="flex items-center gap-4">
    <div>
      <label className="mr-2 font-bold">対象月</label>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="rounded border p-2"
      />
    </div>

    <div>
      <label className="mr-2 font-bold">社員</label>
      <select
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
        className="rounded border p-2"
      >
        <option value="">全社員</option>

        {employees.map((employee: any) => (
          <option key={employee.id} value={employee.id}>
            {employee.name}
          </option>
        ))}
      </select>
    </div>
  </div>

  <button
    onClick={() => window.print()}
    className="rounded bg-blue-600 px-4 py-2 text-white"
  >
    印刷（PDF保存）
  </button>
</div>
      <div className="text-center">
        <p className="text-sm">勤怠管理システム</p>
        <h1 className="mt-3 text-4xl font-bold tracking-widest">勤務表</h1>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <div>対象月：2026年7月</div>
        <div>作成日：{new Date().toLocaleDateString("ja-JP")}</div>
      </div>

      <table className="mt-8 w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">社員名</th>
            <th className="border p-2">日付</th>
            <th className="border p-2">出勤</th>
            <th className="border p-2">退勤</th>
            <th className="border p-2">休憩開始</th>
            <th className="border p-2">休憩終了</th>
            <th className="border p-2">勤務時間</th>
          </tr>
        </thead>

        <tbody>
          {filteredAttendances.map((attendance) => (
            <tr key={attendance.id}>
              <td className="border p-2">{attendance.employee?.name}</td>
              <td className="border p-2">{formatDate(attendance.date)}</td>
              <td className="border p-2">{formatTime(attendance.startTime)}</td>
              <td className="border p-2">{formatTime(attendance.endTime)}</td>
              <td className="border p-2">{formatTime(attendance.breakStart)}</td>
              <td className="border p-2">{formatTime(attendance.breakEnd)}</td>
              <td className="border p-2">{calculateWorkTime(attendance)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="border-b border-black pb-8"></div>
          <p className="mt-2">社員</p>
        </div>

        <div>
          <div className="border-b border-black pb-8"></div>
          <p className="mt-2">上長</p>
        </div>

        <div>
          <div className="border-b border-black pb-8"></div>
          <p className="mt-2">管理者</p>
        </div>
      </div>
    </main>
  );
}