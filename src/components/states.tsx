// ============================================================
// components/states.tsx — Empty / Error state + section title
// ============================================================
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

export function EmptyState({
  title = "Belum ada apa-apa di sini",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stroke px-4 py-16 text-center">
      <Inbox className="mb-3 h-8 w-8 text-faint" />
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-dim">{description}</p>}
    </div>
  );
}

export function ErrorState({
  message = "Gagal memuat data dari server.",
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stroke px-4 py-16 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-destructive/70" />
      <h3 className="text-sm font-semibold">Terjadi kesalahan</h3>
      <p className="mt-1 max-w-sm text-sm text-dim">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-stroke bg-glass px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function SectionTitle({ title, href, sub }: { title: string; href?: string; sub?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-faint">{sub}</p>}
      </div>
      {href && (
        <a href={href} className="shrink-0 text-sm text-dim transition-colors hover:text-foreground">
          Lihat semua →
        </a>
      )}
    </div>
  );
}
