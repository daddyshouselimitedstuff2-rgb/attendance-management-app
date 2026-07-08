"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">ログイン</h1>

        <p className="mt-2 text-gray-500">
          勤怠管理システムへログインしてください
        </p>

        <div className="mt-6">
          <label>メールアドレス</label>
          <input
            type="email"
            className="w-full rounded border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
         />
        </div>

        <div className="mt-4">
          <label>パスワード</label>
          <input
            type="password"
            className="w-full rounded border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
         />
        </div>

        <button
         className="mt-6 w-full rounded bg-blue-600 p-2 text-white"
         onClick={async () => {
           const res = await fetch("/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    password,
  }),
});

const data = await res.json();

alert(data.message);
if (data.success) {
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("role", data.employee.role);
  localStorage.setItem("employee", JSON.stringify(data.employee));

  if (data.employee.role === "admin") {
    window.location.href = "/admin";
  } else {
    window.location.href = "/";
  }
}

if (data.success) {
  window.location.href = "/";
}
         }}
        >
        ログイン
        </button>
      </div>
    </main>
  );
}