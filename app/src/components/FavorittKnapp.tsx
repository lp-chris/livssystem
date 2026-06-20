"use client";

import { useState } from "react";

export default function FavorittKnapp({
  id,
  favoritt: init,
}: {
  id: number;
  favoritt: boolean;
}) {
  const [favoritt, setFavoritt] = useState(init);

  async function toggle() {
    const ny = !favoritt;
    setFavoritt(ny);
    await fetch(`/api/bibliotek/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favoritt: ny }),
    });
  }

  return (
    <button
      onClick={toggle}
      className={`text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
        favoritt ? "text-yellow-400" : "text-gray-200"
      }`}
    >
      ★
    </button>
  );
}
