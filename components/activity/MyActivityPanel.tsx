"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrCreateGuestToken } from "@/lib/guest/client";
import { getUserActivity } from "@/actions/activity";
import { formatDateTime } from "@/lib/dates";

type ActivityData = {
  reservations: Array<{
    id: string;
    device_name: string;
    start_time: string;
    end_time: string;
    created_at: string;
  }>;
  downloadRequests: Array<{
    id: string;
    category: string;
    status: string;
    file_name: string;
    created_at: string;
  }>;
  matchReservations: Array<{
    id: string;
    match_title: string;
    seat_number: number;
    created_at: string;
  }>;
};

export function MyActivityPanel() {
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<ActivityData | null>(null);

  const loadByGuestToken = () => {
    startTransition(async () => {
      const result = await getUserActivity({
        guestToken: getOrCreateGuestToken(),
      });
      if (!result.ok) return;
      setData(result.data);
    });
  };

  useEffect(() => {
    loadByGuestToken();
  }, []);

  const loadByPhone = () => {
    startTransition(async () => {
      const result = await getUserActivity({
        guestToken: getOrCreateGuestToken(),
        phone,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setData(result.data);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="activity-phone">Find with phone number (optional)</Label>
            <Input
              id="activity-phone"
              placeholder="09XXXXXXXX or +9639XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadByPhone} disabled={isPending}>
              {isPending ? "Loading..." : "Load my activity"}
            </Button>
            <Button variant="outline" onClick={loadByGuestToken} disabled={isPending}>
              Use this device history
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-5">
            <h2 className="font-semibold">Reservations</h2>
            {data?.reservations.length ? (
              data.reservations.map((item) => (
                <div key={item.id} className="rounded-md border border-white/10 p-2 text-xs">
                  <div className="font-medium">{item.device_name}</div>
                  <div className="text-muted-foreground">
                    {formatDateTime(item.start_time)} - {formatDateTime(item.end_time)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No reservations found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-5">
            <h2 className="font-semibold">Download requests</h2>
            {data?.downloadRequests.length ? (
              data.downloadRequests.map((item) => (
                <div key={item.id} className="rounded-md border border-white/10 p-2 text-xs">
                  <div className="font-medium">{item.file_name}</div>
                  <div className="text-muted-foreground">
                    {item.category} - {formatDateTime(item.created_at)}
                  </div>
                  <div className="text-muted-foreground">
                    Status:{" "}
                    {item.status === "HOLD"
                      ? "Hold"
                      : item.status === "ON_PROGRESS"
                        ? "On progress"
                        : "Finished"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No download requests found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-5">
            <h2 className="font-semibold">Match reservations</h2>
            {data?.matchReservations.length ? (
              data.matchReservations.map((item) => (
                <div key={item.id} className="rounded-md border border-white/10 p-2 text-xs">
                  <div className="font-medium">
                    {item.match_title} - Seat {item.seat_number}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDateTime(item.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No match reservations found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
