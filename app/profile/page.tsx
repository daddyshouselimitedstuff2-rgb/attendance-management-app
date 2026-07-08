"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [employee, setEmployee] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const savedEmployee = localStorage.getItem("employee");

    if (!savedEmployee) {
      window.location.href = "/login";
      return;
    }

    setEmployee(JSON.parse(savedEmployee));
  }, []);

  const changePassword = async () => {
    if (!employee) return;

    if (newPassword !== confirmPassword) {
      alert("新しいパスワードが一致しません");
      return;
    }

    const res = await fetch("/api/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: employee.id,
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("パスワードを変更しました");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      alert(data.message);
    }
  };

  if (!employee) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">プロフィール</h1>

        <div className="mt-6 space-y-3">
          <p><span className="font-bold">氏名：</span>{employee.name}</p>
          <p><span className="font-bold">メール：</span>{employee.email}</p>
          <p><span className="font-bold">権限：</span>{employee.role}</p>
        </div>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold">パスワード変更</h2>

          <div className="mt-4 space-y-3">
            <input
              type="password"
              placeholder="現在のパスワード"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded border p-2"
            />

            <input
              type="password"
              placeholder="新しいパスワード"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded border p-2"
            />

            <input
              type="password"
              placeholder="新しいパスワード（確認）"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded border p-2"
            />

            <button
              onClick={changePassword}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              パスワードを変更
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}