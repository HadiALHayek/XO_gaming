"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Device } from "@/types";
import { Button } from "@/components/ui/button";
import { setDeviceActive } from "@/actions/devices";

export function DeviceToggle({ device }: { device: Device }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant={device.is_active ? "outline" : "neon"}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const r = await setDeviceActive(device.id, !device.is_active);
          if (r.ok) {
            toast.success(
              device.is_active
                ? `${device.name} is now offline`
                : `${device.name} is back online`,
            );
          } else {
            toast.error(r.error);
          }
        })
      }
    >
      {device.is_active ? "Take offline" : "Bring online"}
    </Button>
  );
}
