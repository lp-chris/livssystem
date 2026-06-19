"use client";

import { useRouter } from "next/navigation";

export default function LoggUtKnapp() {
  const router = useRouter();

  async function loggUt() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={loggUt}
      className="text-sm text-gray-500 hover:text-gray-900"
    >
      Logg ut
    </button>
  );
}
