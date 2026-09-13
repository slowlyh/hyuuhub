// ============================================================
// components/navbar.tsx — Logo, nav, search, auth (glass sticky)
// ============================================================
import Link from "next/link";
import { Search } from "lucide-react";
import { AuthButton } from "./auth-button";
import { MobileNav } from "./mobile-nav";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/latest", label: "Terbaru" },
  { href: "/manga", label: "Manga" },
  { href: "/manhwa", label: "Manhwa" },
  { href: "/manhua", label: "Manhua" },
  { href: "/genres", label: "Genre" },
];

export function Navbar() {
  return (
    <header className="glass-bar sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="btn-accent flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold">
            H
          </span>
          <span className="text-base">
            Hyuu<span className="grad-text">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm text-dim transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Cari"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stroke bg-glass text-dim transition-colors hover:border-stroke-2 hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </Link>
          <div className="hidden sm:block">
            <AuthButton />
          </div>
          <MobileNav>
            <AuthButton full />
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
