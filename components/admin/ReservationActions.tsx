"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteReservation,
} from "@/actions/reservations";
import { ReservationFormDialog } from "./ReservationFormDialog";
import type { Device, Reservation } from "@/types";

type Props = {
  reservation: Reservation;
  devices: Device[];
};

export function ReservationActions({ reservation, devices }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <ReservationFormDialog
        devices={devices}
        reservation={reservation}
        trigger={
          <Button size="icon" variant="ghost" title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <Button
          size="icon"
          variant="ghost"
          title="Delete"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete reservation?</DialogTitle>
            <DialogDescription>
              This permanently removes the reservation. Cancelling instead is
              usually safer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await deleteReservation(reservation.id);
                  if (r.ok) {
                    toast.success("Reservation deleted");
                    setConfirmDelete(false);
                  } else {
                    toast.error(r.error);
                  }
                })
              }
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
