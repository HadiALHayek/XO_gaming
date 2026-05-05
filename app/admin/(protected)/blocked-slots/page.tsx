import { Card, CardContent } from "@/components/ui/card";
import { BlockedSlotForm } from "@/components/admin/BlockedSlotForm";
import { DeleteBlockedSlot } from "@/components/admin/DeleteBlockedSlot";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime, durationHours } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Maintenance windows",
};

export default async function BlockedSlotsPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: slots }, { data: devices }] = await Promise.all([
    supabase
      .from("blocked_slots")
      .select("*, device:devices(*)")
      .order("start_time", { ascending: false })
      .limit(100),
    supabase.from("devices").select("*").order("name", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Maintenance</h1>
          <p className="text-sm text-muted-foreground">
            Block devices for upgrades, cleaning, or downtime.
          </p>
        </div>
        <BlockedSlotForm devices={devices ?? []} />
      </div>

      <Card>
        <CardContent className="p-0">
          {(slots ?? []).length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No maintenance windows.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Device</th>
                    <th className="px-4 py-3 text-left font-medium">Start</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Reason</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(slots ?? []).map((slot) => (
                    <tr
                      key={slot.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{slot.device.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {slot.device.type}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {formatDateTime(slot.start_time)}
                      </td>
                      <td className="px-4 py-3">
                        {durationHours(slot.start_time, slot.end_time)}h
                      </td>
                      <td className="px-4 py-3">{slot.reason}</td>
                      <td className="px-4 py-3 text-right">
                        <DeleteBlockedSlot id={slot.id} />
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
