// ============================================================
// components/logout-button.tsx (Client)
// ============================================================
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      aria-label="Logout"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stroke bg-glass text-dim transition-colors hover:bg-white/10 hover:text-foreground"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
