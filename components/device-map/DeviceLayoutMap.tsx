"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  DoorOpen,
  Martini,
  Route,
  SplitSquareVertical,
  Staircase,
  Wall,
} from "lucide-react";
import { deviceLayoutFloors } from "@/lib/device-layout/mapConfig";
import type { Device } from "@/types";
import { DeviceDetailsPanel } from "./DeviceDetailsPanel";

type DeviceStatus = Device & {
  busyNow?: boolean;
  currentReservationEnd?: string | null;
  nextFreeTime?: string | null;
};

type Props = {
  devices: DeviceStatus[];
  selectedDeviceIds: string[];
  onToggleDevice: (deviceId: string) => void;
  multiSelect?: boolean;
};

function statusClasses(device: DeviceStatus) {
  if (!device.is_active) return "border-gray-400/60 bg-gray-500/20 text-gray-200";
  if (device.busyNow) return "border-red-400/60 bg-red-500/20 text-red-100";
  return "border-emerald-400/60 bg-emerald-500/20 text-emerald-100";
}

function decorationIcon(label: string) {
  const text = label.toLowerCase();
  if (text.includes("entry") || text.includes("door")) return DoorOpen;
  if (text.includes("counter")) return Building2;
  if (text.includes("bar")) return Martini;
  if (text.includes("stair")) return Staircase;
  if (text.includes("wall")) return Wall;
  return Route;
}

export function DeviceLayoutMap({
  devices,
  selectedDeviceIds,
  onToggleDevice,
  multiSelect = true,
}: Props) {
  const [focusedDeviceId, setFocusedDeviceId] = useState<string | null>(null);
  const devicesByName = useMemo(
    () => new Map(devices.map((device) => [device.name, device])),
    [devices],
  );

  const focusedDevice =
    devices.find((d) => d.id === focusedDeviceId) ??
    devices.find((d) => d.id === selectedDeviceIds[0]) ??
    null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-1">
          <SplitSquareVertical className="h-3 w-3" /> Available
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-red-400/40 bg-red-500/10 px-2 py-1">
          <SplitSquareVertical className="h-3 w-3" /> Busy
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-gray-400/40 bg-gray-500/10 px-2 py-1">
          <SplitSquareVertical className="h-3 w-3" /> Offline
        </span>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded border border-white/10 bg-white/5 px-2 py-1">
            Entry
          </span>
          <span className="h-px w-5 bg-white/30" />
          <ArrowRightLeft className="h-3 w-3" />
          <span className="h-px w-5 bg-white/30" />
          <span className="rounded border border-white/10 bg-white/5 px-2 py-1">
            PS4 Corridor
          </span>
          <span className="h-px w-5 bg-white/30" />
          <ArrowRightLeft className="h-3 w-3" />
          <span className="h-px w-5 bg-white/30" />
          <span className="rounded border border-white/10 bg-white/5 px-2 py-1">
            Stairs
          </span>
          <span className="h-px w-5 bg-white/30" />
          <ArrowRightLeft className="h-3 w-3" />
          <span className="h-px w-5 bg-white/30" />
          <span className="rounded border border-white/10 bg-white/5 px-2 py-1">
            Floor 2
          </span>
        </div>
      </div>
      {deviceLayoutFloors.map((floor) => (
        <section
          key={floor.id}
          className="space-y-2 rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-3"
        >
          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <h3 className="font-semibold">{floor.title}</h3>
            <p className="text-[11px] text-muted-foreground">{floor.description}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {floor.zones.map((zone) => (
              <div
                key={zone.id}
                className="space-y-2 rounded-lg border border-dashed border-white/15 bg-black/15 p-2.5"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {zone.title}
                </p>
                {zone.decorations?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {zone.decorations.map((decoration) => (
                      <div
                        key={decoration.id}
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-muted-foreground"
                      >
                        {(() => {
                          const Icon = decorationIcon(decoration.label);
                          return <Icon className="h-3 w-3" />;
                        })()}
                        {decoration.label}
                      </div>
                    ))}
                  </div>
                ) : null}
                {zone.devices.length ? (
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {zone.devices.map((deviceName) => {
                      const device = devicesByName.get(deviceName);
                      if (!device) {
                        return (
                          <div
                            key={deviceName}
                            className="rounded-md border border-dashed border-white/15 bg-white/5 px-2 py-1.5 text-[11px] text-muted-foreground"
                          >
                            {deviceName} (not found)
                          </div>
                        );
                      }
                      const selected = selectedDeviceIds.includes(device.id);
                      return (
                        <button
                          key={device.id}
                          type="button"
                          disabled={!device.is_active}
                          onClick={() => {
                            onToggleDevice(device.id);
                            setFocusedDeviceId(device.id);
                          }}
                          className={[
                            "rounded-md border px-2.5 py-2 text-left text-[11px] transition",
                            statusClasses(device),
                            selected ? "ring-2 ring-neon-purple/60" : "",
                            !device.is_active ? "cursor-not-allowed opacity-70" : "hover:opacity-95",
                          ].join(" ")}
                        >
                          <div className="inline-flex items-center gap-1 font-semibold">
                            <ArrowRightLeft className="h-3 w-3 opacity-70" />
                            {device.name}
                          </div>
                          <div className="text-[10px] opacity-90">{device.type}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
      <DeviceDetailsPanel device={focusedDevice} />
    </div>
  );
}
