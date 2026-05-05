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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ReservationCreateInput,
  reservationCreateSchema,
} from "@/lib/reservations/schemas";
import { createReservation } from "@/actions/reservations";
import { CalendarView } from "./CalendarView";
import { toDateTimeLocalInput } from "@/lib/dates";
import { useI18n } from "@/components/providers/I18nProvider";

type Props = {
  devices: Device[];
};

export function BookingForm({ devices }: Props) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [calendarTick, setCalendarTick] = useState(0);

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
      deviceId: devices[0]?.id ?? "",
      startTime: toDateTimeLocalInput(defaultStart),
      durationHours: 1,
      notes: "",
    },
  });

  const deviceId = form.watch("deviceId");
  const startTime = form.watch("startTime");
  const durationHours = form.watch("durationHours");

  useEffect(() => {
    if (!deviceId && devices[0]) {
      form.setValue("deviceId", devices[0].id);
    }
  }, [deviceId, devices, form]);

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
      const startIso = new Date(values.startTime).toISOString();
      const result = await createReservation({
        ...values,
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

  const selectedDevice = devices.find((d) => d.id === deviceId);

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
              <Label htmlFor="deviceId">{t.book.device}</Label>
              <Select
                value={deviceId}
                onValueChange={(value) =>
                  form.setValue("deviceId", value, { shouldValidate: true })
                }
              >
                <SelectTrigger id="deviceId">
                  <SelectValue placeholder={t.book.chooseDevice} />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem
                      key={device.id}
                      value={device.id}
                      disabled={!device.is_active}
                    >
                      {device.name} - {device.type}
                      {!device.is_active ? " (maintenance)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.deviceId ? (
                <p className="text-xs text-red-400">
                  {form.formState.errors.deviceId.message}
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

            {selectedDevice ? (
              <p className="text-xs text-muted-foreground">
                {t.book.bookingSummary}{" "}
                <span className="text-foreground">
                  {selectedDevice.name} ({selectedDevice.type})
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
            deviceId={deviceId || null}
            onSelect={handleCalendarSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}
