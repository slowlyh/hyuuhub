// ============================================================
// components/navbar.tsx — Logo, nav links, search, theme, auth
// AuthButton (async server) tidak boleh di-import oleh Client
// Component — karena itu Navbar merender keduanya secara terpisah
// dan MobileNav menerima slot auth via children.
// ============================================================
import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "./theme";
import { AuthButton } from "./auth-button";
import { MobileNav } from "./mobile-nav";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/latest", label: "Latest" },
  { href: "/schedule", label: "Schedule" },
  { href: "/genres", label: "Genres" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-1.5 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
            H
          </span>
          <span className="text-base">
            Hyuu<span className="text-accent">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </Link>
          <ThemeToggle />
          <div className="hidden sm:block">
            <AuthButton />
          </div>
          <MobileNav>
            {/* slot server → dirender MobileNav sebagai children */}
            <AuthButton full />
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
