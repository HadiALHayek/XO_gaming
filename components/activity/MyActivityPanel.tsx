"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrCreateGuestToken } from "@/lib/guest/client";
import { getUserActivity } from "@/actions/activity";
import { formatDateTime } from "@/lib/dates";
import { useI18n } from "@/components/providers/I18nProvider";

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
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<ActivityData | null>(null);

  const loadActivity = () => {
    startTransition(async () => {
      const guestToken = getOrCreateGuestToken();
      const result = await getUserActivity({ guestToken });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setData(result.data);
    });
  };

  useEffect(() => {
    loadActivity();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadActivity} disabled={isPending}>
              {isPending ? t.activity.loading : t.activity.loadActivity}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-5">
            <h2 className="font-semibold">{t.activity.reservations}</h2>
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
              <p className="text-xs text-muted-foreground">{t.activity.noReservations}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-5">
            <h2 className="font-semibold">{t.activity.downloadRequests}</h2>
            {data?.downloadRequests.length ? (
              data.downloadRequests.map((item) => (
                <div key={item.id} className="rounded-md border border-white/10 p-2 text-xs">
                  <div className="font-medium">{item.file_name}</div>
                  <div className="text-muted-foreground">
                    {item.category} - {formatDateTime(item.created_at)}
                  </div>
                  <div className="text-muted-foreground">
                    {t.activity.status}:{" "}
                    {item.status === "HOLD"
                      ? t.common.hold
                      : item.status === "ON_PROGRESS"
                        ? t.common.onProgress
                        : t.common.finished}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">{t.activity.noDownloads}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-5">
            <h2 className="font-semibold">{t.activity.matchReservations}</h2>
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
              <p className="text-xs text-muted-foreground">{t.activity.noMatches}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
