"use client";

import { useEffect, useState } from "react";
import WorkTimeChart from "./WorkTimeChart";

export default function AdminPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [attendances, setAttendances] = useState<any[]>([]);
  const loadAttendances = async () => {
  const res = await fetch("/api/attendance-history");
  const data = await res.json();
  setAttendances(data);
};

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") {
      alert("管理者のみアクセスできます");
      window.location.href = "/";
      return;
    }

    loadEmployees();
    loadSummary();
    const grantPaidLeave = async () => {
  const res = await fetch("/api/paid-leave-grant", {
    method: "POST",
  });

  const data = await res.json();

  if (data.success) {
    alert("年次有給を自動付与しました");
    loadEmployees();
  } else {
    alert("処理に失敗しました");
  }
};
    loadDashboard();
    loadLeaveRequests();
    loadAttendances();
  }, []);

  const loadEmployees = async () => {
  
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
  };

  const loadSummary = async () => {
    const res = await fetch("/api/monthly-summary");
    const data = await res.json();
    setSummary(data);
  };
  const grantPaidLeave = async () => {
  const res = await fetch("/api/paid-leave-grant", {
    method: "POST",
  });

  const data = await res.json();

  if (data.success) {
    alert("年次有給を自動付与しました");
    loadEmployees();
  } else {
    alert("処理に失敗しました");
  }
};

  const loadDashboard = async () => {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    setDashboard(data);
  };

  const loadLeaveRequests = async () => {
    const loadAttendances = async () => {
  const res = await fetch("/api/attendance-history");
  const data = await res.json();
  setAttendances(data);
};
    const res = await fetch("/api/leave-request");
    const data = await res.json();
    setLeaveRequests(data);
  };

  const addEmployee = async () => {
    const res = await fetch("/api/employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (data.success) {
      alert("社員を追加しました");
      setEmployees([...employees, data.employee]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("employee");
    }
  };

  const updateEmployee = async (
  id: number,
  name: string,
  email: string,
  role: string,
  hireDate: string | null
) => {
   const res = await fetch("/api/employee", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id,
    name,
    email,
    role,
    hireDate,
  }),
});

    const data = await res.json();

    if (data.success) {
      alert("社員情報を更新しました");
      setEmployees(
        employees.map((employee) =>
          employee.id === id ? data.employee : employee
        )
      );
    }
  };

  const deleteEmployee = async (id: number) => {
    const res = await fetch("/api/employee", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (data.success) {
      alert("社員を削除しました");
      setEmployees(employees.filter((employee) => employee.id !== id));
    }
  };

  const updateLeaveStatus = async (id: number, status: string) => {
    const res = await fetch("/api/leave-request", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json();

    if (data.success) {
      alert("有給申請を更新しました");
      loadLeaveRequests();
      loadEmployees();
    }
  };

  const statusText = (status: string) => {
    if (status === "approved") return "承認済み";
    if (status === "rejected") return "却下";
    return "申請中";
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold">管理者画面</h1>

      {dashboard && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">社員数</h2>
            <p className="mt-2 text-3xl font-bold">{dashboard.totalEmployees}人</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">出勤中</h2>
            <p className="mt-2 text-3xl font-bold">{dashboard.todayWorking}人</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">退勤済み</h2>
            <p className="mt-2 text-3xl font-bold">{dashboard.todayFinished}人</p>
          </div>
        </div>
      )}

      {summary && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">勤務日数</h2>
            <p className="mt-2 text-3xl font-bold">{summary.workingDays}日</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">総勤務時間</h2>
            <p className="mt-2 text-3xl font-bold">{summary.totalWorkTime}</p>
          </div>
        </div>
      )}

      <WorkTimeChart />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">社員管理</h2>

          <div className="mt-4 space-y-3">
            <input className="w-full rounded border p-2" placeholder="氏名" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full rounded border p-2" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" className="w-full rounded border p-2" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />

            <select className="w-full rounded border p-2" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">employee</option>
              <option value="admin">admin</option>
            </select>

            <button onClick={addEmployee} className="w-full rounded bg-blue-600 p-2 text-white">
              社員を追加
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">勤怠管理</h2>
          <p className="mt-2 text-gray-600">全社員の勤怠履歴</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
  <h2 className="text-xl font-bold">CSV出力</h2>
  <p className="mt-2 text-gray-600">勤怠データをCSVで出力</p>

  <a
    href="/api/csv"
    className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white"
  >
    CSVをダウンロード
    <button
  onClick={grantPaidLeave}
  className="ml-2 rounded bg-green-600 px-4 py-2 text-white"
>
  年次有給自動付与
</button>
  </a>
</div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">社員一覧</h2>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">氏名</th>
              <th className="p-3 text-left">メールアドレス</th>
              <th className="p-3 text-left">権限</th>
              <th className="p-3 text-left">有給残日数</th>
              <th className="p-3 text-left">入社日</th>
              <th className="p-3 text-left">操作</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b">
                <td className="p-3">{employee.id}</td>
                <td className="p-3">{employee.name}</td>
                <td className="p-3">{employee.email}</td>
                <td className="p-3">{employee.role}</td>
                <td className="p-3">{employee.paidLeaveDays ?? 10}日</td>
                <td className="p-3">
                  {employee.hireDate
                    ?new Date(employee.hireDate).toLocaleDateString("ja-JP")
                    : "未設定"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      const newName = prompt("新しい氏名", employee.name);
                      const newEmail = prompt("新しいメールアドレス", employee.email);
                      const newRole = prompt("新しい権限 employee / admin", employee.role);
                      const newHireDate = prompt(
  "入社日 yyyy-mm-dd",
  employee.hireDate
    ? new Date(employee.hireDate).toISOString().slice(0, 10)
    : ""
);

                      if (!newName || !newEmail || !newRole) return;

                      updateEmployee(employee.id, newName, newEmail, newRole, newHireDate);
                    }}
                    className="mr-2 rounded bg-green-600 px-3 py-1 text-white"
                  >
                    編集
                  </button>

                  <button
                    onClick={() => deleteEmployee(employee.id)}
                    className="rounded bg-red-600 px-3 py-1 text-white"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
      <div className="mt-8 rounded-xl bg-white p-6 shadow">
  <h2 className="text-2xl font-bold">勤怠履歴一覧</h2>

  <table className="mt-4 w-full border-collapse">
    <thead>
      <tr className="border-b">
        <th className="p-3 text-left">社員名</th>
        <th className="p-3 text-left">日付</th>
        <th className="p-3 text-left">出勤</th>
        <th className="p-3 text-left">退勤</th>
        <th className="p-3 text-left">操作</th>
      </tr>
    </thead>

    <tbody>
      {attendances.map((attendance) => (
        <tr key={attendance.id} className="border-b">
          <td className="p-3">{attendance.employee?.name}</td>
          <td className="p-3">
            {new Date(attendance.date).toLocaleDateString("ja-JP")}
          </td>
          <td className="p-3">
            {attendance.startTime
              ? new Date(attendance.startTime).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "未打刻"}
          </td>
          <td className="p-3">
            {attendance.endTime
              ? new Date(attendance.endTime).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "未打刻"}
          </td>
          <td className="p-3">
         <button
  onClick={async () => {
    const startTime = prompt(
      "出勤時刻 (HH:mm)",
      attendance.startTime
        ? new Date(attendance.startTime).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : ""
    );

    if (startTime === null) return;

    const endTime = prompt(
      "退勤時刻 (HH:mm)",
      attendance.endTime
        ? new Date(attendance.endTime).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : ""
    );

    if (endTime === null) return;

    const breakStart = prompt(
      "休憩開始 (HH:mm)",
      attendance.breakStart
        ? new Date(attendance.breakStart).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : ""
    );

    if (breakStart === null) return;

    const breakEnd = prompt(
      "休憩終了 (HH:mm)",
      attendance.breakEnd
        ? new Date(attendance.breakEnd).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : ""
    );

    if (breakEnd === null) return;

    const res = await fetch("/api/attendance-update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: attendance.id,
        startTime,
        endTime,
        breakStart,
        breakEnd,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("勤怠を更新しました");
      await loadAttendances();
    } else {
      alert("更新に失敗しました");
    }
  }}
  className="rounded bg-green-600 px-3 py-1 text-white"
>
  編集
</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
        <h2 className="text-2xl font-bold">有給申請一覧</h2>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">社員名</th>
              <th className="p-3 text-left">日付</th>
              <th className="p-3 text-left">理由</th>
              <th className="p-3 text-left">状態</th>
              <th className="p-3 text-left">操作</th>
            </tr>
          </thead>

          <tbody>
            {leaveRequests.map((leave) => (
              <tr key={leave.id} className="border-b">
                <td className="p-3">{leave.employee?.name}</td>
                <td className="p-3">{new Date(leave.date).toLocaleDateString("ja-JP")}</td>
                <td className="p-3">{leave.reason}</td>
                <td className="p-3">{statusText(leave.status)}</td>
                <td className="p-3">
                  {leave.status === "pending" ? (
  <>
    <button
      onClick={() => updateLeaveStatus(leave.id, "approved")}
      className="mr-2 rounded bg-green-600 px-3 py-1 text-white"
    >
      承認
    </button>

    <button
      onClick={() => updateLeaveStatus(leave.id, "rejected")}
      className="rounded bg-red-600 px-3 py-1 text-white"
    >
      却下
    </button>
  </>
) : (
  <span className="text-gray-500">処理済み</span>
)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}