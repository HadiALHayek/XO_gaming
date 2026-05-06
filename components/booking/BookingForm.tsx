"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Device } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ReservationCreateInput,
  reservationCreateSchema,
} from "@/lib/reservations/schemas";
import { createReservation } from "@/actions/reservations";
import { getUserActivity } from "@/actions/activity";
import { getOrCreateGuestToken } from "@/lib/guest/client";
import { CalendarView } from "./CalendarView";
import { formatDateTime, toDateTimeLocalInput } from "@/lib/dates";
import { useI18n } from "@/components/providers/I18nProvider";

type Props = {
  devices: Device[];
};

function getPcNumber(deviceName: string) {
  const match = /^PC-(\d+)$/i.exec(deviceName.trim());
  return match ? Number(match[1]) : null;
}

function sortByPcNumber(a: Device, b: Device) {
  const aNum = getPcNumber(a.name) ?? Number.MAX_SAFE_INTEGER;
  const bNum = getPcNumber(b.name) ?? Number.MAX_SAFE_INTEGER;
  return aNum - bNum;
}

export function BookingForm({ devices }: Props) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [calendarTick, setCalendarTick] = useState(0);
  const [previousReservations, setPreviousReservations] = useState<
    Array<{
      id: string;
      device_name: string;
      start_time: string;
      end_time: string;
      created_at: string;
    }>
  >([]);

  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
  }, []);
  const form = useForm<ReservationCreateInput>({
    resolver: zodResolver(reservationCreateSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerDiscord: "",
      deviceIds: devices[0]?.id ? [devices[0].id] : [],
      startTime: toDateTimeLocalInput(defaultStart),
      durationHours: 1,
      notes: "",
      reservationType: "ONE_TIME",
    },
  });

  const deviceIds = form.watch("deviceIds");
  const primaryDeviceId = deviceIds[0] ?? null;
  const startTime = form.watch("startTime");
  const durationHours = form.watch("durationHours");

  useEffect(() => {
    if (deviceIds.length === 0 && devices[0]) {
      form.setValue("deviceIds", [devices[0].id]);
    }
  }, [deviceIds, devices, form]);

  useEffect(() => {
    const loadPrevious = async () => {
      const guestToken = getOrCreateGuestToken();
      const result = await getUserActivity({ guestToken });
      if (!result.ok) return;
      setPreviousReservations(result.data.reservations.slice(0, 5));
    };
    void loadPrevious();
  }, []);

  const handleCalendarSelect = (start: Date, end: Date) => {
    const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 3600000));
    form.setValue("startTime", toDateTimeLocalInput(start), {
      shouldValidate: true,
    });
    form.setValue("durationHours", Math.min(12, duration), {
      shouldValidate: true,
    });
    toast.message(t.book.timeSlotSelected, {
      description: `${start.toLocaleString()} - ${end.toLocaleTimeString()}`,
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const guestToken = getOrCreateGuestToken();
      const startIso = new Date(values.startTime).toISOString();
      const result = await createReservation({
        ...values,
        guestToken,
        startTime: startIso,
      });
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof ReservationCreateInput, {
              message,
            });
          }
        }
        toast.error(t.book.bookingFailed, { description: result.error });
        return;
      }

      toast.success(t.book.reservationConfirmed, {
        description: t.book.seeYouSoon,
      });
      const activity = await getUserActivity({ guestToken });
      if (activity.ok) {
        setPreviousReservations(activity.data.reservations.slice(0, 5));
      }
      form.reset({
        ...form.getValues(),
        customerName: "",
        customerPhone: "",
        customerDiscord: "",
        notes: "",
      });
      setCalendarTick((t) => t + 1);
    });
  });

  if (devices.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          {t.book.noDevicesConfigured}
        </CardContent>
      </Card>
    );
  }

  const selectedDevices = devices.filter((d) => deviceIds.includes(d.id));
  const pcLeftSide = devices.filter((d) => {
    const n = getPcNumber(d.name);
    return n !== null && n >= 1 && n <= 5;
  }).sort(sortByPcNumber);
  const pcRightSide = devices.filter((d) => {
    const n = getPcNumber(d.name);
    return n !== null && n > 5;
  }).sort(sortByPcNumber);
  const otherDevices = devices.filter((d) => getPcNumber(d.name) === null);

  const toggleDevice = (deviceId: string) => {
    const current = form.getValues("deviceIds");
    const next = current.includes(deviceId)
      ? current.filter((id) => id !== deviceId)
      : [...current, deviceId];
    form.setValue("deviceIds", next, { shouldValidate: true });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <h2 className="font-display text-xl font-semibold">
              {t.book.reserveStation}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t.book.reserveHint}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.book.device}</Label>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{t.common.leftSidePcs}</p>
                  <div className="grid gap-2">
                    {pcLeftSide.map((device) => {
                      const checked = deviceIds.includes(device.id);
                      return (
                        <button
                          key={device.id}
                          type="button"
                          disabled={!device.is_active}
                          onClick={() => toggleDevice(device.id)}
                          className={[
                            "rounded-md border px-3 py-2 text-left text-sm transition",
                            !device.is_active
                              ? "cursor-not-allowed border-white/10 bg-white/5 text-muted-foreground"
                              : checked
                                ? "border-neon-purple/50 bg-neon-purple/20"
                                : "border-white/10 bg-white/5 hover:bg-white/10",
                          ].join(" ")}
                        >
                          <div className="font-medium">
                            {device.name} - {device.type}
                          </div>
                          {!device.is_active ? (
                            <div className="text-xs text-muted-foreground">
                              {t.common.maintenance}
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{t.common.rightSidePcs}</p>
                  <div className="grid gap-2">
                    {pcRightSide.map((device) => {
                      const checked = deviceIds.includes(device.id);
                      return (
                        <button
                          key={device.id}
                          type="button"
                          disabled={!device.is_active}
                          onClick={() => toggleDevice(device.id)}
                          className={[
                            "rounded-md border px-3 py-2 text-left text-sm transition",
                            !device.is_active
                              ? "cursor-not-allowed border-white/10 bg-white/5 text-muted-foreground"
                              : checked
                                ? "border-neon-purple/50 bg-neon-purple/20"
                                : "border-white/10 bg-white/5 hover:bg-white/10",
                          ].join(" ")}
                        >
                          <div className="font-medium">
                            {device.name} - {device.type}
                          </div>
                          {!device.is_active ? (
                            <div className="text-xs text-muted-foreground">
                              {t.common.maintenance}
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {otherDevices.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">{t.common.otherDevices}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {otherDevices.map((device) => {
                      const checked = deviceIds.includes(device.id);
                      return (
                        <button
                          key={device.id}
                          type="button"
                          disabled={!device.is_active}
                          onClick={() => toggleDevice(device.id)}
                          className={[
                            "rounded-md border px-3 py-2 text-left text-sm transition",
                            !device.is_active
                              ? "cursor-not-allowed border-white/10 bg-white/5 text-muted-foreground"
                              : checked
                                ? "border-neon-purple/50 bg-neon-purple/20"
                                : "border-white/10 bg-white/5 hover:bg-white/10",
                          ].join(" ")}
                        >
                          <div className="font-medium">
                            {device.name} - {device.type}
                          </div>
                          {!device.is_active ? (
                            <div className="text-xs text-muted-foreground">
                              {t.common.maintenance}
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {form.formState.errors.deviceIds ? (
                <p className="text-xs text-red-400">
                  {form.formState.errors.deviceIds.message as string}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startTime">{t.book.start}</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  {...form.register("startTime")}
                />
                {form.formState.errors.startTime ? (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.startTime.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="durationHours">{t.book.duration}</Label>
                <Input id="durationHours" type="number" min={1} max={12} {...form.register("durationHours", { valueAsNumber: true })} />
                {form.formState.errors.durationHours ? (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.durationHours.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customerName">{t.book.fullName}</Label>
                <Input
                  id="customerName"
                  placeholder="Alex Carter"
                  {...form.register("customerName")}
                />
                {form.formState.errors.customerName ? (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.customerName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone">{t.book.phone}</Label>
                <Input
                  id="customerPhone"
                  placeholder="09XXXXXXXX or +9639XXXXXXXX"
                  {...form.register("customerPhone")}
                />
                {form.formState.errors.customerPhone ? (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.customerPhone.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customerDiscord">{t.book.discord}</Label>
              <Input
                id="customerDiscord"
                placeholder="alex#0001"
                {...form.register("customerDiscord")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">{t.book.notes}</Label>
              <Textarea
                id="notes"
                placeholder={t.book.notesPlaceholder}
                {...form.register("notes")}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? t.book.booking : t.book.confirm}
            </Button>

            {selectedDevices.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {t.book.bookingSummary}{" "}
                <span className="text-foreground">
                  {selectedDevices
                    .map((d) => `${d.name} (${d.type})`)
                    .join(", ")}
                </span>{" "}
                {t.book.from}{" "}
                <span className="text-foreground">
                  {new Date(startTime).toLocaleString()}
                </span>{" "}
                {t.book.to}{" "}
                <span className="text-foreground">
                  {new Date(new Date(startTime).getTime() + durationHours * 3600000).toLocaleString()}
                </span>
                .
              </p>
            ) : null}
          </form>

          {previousReservations.length > 0 ? (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-sm font-medium">{t.common.previousReservations}</p>
              <div className="space-y-2">
                {previousReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">{reservation.device_name}</span>{" "}
                    - {formatDateTime(reservation.start_time)} to {formatDateTime(reservation.end_time)}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-neon-purple" />
              {t.book.reserved}
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              {t.book.maintenance}
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              {t.book.dragToSelect}
            </span>
          </div>
          <CalendarView
            key={calendarTick}
            deviceId={primaryDeviceId}
            onSelect={handleCalendarSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}
