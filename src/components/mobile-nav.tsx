// ============================================================
// components/mobile-nav.tsx — Drawer navigasi mobile (Client)
// Menerima auth slot sebagai children (Server Component pass-through).
// ============================================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/latest", label: "Terbaru" },
  { href: "/manga", label: "Manga" },
  { href: "/manhwa", label: "Manhwa" },
  { href: "/manhua", label: "Manhua" },
  { href: "/genres", label: "Genre" },
  { href: "/search", label: "Cari" },
];

export function MobileNav({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stroke bg-glass text-dim transition-colors hover:text-foreground"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div className="glass-bar absolute left-0 right-0 top-14 z-50 border-b border-stroke p-4 shadow-2xl">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t border-stroke pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}
