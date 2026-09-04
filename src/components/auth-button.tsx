// ============================================================
// components/auth-button.tsx — Login / avatar+logout (Server)
// ============================================================
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton({ full = false }: { full?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className={`flex items-center gap-2 ${full ? "w-full" : ""}`}>
        <Link
          href="/profile"
          className={`flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted ${full ? "flex-1 justify-center" : ""}`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
            {(user.email || "U")[0].toUpperCase()}
          </span>
          <span className="hidden max-w-[80px] truncate sm:inline">
            {user.email?.split("@")[0]}
          </span>
        </Link>
        <LogoutButton />
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className={`rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 ${full ? "w-full text-center" : ""}`}
    >
      Login
    </Link>
  );
}
