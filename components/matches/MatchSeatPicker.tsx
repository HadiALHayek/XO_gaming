"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  matchSeatReservationSchema,
  type MatchSeatReservationInput,
} from "@/lib/matches/schemas";
import { createMatchSeatReservation } from "@/actions/matches";
import { getUserActivity } from "@/actions/activity";
import { getOrCreateGuestToken } from "@/lib/guest/client";
import { formatDateTime } from "@/lib/dates";
import { useI18n } from "@/components/providers/I18nProvider";

type Props = {
  matchId: string;
  reservedSeats: number[];
};

const ALL_SEATS = Array.from({ length: 20 }, (_, i) => i + 1);

export function MatchSeatPicker({ matchId, reservedSeats }: Props) {
  const { t } = useI18n();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [previousMatchReservations, setPreviousMatchReservations] = useState<
    Array<{
      id: string;
      match_title: string;
      seat_number: number;
      created_at: string;
    }>
  >([]);
  const reserved = useMemo(() => new Set(reservedSeats), [reservedSeats]);

  const form = useForm<MatchSeatReservationInput>({
    resolver: zodResolver(matchSeatReservationSchema),
    defaultValues: {
      matchId,
      customerName: "",
      customerPhone: "",
      seats: [],
    },
  });

  useEffect(() => {
    const loadPrevious = async () => {
      const guestToken = getOrCreateGuestToken();
      const result = await getUserActivity({ guestToken });
      if (!result.ok) return;
      setPreviousMatchReservations(result.data.matchReservations.slice(0, 8));
    };
    void loadPrevious();
  }, []);

  const toggleSeat = (seat: number) => {
    if (reserved.has(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat],
    );
  };

  const openForm = () => {
    if (selectedSeats.length === 0) {
      toast.error(t.matches.selectAtLeastOneSeat);
      return;
    }
    form.setValue("seats", selectedSeats, { shouldValidate: true });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const guestToken = getOrCreateGuestToken();
      const result = await createMatchSeatReservation({
        ...values,
        guestToken,
        matchId,
        seats: selectedSeats.sort((a, b) => a - b),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.matches.seatReservationSuccess);
      const activity = await getUserActivity({ guestToken });
      if (activity.ok) {
        setPreviousMatchReservations(activity.data.matchReservations.slice(0, 8));
      }
      form.reset({ matchId, customerName: "", customerPhone: "", seats: [] });
      setSelectedSeats([]);
      setOpen(false);
    });
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="mx-auto w-full max-w-md rounded-md border border-neon-cyan/40 bg-neon-cyan/10 p-2 text-center text-sm font-semibold tracking-wide text-neon-cyan">
          {t.matches.screen}
        </div>
        <div className="mx-auto grid max-w-md grid-cols-4 gap-3">
          {ALL_SEATS.map((seat) => {
            const isReserved = reserved.has(seat);
            const isSelected = selectedSeats.includes(seat);
            return (
              <button
                key={seat}
                type="button"
                disabled={isReserved}
                onClick={() => toggleSeat(seat)}
                className={[
                  "aspect-square rounded-md border text-sm font-semibold transition",
                  isReserved
                    ? "cursor-not-allowed border-red-400/40 bg-red-500/20 text-red-200"
                    : isSelected
                      ? "border-neon-purple/60 bg-neon-purple/30 text-white"
                      : "border-white/15 bg-white/5 text-foreground hover:bg-white/10",
                ].join(" ")}
              >
                {seat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t.matches.selectedSeats}:{" "}
          <span className="text-foreground">
            {selectedSeats.length > 0
              ? selectedSeats.sort((a, b) => a - b).join(", ")
              : t.matches.none}
          </span>
        </p>
        <Button onClick={openForm} disabled={selectedSeats.length === 0}>
          {t.matches.reserveSelectedSeats}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.matches.completeReservation}</DialogTitle>
            <DialogDescription>
              {t.matches.reservingSeats}: {selectedSeats.sort((a, b) => a - b).join(", ")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ms-name">{t.matches.fullName}</Label>
              <Input id="ms-name" {...form.register("customerName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ms-phone">{t.matches.phoneNumber}</Label>
              <Input
                id="ms-phone"
                placeholder="09XXXXXXXX or +9639XXXXXXXX"
                {...form.register("customerPhone")}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.matches.cancel}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t.matches.saving : t.matches.confirmReservation}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {previousMatchReservations.length > 0 ? (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <p className="text-sm font-medium">{t.matches.previousSeatReservations}</p>
          <div className="space-y-2">
            {previousMatchReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground"
              >
                <span className="font-medium text-foreground">{reservation.match_title}</span> -{" "}
                {t.matches.seat}{" "}
                {reservation.seat_number} - {formatDateTime(reservation.created_at)}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
