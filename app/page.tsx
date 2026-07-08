"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [startTime, setStartTime] = useState("未打刻");
  const [endTime, setEndTime] = useState("未打刻");
  const [breakStart, setBreakStart] = useState("未打刻");
  const [breakEnd, setBreakEnd] = useState("未打刻");
  const [workTime, setWorkTime] = useState("0時間00分");
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [paidLeaveDays, setPaidLeaveDays] = useState(0);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(
  new Date().toISOString().slice(0, 7)
);

  const getNowTime = () => {
    return new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const calculateWorkTime = (
  start: string,
  end: string,
  breakStartTime: string,
  breakEndTime: string
) => {
  if (
    start === "未打刻" ||
    end === "未打刻" ||
    breakStartTime === "未打刻" ||
    breakEndTime === "未打刻"
  ) {
    return "0時間00分";
  }

  const today = new Date().toDateString();

  const startDate = new Date(`${today} ${start}`);
  const endDate = new Date(`${today} ${end}`);
  const breakStartDate = new Date(`${today} ${breakStartTime}`);
  const breakEndDate = new Date(`${today} ${breakEndTime}`);

  const workMinutes =
    (endDate.getTime() - startDate.getTime()) / 1000 / 60 -
    (breakEndDate.getTime() - breakStartDate.getTime()) / 1000 / 60;

  const hours = Math.floor(workMinutes / 60);
  const minutes = Math.floor(workMinutes % 60);

  return `${hours}時間${String(minutes).padStart(2, "0")}分`;
};
const requestLeave = async () => {
  const employee = JSON.parse(localStorage.getItem("employee") || "{}");

  if (!leaveDate) {
    alert("有給日を選択してください");
    return;
  }

  const res = await fetch("/api/leave-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      employeeId: employee.id,
      date: leaveDate,
      reason: leaveReason,
    }),
  });

  const data = await res.json();

  if (data.success) {
    alert("有給を申請しました");
    setLeaveDate("");
    setLeaveReason("");
  }
};
useEffect(() => {
  if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "/login";
  return;
}
  async function loadAttendance() {
    const res = await fetch("/api/attendance");
    const data = await res.json();

    if (data.attendance?.startTime) {
      setStartTime(
        new Date(data.attendance.startTime).toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
    if (data.workTime) {
      setWorkTime(data.workTime);
    }
  }

  loadAttendance();
  async function loadMyLeave() {
  const employee = JSON.parse(localStorage.getItem("employee") || "{}");

  const res = await fetch("/api/my-leave-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  employeeId: employee.id,
  month: selectedMonth,
}),
  });

  const data = await res.json();

  if (data.success) {
    setPaidLeaveDays(data.paidLeaveDays);
    setLeaveRequests(data.leaveRequests);
  }
}

loadMyLeave();
async function loadMonthlySummary() {
  const employee = JSON.parse(localStorage.getItem("employee") || "{}");

  const res = await fetch("/api/my-monthly-summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      employeeId: employee.id,
    }),
  });

  const data = await res.json();

  if (data.success) {
    setMonthlySummary(data);
  }
}

loadMonthlySummary();
}, [selectedMonth]);
  return (
    <main className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between bg-white p-4 shadow">
  <h1 className="text-2xl font-bold">勤怠管理システム</h1>

  <div className="flex gap-2">
    <button
      onClick={() => {
        window.location.href = "/attendance";
      }}
      className="rounded bg-blue-600 px-4 py-2 text-white"
    >
      勤務履歴
    </button>

    <button
      onClick={() => {
        window.location.href = "/profile";
      }}
      className="rounded bg-green-600 px-4 py-2 text-white"
    >
      プロフィール
    </button>

    <button
      onClick={() => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("role");
        localStorage.removeItem("employee");
        window.location.href = "/login";
      }}
      className="rounded bg-gray-600 px-4 py-2 text-white"
    >
      ログアウト
    </button>
  </div>
</header>

      <div className="mx-auto max-w-6xl p-6">
        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">本日の打刻</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
           <button
  onClick={async () => {
    const now = getNowTime();
setStartTime(now);

    await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "start",
        time: now,
      }),
    });
  }}
  className="rounded bg-blue-600 p-3 text-white"
>
  出勤
</button>
         <button
  onClick={async () => {
    const now = getNowTime();
    setEndTime(now);
    

    await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "end",
        time: now,
      }),
    });
    setTimeout(() => {
  setWorkTime(calculateWorkTime(startTime, now, breakStart, breakEnd));
}, 100);
  }}
  className="rounded bg-red-600 p-3 text-white"
>
  退勤
</button>
            <button
  onClick={async () => {
    const now = getNowTime();
    setBreakStart(now);

    await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "breakStart",
        time: now,
      }),
    });
  }}
  className="rounded bg-yellow-500 p-3 text-white"
>
  休憩開始
</button>
           <button
  onClick={async () => {
    const now = getNowTime();
    setBreakEnd(now);

    await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "breakEnd",
        time: now,
      }),
    });
  }}
  className="rounded bg-green-600 p-3 text-white"
>
  休憩終了
</button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">出勤時刻</p>
            <p className="mt-2 text-2xl font-bold">{startTime}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">退勤時刻</p>
            <p className="mt-2 text-2xl font-bold">{endTime}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">休憩開始</p>
            <p className="mt-2 text-2xl font-bold">{breakStart}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">休憩終了</p>
            <p className="mt-2 text-2xl font-bold">{breakEnd}</p>
          </div>
        <div className="rounded-xl bg-white p-5 shadow">
  <p className="text-sm text-gray-500">勤務時間</p>
  <p className="mt-2 text-2xl font-bold">{workTime}</p>
</div>
</section>

{monthlySummary && (
  <section className="mt-6 rounded-xl bg-white p-6 shadow">
    <div className="flex items-center justify-between">
  <h2 className="text-xl font-bold">勤務集計</h2>

  <input
    type="month"
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="rounded border p-2"
  />
</div>

    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border p-4">
        <p className="text-gray-500">勤務日数</p>
        <p className="mt-2 text-3xl font-bold">
          {monthlySummary.workingDays}日
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-gray-500">総勤務時間</p>
        <p className="mt-2 text-3xl font-bold">
          {monthlySummary.totalWorkTime}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-gray-500">残業時間</p>
        <p className="mt-2 text-3xl font-bold">
          {monthlySummary.overtime}
        </p>
      </div>
    </div>
  </section>
)}

<section className="mt-6 rounded-xl bg-white p-6 shadow">
  <h2 className="text-xl font-bold">有給情報</h2>

  <p className="mt-3 text-2xl font-bold">
    残り有給：{paidLeaveDays}日
  </p>

  <h3 className="mt-6 font-bold">有給申請履歴</h3>

  <table className="mt-3 w-full border-collapse">
    <thead>
      <tr className="border-b">
        <th className="p-3 text-left">日付</th>
        <th className="p-3 text-left">理由</th>
        <th className="p-3 text-left">状態</th>
      </tr>
    </thead>

    <tbody>
      {leaveRequests.map((leave) => (
        <tr key={leave.id} className="border-b">
          <td className="p-3">
            {new Date(leave.date).toLocaleDateString("ja-JP")}
          </td>
          <td className="p-3">{leave.reason}</td>
          <td className="p-3">
            {leave.status === "approved"
              ? "承認済み"
              : leave.status === "rejected"
              ? "却下"
              : "申請中"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</section>

<section className="mt-6 rounded-xl bg-white p-6 shadow">
  <h2 className="text-xl font-bold">有給申請</h2>

  <div className="mt-4 space-y-3">
    <input
      type="date"
      value={leaveDate}
      onChange={(e) => setLeaveDate(e.target.value)}
      className="w-full rounded border p-2"
    />

    <textarea
      placeholder="理由"
      value={leaveReason}
      onChange={(e) => setLeaveReason(e.target.value)}
      className="w-full rounded border p-2"
      rows={3}
    />

    <button
      onClick={requestLeave}
      className="rounded bg-purple-600 px-4 py-2 text-white"
    >
      有給を申請する
    </button>
  </div>
</section>
      </div>
    </main>
  );
}