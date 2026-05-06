import {
  CalendarClock,
  CalendarDays,
  Gamepad2,
  Download,
  Clock3,
  Trophy,
  Wallet,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCards } from "@/components/StatsCards";
import { ReservationCard } from "@/components/ReservationCard";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/server";
import { formatTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin overview",
};

export default async function AdminOverviewPage() {
  const { t } = await getDictionary();
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const HOURLY_RATE_SYP = 1;
  const supabase = await createSupabaseServerClient();
  const [
    { count: deviceCount },
    { count: activeDevices },
    { count: totalReservations },
    { data: upcoming },
    { count: blockedActive },
    { data: todaysReservations },
    { data: allReservations },
    { data: downloadRequests },
  ] =
    await Promise.all([
      supabase.from("devices").select("*", { count: "exact", head: true }),
      supabase.from("devices").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("reservations").select("*", { count: "exact", head: true }),
      supabase
        .from("reservations")
        .select("*, device:devices(*)")
        .gte("start_time", now.toISOString())
        .lt("start_time", next24h.toISOString())
        .order("start_time", { ascending: true })
        .limit(8),
      supabase.from("blocked_slots").select("*", { count: "exact", head: true }).gt("end_time", now.toISOString()),
      supabase
        .from("reservations")
        .select("start_time,end_time")
        .gte("start_time", startOfDay.toISOString())
        .lt("start_time", endOfDay.toISOString()),
      supabase.from("reservations").select("device_id,start_time,end_time,device:devices(name,type)"),
      supabase.from("download_requests").select("file_name,category"),
    ]);

  const dailyRevenueEstimate = Math.max(
    0,
    Math.round(
      ((todaysReservations ?? []).reduce((sum, reservation) => {
        const start = new Date(reservation.start_time).getTime();
        const end = new Date(reservation.end_time).getTime();
        if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return sum;
        return sum + (end - start) / 3_600_000;
      }, 0) *
        HOURLY_RATE_SYP +
        Number.EPSILON) *
        100,
    ) / 100,
  );

  const byDevice = new Map<string, { label: string; count: number }>();
  const hourBuckets = new Map<number, number>();
  for (const reservation of allReservations ?? []) {
    const deviceName = reservation.device?.name ?? "Unknown";
    const deviceType = reservation.device?.type ?? "";
    const key = `${deviceName}-${deviceType}`;
    const current = byDevice.get(key) ?? {
      label: deviceType ? `${deviceName} (${deviceType})` : deviceName,
      count: 0,
    };
    current.count += 1;
    byDevice.set(key, current);

    const hour = new Date(reservation.start_time).getHours();
    hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1);
  }
  const mostUsedDevices = [...byDevice.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const peakHours = [...hourBuckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({
      label: formatTime(new Date(2026, 0, 1, hour, 0, 0)),
      count,
    }));

  const requestCountByFile = new Map<string, number>();
  for (const request of downloadRequests ?? []) {
    const key = request.file_name.trim();
    requestCountByFile.set(key, (requestCountByFile.get(key) ?? 0) + 1);
  }
  const topRequestedDownloads = [...requestCountByFile.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([file, count]) => ({ file, count }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground">
            {t.admin.overviewHint}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/reservations">All reservations</Link>
        </Button>
      </div>

      <StatsCards
        stats={[
          {
            label: "Active devices",
            value: `${activeDevices ?? 0} / ${deviceCount ?? 0}`,
            hint: "Online and bookable",
            icon: Gamepad2,
            accent: "cyan",
          },
          {
            label: "Active reservations",
            value: totalReservations ?? 0,
            hint: "All bookings",
            icon: CalendarDays,
            accent: "purple",
          },
          {
            label: "Next 24 hours",
            value: upcoming?.length ?? 0,
            hint: "Upcoming bookings",
            icon: CalendarClock,
            accent: "emerald",
          },
          {
            label: "Maintenance windows",
            value: blockedActive ?? 0,
            hint: "Open or upcoming",
            icon: ShieldAlert,
            accent: "amber",
          },
        ]}
      />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Analytics Dashboard</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Wallet className="h-4 w-4 text-neon-cyan" />
                Daily revenue estimate
              </div>
              <div className="text-2xl font-bold">{dailyRevenueEstimate.toFixed(2)} SYP</div>
              <p className="text-xs text-muted-foreground">
                Based on today&apos;s reserved hours x {HOURLY_RATE_SYP} SYP/hour.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-neon-purple" />
                Most-used devices
              </div>
              {mostUsedDevices.length === 0 ? (
                <p className="text-xs text-muted-foreground">No reservation data yet.</p>
              ) : (
                <div className="space-y-1">
                  {mostUsedDevices.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.count} reservations</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock3 className="h-4 w-4 text-emerald-400" />
                Peak hours
              </div>
              {peakHours.length === 0 ? (
                <p className="text-xs text-muted-foreground">No reservation data yet.</p>
              ) : (
                <div className="space-y-1">
                  {peakHours.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.count} starts</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Download className="h-4 w-4 text-amber-400" />
                Top requested downloads
              </div>
              {topRequestedDownloads.length === 0 ? (
                <p className="text-xs text-muted-foreground">No download requests yet.</p>
              ) : (
                <div className="space-y-1">
                  {topRequestedDownloads.map((item) => (
                    <div key={item.file} className="flex items-center justify-between text-sm">
                      <span className="truncate pr-2">{item.file}</span>
                      <span className="text-muted-foreground">{item.count} requests</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">
          Upcoming reservations
        </h2>
        {(upcoming ?? []).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No reservations in the next 24 hours.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(upcoming ?? []).map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
