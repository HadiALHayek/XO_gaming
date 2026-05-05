"use client";

import { ReactNode, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Device, Reservation } from "@/types";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ReservationCreateInput,
  reservationCreateSchema,
} from "@/lib/reservations/schemas";
import {
  createReservation,
  updateReservation,
} from "@/actions/reservations";
import { toDateTimeLocalInput } from "@/lib/dates";

type Props = {
  devices: Device[];
  reservation?: Reservation;
  trigger: ReactNode;
};

export function ReservationFormDialog({
  devices,
  reservation,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(reservation);

  const defaults = (() => {
    if (reservation) {
      return {
        customerName: reservation.customer_name,
        customerPhone: reservation.customer_phone ?? "",
        customerDiscord: reservation.customer_discord ?? "",
        deviceId: reservation.device_id,
        startTime: toDateTimeLocalInput(new Date(reservation.start_time)),
        durationHours: Math.max(
          1,
          Math.round(
            (new Date(reservation.end_time).getTime() -
              new Date(reservation.start_time).getTime()) /
              3600000,
          ),
        ),
        notes: reservation.notes ?? "",
      } satisfies ReservationCreateInput;
    }
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return {
      customerName: "",
      customerPhone: "",
      customerDiscord: "",
      deviceId: devices[0]?.id ?? "",
      startTime: toDateTimeLocalInput(start),
      durationHours: Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / 3600000),
      ),
      notes: "",
    } satisfies ReservationCreateInput;
  })();

  const form = useForm<ReservationCreateInput>({
    resolver: zodResolver(reservationCreateSchema),
    defaultValues: defaults,
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const payload = {
        ...values,
        startTime: new Date(values.startTime).toISOString(),
      };
      const result = isEdit
        ? await updateReservation({ id: reservation!.id, ...payload })
        : await createReservation(payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Reservation updated" : "Reservation created");
      setOpen(false);
      if (!isEdit) {
        form.reset(defaults);
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit reservation" : "New reservation"}
          </DialogTitle>
          <DialogDescription>
            Sessions run between 1 and 12 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="r-device">Device</Label>
            <Select
              value={form.watch("deviceId")}
              onValueChange={(v) =>
                form.setValue("deviceId", v, { shouldValidate: true })
              }
            >
              <SelectTrigger id="r-device">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {devices.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} - {d.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="r-start">Start</Label>
              <Input
                id="r-start"
                type="datetime-local"
                {...form.register("startTime")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-end">Duration (hours)</Label>
              <Input
                id="r-end"
                type="number"
                min={1}
                max={12}
                {...form.register("durationHours", { valueAsNumber: true })}
              />
              {form.formState.errors.durationHours ? (
                <p className="text-xs text-red-400">
                  {form.formState.errors.durationHours.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="r-name">Name</Label>
              <Input id="r-name" {...form.register("customerName")} />
              {form.formState.errors.customerName ? (
                <p className="text-xs text-red-400">
                  {form.formState.errors.customerName.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-phone">Phone</Label>
              <Input
                id="r-phone"
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
            <Label htmlFor="r-discord">Discord (optional)</Label>
            <Input id="r-discord" {...form.register("customerDiscord")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-notes">Notes</Label>
            <Textarea id="r-notes" {...form.register("notes")} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create reservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
