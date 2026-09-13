// ============================================================
// app/login/page.tsx — Login + Register (Client form)
// ============================================================
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (username.trim().length < 3) {
          throw new Error("Username minimal 3 karakter.");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim() } },
        });
        if (error) throw error;
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="mb-6 text-center">
        <div className="btn-accent mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl font-bold">
          H
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          {mode === "login" ? "Masuk ke HyuuHub" : "Buat akun HyuuHub"}
        </h1>
        <p className="mt-1 text-sm text-dim">
          Simpan favorit & lanjut baca otomatis.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="glass mb-5 grid grid-cols-2 overflow-hidden text-sm font-medium">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(""); }}
            className={`py-2 transition-colors ${
              mode === m ? "btn-accent rounded-xl" : "text-dim hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {m === "login" ? "Login" : "Register"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <div>
            <label htmlFor="username" className="mb-1 block text-xs font-medium text-dim">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              placeholder="hyuu"
              className="w-full rounded-xl border border-stroke bg-glass px-3 py-2.5 text-sm outline-none backdrop-blur-xl transition-colors placeholder:text-faint focus:border-accent/60"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-dim">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-stroke bg-glass px-3 py-2.5 text-sm outline-none backdrop-blur-xl transition-colors placeholder:text-faint focus:border-accent/60"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-dim">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="minimal 6 karakter"
            className="w-full rounded-xl border border-stroke bg-glass px-3 py-2.5 text-sm outline-none backdrop-blur-xl transition-colors placeholder:text-faint focus:border-accent/60"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-accent inline-flex w-full items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Masuk" : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-dim">
        <Link href="/" className="hover:text-foreground">← Kembali ke Home</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
