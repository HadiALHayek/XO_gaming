"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Device } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ALL = "__all__";

export function ReservationFilters({ devices }: { devices: Device[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.replace(`/admin/reservations?${next.toString()}`);
    });
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="filter-date">Date</Label>
        <Input
          id="filter-date"
          type="date"
          defaultValue={params.get("date") ?? ""}
          onChange={(e) => update("date", e.target.value || null)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Device</Label>
        <Select
          value={params.get("device") ?? ALL}
          onValueChange={(v) => update("device", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All devices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All devices</SelectItem>
            {devices.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} - {d.type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={() =>
            startTransition(() => router.replace("/admin/reservations"))
          }
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
