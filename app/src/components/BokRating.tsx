"use client";

import { useState } from "react";

export default function BokRating({
  id,
  rating: init,
}: {
  id: number;
  rating: number | null;
}) {
  const [rating, setRating] = useState(init ?? 0);
  const [hover, setHover] = useState(0);

  async function endre(verdi: number) {
    // Trykk på samme stjerne igjen nullstiller
    const ny = verdi === rating ? 0 : verdi;
    setRating(ny);
    await fetch(`/api/bibliotek/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: ny === 0 ? null : ny }),
    });
  }

  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase mb-2"
        style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
      >
        Min score
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const aktiv = (hover || rating) >= n;
          return (
            <button
              key={n}
              onClick={() => endre(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-2xl transition-colors"
              style={{ color: aktiv ? "var(--hest)" : "var(--border)" }}
              aria-label={`${n} av 5`}
            >
              {aktiv ? "★" : "☆"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
