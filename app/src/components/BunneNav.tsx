"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Hjem", ikon: "⌂" },
  { href: "/oppgaver", label: "Oppgaver", ikon: "☑" },
  null, // gap for mic-knapp
  { href: "/prosjekter", label: "Prosjekter", ikon: "◫" },
  { href: "/journal", label: "Journal", ikon: "✎" },
  { href: "/bibliotek", label: "Bibliotek", ikon: "❧" },
];

export default function BunneNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-start justify-around pt-3 z-40"
      style={{
        height: "var(--nav-h)",
        backgroundColor: "rgba(244, 242, 236, 0.94)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {NAV_ITEMS.map((item, i) => {
        if (!item) {
          // Midtplass for mic-knapp
          return <div key="gap" className="w-16" />;
        }

        const aktiv =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px]"
            style={{ color: aktiv ? "var(--ink)" : "var(--muted)" }}
          >
            <span className="text-xl leading-none">{item.ikon}</span>
            <span
              className="text-[10px] font-medium whitespace-nowrap"
              style={{ letterSpacing: "0.03em" }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
