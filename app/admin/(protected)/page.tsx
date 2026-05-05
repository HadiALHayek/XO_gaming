import {
  CalendarClock,
  CalendarDays,
  Gamepad2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCards } from "@/components/StatsCards";
import { ReservationCard } from "@/components/ReservationCard";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin overview",
};

export default async function AdminOverviewPage() {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const supabase = await createSupabaseServerClient();
  const [{ count: deviceCount }, { count: activeDevices }, { count: totalReservations }, { data: upcoming }, { count: blockedActive }] =
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
    ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground">
            What is happening at XO Gaming right now.
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
