// ============================================================
// src/proxy.ts — Next.js 16 Proxy (pengganti Middleware)
// Refresh Supabase session di setiap request.
// ============================================================
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Jalankan di semua route kecuali:
     * - _next/static, _next/image
     * - favicon, robots, sitemap
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
