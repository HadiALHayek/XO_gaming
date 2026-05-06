import { CalendarClock, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, durationHours } from "@/lib/dates";
import { ReservationWithDevice } from "@/types";

export function ReservationCard({
  reservation,
}: {
  reservation: ReservationWithDevice;
}) {
  const hours = durationHours(reservation.start_time, reservation.end_time);
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>{reservation.customer_name}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {reservation.device.name} - {reservation.device.type}
              {reservation.is_daily_recurring ? " - Daily repeat" : ""}
            </div>
          </div>
        </div>
        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 text-neon-cyan" />
            <span>{formatDateTime(reservation.start_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-neon-purple" />
            <span>{hours}h session</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
