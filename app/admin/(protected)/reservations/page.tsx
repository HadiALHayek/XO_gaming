import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReservationFilters } from "@/components/admin/ReservationFilters";
import { ReservationActions } from "@/components/admin/ReservationActions";
import { ReservationFormDialog } from "@/components/admin/ReservationFormDialog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllDevicesWithCurrentStatus } from "@/lib/queries";
import { formatDateTime, durationHours } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reservations",
};

type SearchParams = Promise<{
  date?: string;
  device?: string;
}>;

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("reservations")
    .select("*, device:devices(*)")
    .order("start_time", { ascending: false })
    .limit(200);
  if (params.device) query = query.eq("device_id", params.device);
  if (params.date) {
    const start = new Date(params.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query = query.gte("start_time", start.toISOString()).lt("start_time", end.toISOString());
  }
  const [{ data: reservations }, devices] = await Promise.all([
    query,
    getAllDevicesWithCurrentStatus(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Reservations</h1>
          <p className="text-sm text-muted-foreground">
            Filter, edit, or remove customer bookings.
          </p>
        </div>
        <ReservationFormDialog
          devices={devices ?? []}
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              New reservation
            </Button>
          }
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <ReservationFilters devices={devices ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {(reservations ?? []).length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No reservations match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Device</th>
                    <th className="px-4 py-3 text-left font-medium">Start</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(reservations ?? []).map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {reservation.customer_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reservation.customer_phone}
                          {reservation.customer_discord
                            ? ` - ${reservation.customer_discord}`
                            : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {reservation.device.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reservation.device.type}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {formatDateTime(reservation.start_time)}
                      </td>
                      <td className="px-4 py-3">
                        {durationHours(
                          reservation.start_time,
                          reservation.end_time,
                        )}
                        h
                      </td>
                      <td className="px-4 py-3">
                        {reservation.is_daily_recurring ? "Daily repeat" : "One time"}
                      </td>
                      <td className="px-4 py-3">
                        <ReservationActions
                          reservation={reservation}
                          devices={devices ?? []}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
