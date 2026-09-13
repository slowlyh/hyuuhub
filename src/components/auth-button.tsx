// ============================================================
// components/auth-button.tsx — Login / avatar+logout (Server)
// ============================================================
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton({ full = false }: { full?: boolean }) {
  let user = null;
  try {
    const supabase = await createClient();
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    user = null; // Supabase belum dikonfigurasi — anggap guest
  }

  if (user) {
    return (
      <div className={`flex items-center gap-2 ${full ? "w-full" : ""}`}>
        <Link
          href="/profile"
          className={`flex items-center gap-2 rounded-lg border border-stroke bg-glass px-3 py-1.5 text-sm font-medium backdrop-blur-xl transition-colors hover:bg-white/10 ${full ? "flex-1 justify-center" : ""}`}
        >
          <span className="btn-accent flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
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
      className={`btn-accent inline-flex items-center justify-center px-4 py-1.5 text-sm ${full ? "w-full" : ""}`}
    >
      Masuk
    </Link>
  );
}
