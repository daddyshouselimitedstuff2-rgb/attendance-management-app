"use client";

import { useEffect, useState } from "react";

type Attendance = {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  breakStart: string | null;
  breakEnd: string | null;
};

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    async function loadAttendances() {
      const res = await fetch(`/api/attendance-history?month=${selectedMonth}`);
      const data = await res.json();
      setAttendances(data);
    }

    loadAttendances();
  }, [selectedMonth]);

  const formatTime = (value: string | null) => {
    if (!value) return "未打刻";

    return new Date(value).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateWorkTime = (attendance: Attendance) => {
    if (!attendance.startTime || !attendance.endTime) {
      return "未確定";
    }

    let workSeconds =
      (new Date(attendance.endTime).getTime() -
        new Date(attendance.startTime).getTime()) /
      1000;

    if (attendance.breakStart && attendance.breakEnd) {
      workSeconds -=
        (new Date(attendance.breakEnd).getTime() -
          new Date(attendance.breakStart).getTime()) /
        1000;
    }

    const hours = Math.floor(workSeconds / 3600);
    const minutes = Math.floor((workSeconds % 3600) / 60);
    const seconds = Math.floor(workSeconds % 60);

    return `${hours}時間${String(minutes).padStart(2, "0")}分${String(
      seconds
    ).padStart(2, "0")}秒`;
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("ja-JP");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">勤怠履歴</h1>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded border p-2"
        />
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">日付</th>
              <th className="p-3 text-left">出勤</th>
              <th className="p-3 text-left">退勤</th>
              <th className="p-3 text-left">勤務時間</th>
            </tr>
          </thead>

          <tbody>
            {attendances.map((attendance) => (
              <tr key={attendance.id} className="border-b">
                <td className="p-3">{formatDate(attendance.date)}</td>
                <td className="p-3">{formatTime(attendance.startTime)}</td>
                <td className="p-3">{formatTime(attendance.endTime)}</td>
                <td className="p-3">{calculateWorkTime(attendance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}