"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "I dag", ikon: "⌂" },
  { href: "/oppgaver", label: "Oppgaver", ikon: "☑" },
  { href: "/prosjekter", label: "Prosjekter", ikon: "◫" },
  { href: "/rutiner", label: "Rutiner", ikon: "○" },
  { href: "/bibliotek", label: "Bibliotek", ikon: "❧" },
];

const DOMENER = [
  { key: "meg", navn: "Meg", farge: "var(--meg)" },
  { key: "oss", navn: "Oss", farge: "var(--oss)" },
  { key: "stall", navn: "Stall", farge: "var(--stall)" },
  { key: "hest", navn: "Hest", farge: "var(--hest)" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col fixed top-0 left-0 h-screen"
      style={{
        width: 230,
        backgroundColor: "var(--surface)",
        borderRight: "1px solid var(--border)",
        zIndex: 40,
      }}
    >
      <div className="px-6 pt-8 pb-5">
        <span
          className="text-[11px] font-bold uppercase"
          style={{ letterSpacing: "0.16em", color: "var(--muted)" }}
        >
          Livssystem
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const aktiv =
            item.href === "/"
              ? pathname === "/"
              : item.href === "/bibliotek"
              ? pathname.startsWith("/bibliotek") ||
                pathname.startsWith("/journal")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-[15px] transition-colors"
              style={{
                backgroundColor: aktiv ? "var(--ink)" : "transparent",
                color: aktiv ? "var(--surface)" : "var(--ink-3)",
                fontWeight: aktiv ? 500 : 400,
              }}
            >
              <span className="text-lg leading-none w-5 text-center">
                {item.ikon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="px-6 mt-5 pt-5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className="text-[11px] font-bold uppercase mb-3"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Domener
        </div>
        {DOMENER.map((d) => (
          <div
            key={d.key}
            className="flex items-center gap-2.5 py-1.5 text-sm"
            style={{ color: "var(--ink-3)" }}
          >
            <div
              className="rounded-full flex-none"
              style={{ width: 8, height: 8, backgroundColor: d.farge }}
            />
            {d.navn}
          </div>
        ))}
      </div>

      <div className="mt-auto px-3 pb-6">
        <Link
          href="/innstillinger"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-[15px] transition-colors"
          style={{
            backgroundColor: pathname.startsWith("/innstillinger")
              ? "var(--ink)"
              : "transparent",
            color: pathname.startsWith("/innstillinger")
              ? "var(--surface)"
              : "var(--ink-3)",
            fontWeight: pathname.startsWith("/innstillinger") ? 500 : 400,
          }}
        >
          <span className="text-lg leading-none w-5 text-center">⚙</span>
          Innstillinger
        </Link>
      </div>
    </aside>
  );
}
