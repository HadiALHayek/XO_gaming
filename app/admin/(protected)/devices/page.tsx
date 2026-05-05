import { Gamepad2, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeviceToggle } from "@/components/admin/DeviceToggle";
import { listDevices } from "@/lib/supabase/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Devices",
};

export default async function AdminDevicesPage() {
  const devices = await listDevices().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Devices</h1>
        <p className="text-sm text-muted-foreground">
          Toggle a device offline to prevent new bookings during maintenance.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {devices.map((device) => {
          const Icon = device.type === "PC" ? Monitor : Gamepad2;
          return (
            <Card key={device.id}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={
                    device.type === "PC"
                      ? "flex h-12 w-12 items-center justify-center rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan"
                      : "flex h-12 w-12 items-center justify-center rounded-xl border border-neon-purple/40 bg-neon-purple/10 text-neon-purple"
                  }
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>{device.name}</span>
                    {device.is_active ? (
                      <Badge variant="success">Online</Badge>
                    ) : (
                      <Badge variant="warning">Offline</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {device.type === "PC" ? "Gaming PC" : "PlayStation 5"}
                  </div>
                </div>
                <DeviceToggle device={device} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
