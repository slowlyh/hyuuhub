// ============================================================
// app/schedule/page.tsx — Jadwal Senin–Minggu (Server)
// ============================================================
import { Suspense } from "react";
import Link from "next/link";
import { getSchedule } from "@/lib/anichin/adapter";
import { SectionSkeleton, EmptyState, ErrorState } from "@/components/states";
import type { ScheduleItem, ScheduleMap } from "@/types";

export const revalidate = 600;

export const metadata = {
  title: "Schedule",
  description: "Jadwal tayang donghua Senin sampai Minggu di HyuuHub.",
};

const DAYS = [
  { key: "monday", label: "Senin" },
  { key: "tuesday", label: "Selasa" },
  { key: "wednesday", label: "Rabu" },
  { key: "thursday", label: "Kamis" },
  { key: "friday", label: "Jumat" },
  { key: "saturday", label: "Sabtu" },
  { key: "sunday", label: "Minggu" },
];

function todayKey(): string {
  return DAYS[(new Date().getDay() + 6) % 7].key;
}

function DayListContent({ schedule, day }: { schedule: ScheduleMap; day: string }) {
  const items: ScheduleItem[] = schedule[day] || [];
  if (!items.length) {
    return (
      <EmptyState
        title={`Tidak ada jadwal untuk ${DAYS.find((d) => d.key === day)?.label || day}`}
        description="Belum ada donghua yang dijadwalkan tayang di hari ini."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Link
          key={item.id + i}
          href={`/donghua/${encodeURIComponent(item.id)}`}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
        >
          {item.poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.poster}
              alt=""
              loading="lazy"
              className="h-16 w-11 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-accent">
              {item.title}
            </p>
            {item.time && <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}

async function DayList({ day }: { day: string }) {
  let schedule: ScheduleMap | null = null;
  try {
    schedule = await getSchedule();
  } catch {
    schedule = null;
  }

  if (!schedule) {
    return <ErrorState message="Tidak bisa memuat jadwal dari anichin.cafe." />;
  }

  return <DayListContent schedule={schedule} day={day} />;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const params = await searchParams;
  const day = params.day && DAYS.some((d) => d.key === params.day) ? params.day : todayKey();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
        <p className="mt-1 text-sm text-muted-foreground">Jadwal rilis donghua per hari.</p>
      </div>

      <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        {DAYS.map((d) => (
          <Link
            key={d.key}
            href={`/schedule?day=${d.key}`}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              d.key === day
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {d.label}
            {d.key === todayKey() && <span className="ml-1.5 text-[10px] opacity-70">•</span>}
          </Link>
        ))}
      </div>

      <Suspense key={day} fallback={<SectionSkeleton count={6} />}>
        <DayList day={day} />
      </Suspense>
    </div>
  );
}
