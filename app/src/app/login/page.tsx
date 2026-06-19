"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState("");
  const [laster, setLaster] = useState(false);

  async function loggInn(e: FormEvent) {
    e.preventDefault();
    setFeil("");
    setLaster(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passord }),
    });

    setLaster(false);

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setFeil(data.error ?? "Noe gikk galt");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Livssystem
        </h1>
        <form onSubmit={loggInn} className="space-y-4">
          <input
            type="password"
            value={passord}
            onChange={(e) => setPassord(e.target.value)}
            placeholder="Passord"
            autoFocus
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {feil && <p className="text-red-600 text-sm">{feil}</p>}
          <button
            type="submit"
            disabled={laster}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {laster ? "Logger inn…" : "Logg inn"}
          </button>
        </form>
      </div>
    </main>
  );
}
