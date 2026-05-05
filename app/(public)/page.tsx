import Link from "next/link";
import { CalendarCheck, Gamepad2, Monitor, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeviceCard } from "@/components/DeviceCard";
import { getDevicesWithCurrentStatus } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const devices = await getDevicesWithCurrentStatus();

  const pcCount = devices.filter((d) => d.type === "PC").length;
  const ps5Count = devices.filter((d) => d.type === "PS5").length;
  const availableNow = devices.filter((d) => d.is_active && !d.busyNow).length;

  return (
    <div className="container space-y-24 pb-24 pt-12 md:pt-20">
      <section className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-neon-cyan" />
              <span>No payment - reserve in seconds</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Plug in.{" "}
              <span className="gradient-text">Power up.</span>
              <br />
              Play at <span className="gradient-text">NeonArena.</span>
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              {pcCount} high-end gaming PCs and {ps5Count} PlayStation 5 stations,
              ready when you are. Pick a device, choose your slot, and we will
              keep the lights on.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="xl">
                <Link href="/book">
                  <CalendarCheck className="h-4 w-4" />
                  Book a session
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="#availability">View availability</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-neon-cyan" /> Live availability
              </span>
              <span className="inline-flex items-center gap-2">
                <Gamepad2 className="h-3.5 w-3.5 text-neon-purple" /> 14 stations
              </span>
              <span className="inline-flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5 text-neon-cyan" /> 1-12 hour
                sessions
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="neon-border">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Available now
                  </div>
                  <div className="font-display text-4xl font-bold">
                    {availableNow}
                    <span className="text-base font-normal text-muted-foreground">
                      {" "}
                      / {devices.length}
                    </span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan">
                  <Zap className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Gaming PCs
                  </div>
                  <div className="font-display text-3xl font-bold">{pcCount}</div>
                  <div className="text-xs text-muted-foreground">
                    RTX-class rigs
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    PlayStation 5
                  </div>
                  <div className="font-display text-3xl font-bold">
                    {ps5Count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    4K HDR ready
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="availability" className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              <span className="gradient-text">Live</span> device status
            </h2>
            <p className="text-sm text-muted-foreground">
              A snapshot of the floor right now. Tap a device to see its
              schedule.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/book">Book a slot</Link>
          </Button>
        </div>

        {devices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
              <Sparkles className="h-6 w-6 text-neon-cyan" />
              <div className="text-sm font-medium">No devices yet</div>
              <p className="text-xs text-muted-foreground">
                Run the database seed to create the 10 PCs and 4 PS5 stations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                name={device.name}
                type={device.type}
                isActive={device.is_active}
                status={device.busyNow ? "busy" : "available"}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
