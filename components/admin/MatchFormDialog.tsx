"use client";

import { ReactNode, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toDateTimeLocalInput } from "@/lib/dates";
import {
  matchCreateSchema,
  type MatchCreateInput,
} from "@/lib/matches/schemas";
import { createMatch } from "@/actions/matches";

export function MatchFormDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);

  const form = useForm<MatchCreateInput>({
    resolver: zodResolver(matchCreateSchema),
    defaultValues: {
      title: "",
      matchDate: toDateTimeLocalInput(now),
      details: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createMatch({
        ...values,
        matchDate: new Date(values.matchDate).toISOString(),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Match created");
      form.reset({
        title: "",
        matchDate: toDateTimeLocalInput(now),
        details: "",
      });
      setOpen(false);
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New match</DialogTitle>
          <DialogDescription>Add match date and details for seat reservations.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-title">Match title</Label>
            <Input id="m-title" placeholder="Real Madrid vs Barcelona" {...form.register("title")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-date">Match date</Label>
            <Input id="m-date" type="datetime-local" {...form.register("matchDate")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-details">Details</Label>
            <Textarea id="m-details" placeholder="Tournament, comments, and notes..." {...form.register("details")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create match"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
