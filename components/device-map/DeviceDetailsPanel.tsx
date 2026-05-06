"use client";

import { formatDateTime } from "@/lib/dates";
import type { Device } from "@/types";

type DeviceStatus = Device & {
  busyNow?: boolean;
  currentReservationEnd?: string | null;
  nextFreeTime?: string | null;
};

export function DeviceDetailsPanel({ device }: { device: DeviceStatus | null }) {
  if (!device) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
        Select a device to see status and timing details.
      </div>
    );
  }

  const status = !device.is_active
    ? "Offline"
    : device.busyNow
      ? "Busy"
      : "Available";

  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
      <div className="font-semibold text-foreground">
        {device.name} ({device.type})
      </div>
      <p className="text-muted-foreground">
        Status: <span className="text-foreground">{status}</span>
      </p>
      <p className="text-muted-foreground">
        Current reservation:{" "}
        <span className="text-foreground">
          {device.currentReservationEnd
            ? `Until ${formatDateTime(device.currentReservationEnd)}`
            : "None active"}
        </span>
      </p>
      <p className="text-muted-foreground">
        Next free time:{" "}
        <span className="text-foreground">
          {device.nextFreeTime ? formatDateTime(device.nextFreeTime) : "Now"}
        </span>
      </p>
    </div>
  );
}
