import Link from "next/link";
import { CalendarCheck, Gamepad2, Monitor, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeviceCard } from "@/components/DeviceCard";
import { GameLogosCarousel } from "@/components/home/GameLogosCarousel";
import { getDevicesWithCurrentStatus } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n/server";
import { getSiteSettings, listHomeLogoImages } from "@/lib/supabase/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [devices, { t }, settings, logos] = await Promise.all([
    getDevicesWithCurrentStatus(),
    getDictionary(),
    getSiteSettings().catch(() => null),
    listHomeLogoImages().catch(() => []),
  ]);

  const pcCount = devices.filter((d) => d.type === "PC").length;
  const ps4Count = devices.filter((d) => d.type === "PS4").length;
  const availableNow = devices.filter((d) => d.is_active && !d.busyNow).length;

  return (
    <div className="container space-y-24 pb-24 pt-12 md:pt-20">
      <section className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-neon-cyan" />
              <span>{t.home.badge}</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              {t.home.heroLine1}{" "}
              <span className="gradient-text">{t.home.heroLine2}</span>
              <br />
              {t.home.heroLine3} <span className="gradient-text">{t.brand}.</span>
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              {pcCount} {t.home.gamingPcs.toLowerCase()} + {ps4Count} {t.home.playstation}. {t.home.heroDescription}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="xl">
                <Link href="/book">
                  <CalendarCheck className="h-4 w-4" />
                  {t.home.ctaBook}
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="#availability">{t.home.ctaAvailability}</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-neon-cyan" /> {t.home.liveAvailability}
              </span>
              <span className="inline-flex items-center gap-2">
                <Gamepad2 className="h-3.5 w-3.5 text-neon-purple" /> {t.home.stations}
              </span>
              <span className="inline-flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5 text-neon-cyan" /> {t.home.sessions}
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="neon-border">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t.home.availableNow}
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
                    {t.home.gamingPcs}
                  </div>
                  <div className="font-display text-3xl font-bold">{pcCount}</div>
                  <div className="text-xs text-muted-foreground">
                    Play Online
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t.home.playstation}
                  </div>
                  <div className="font-display text-3xl font-bold">
                    {ps4Count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Challenge ready
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {settings?.home_video_url || logos.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              <span className="gradient-text">XO</span> Highlights
            </h2>
            <p className="text-sm text-muted-foreground">
              Watch the latest promo and featured game logos.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-stretch">
            {settings?.home_video_url ? (
              <Card className="w-full overflow-hidden lg:w-[640px]">
                <CardContent className="p-0">
                  <video
                    src={settings.home_video_url}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-[220px] w-full bg-black object-cover sm:h-[260px] lg:h-[320px]"
                  />
                </CardContent>
              </Card>
            ) : null}
            {logos.length > 0 ? <GameLogosCarousel logos={logos} /> : null}
          </div>
        </section>
      ) : null}

      <section id="availability" className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              <span className="gradient-text">Live</span> {t.home.liveDeviceStatus}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.home.snapshot}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/book">{t.home.bookSlot}</Link>
          </Button>
        </div>

        {devices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
              <Sparkles className="h-6 w-6 text-neon-cyan" />
              <div className="text-sm font-medium">{t.home.noDevices}</div>
              <p className="text-xs text-muted-foreground">
                {t.home.noDevicesHint}
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
