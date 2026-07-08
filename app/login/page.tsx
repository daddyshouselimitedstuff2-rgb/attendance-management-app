"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
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

      if (!res.ok || !data.success) {
        setError(data.message || "ログインに失敗しました");
        return;
      }

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("role", data.employee.role);
      localStorage.setItem("employee", JSON.stringify(data.employee));

      router.push(data.employee.role === "admin" ? "/admin" : "/");
    } catch {
      setError("ログイン処理中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold">ログイン</h1>

        <p className="mt-2 text-gray-500">
          勤怠管理システムへログインしてください
        </p>

        {error && (
          <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6">
          <label htmlFor="email" className="block text-sm font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="mt-4">
          <label htmlFor="password" className="block text-sm font-medium">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 w-full rounded border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded bg-blue-600 p-2 text-white disabled:cursor-not-allowed disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </main>
  );
}
