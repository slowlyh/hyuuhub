// ============================================================
// components/states.tsx — Loading / Empty / Error + retry
// ============================================================
import { AlertCircle, RefreshCw, Inbox } from "lucide-react";

export function SectionSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-border">
          <div className="skeleton aspect-[2/3]" />
          <div className="space-y-2 p-2.5">
            <div className="skeleton h-3.5 w-full" />
            <div className="skeleton h-3.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-16 text-center">
      <Inbox className="mb-3 h-8 w-8 text-muted-foreground/50" />
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-16 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-destructive/70" />
      <h3 className="text-sm font-semibold">Terjadi kesalahan</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {href && (
        <a href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          View all →
        </a>
      )}
    </div>
  );
}
