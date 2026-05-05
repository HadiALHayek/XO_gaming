"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Device } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  BlockedSlotCreateInput,
  blockedSlotCreateSchema,
} from "@/lib/reservations/schemas";
import { createBlockedSlot } from "@/actions/blocked-slots";
import { toDateTimeLocalInput } from "@/lib/dates";

export function BlockedSlotForm({ devices }: { devices: Device[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 2);

  const form = useForm<BlockedSlotCreateInput>({
    resolver: zodResolver(blockedSlotCreateSchema),
    defaultValues: {
      deviceId: devices[0]?.id ?? "",
      startTime: toDateTimeLocalInput(start),
      endTime: toDateTimeLocalInput(end),
      reason: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const r = await createBlockedSlot({
        ...values,
        startTime: new Date(values.startTime).toISOString(),
        endTime: new Date(values.endTime).toISOString(),
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Maintenance window created");
      setOpen(false);
      form.reset();
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Block time
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block a device for maintenance</DialogTitle>
          <DialogDescription>
            Customers will not be able to book this slot.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Device</Label>
            <Select
              value={form.watch("deviceId")}
              onValueChange={(v) =>
                form.setValue("deviceId", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
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
              <Label htmlFor="b-start">Start</Label>
              <Input
                id="b-start"
                type="datetime-local"
                {...form.register("startTime")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-end">End</Label>
              <Input
                id="b-end"
                type="datetime-local"
                {...form.register("endTime")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-reason">Reason</Label>
            <Input
              id="b-reason"
              placeholder="GPU upgrade"
              {...form.register("reason")}
            />
            {form.formState.errors.reason ? (
              <p className="text-xs text-red-400">
                {form.formState.errors.reason.message}
              </p>
            ) : null}
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
              {isPending ? "Saving..." : "Block time"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
