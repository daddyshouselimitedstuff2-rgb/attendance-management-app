"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("loggedIn") === "true";
      const role = localStorage.getItem("role");

      setIsLoggedIn(loggedIn);

      if (pathname === "/login") {
        return;
      }

      if (!loggedIn) {
        router.replace("/login");
        return;
      }

      if (pathname === "/admin" && role !== "admin") {
        router.replace("/");
      }
    };

    checkAuth();
    window.addEventListener("pageshow", checkAuth);
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("pageshow", checkAuth);
      window.removeEventListener("focus", checkAuth);
    };
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("employee");
    setIsLoggedIn(false);
    router.replace("/login");
  };

  const showLogout = isLoggedIn && pathname !== "/login";

  return (
    <>
      {showLogout && (
        <div className="fixed inset-x-0 top-0 z-50 flex justify-end border-b bg-white/95 px-4 py-3 shadow-sm print:hidden">
          <button
            type="button"
            onClick={logout}
            className="rounded bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
          >
            ログアウト
          </button>
        </div>
      )}
      <div className={showLogout ? "pt-16 print:pt-0" : ""}>{children}</div>
    </>
  );
}
