"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteMatch } from "@/actions/matches";
import { Button } from "@/components/ui/button";

export function MatchActions({ matchId }: { matchId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="icon"
      variant="ghost"
      title="Delete match"
      disabled={isPending}
      onClick={() => {
        const ok = window.confirm("Delete this match and all seat reservations?");
        if (!ok) return;
        startTransition(async () => {
          const result = await deleteMatch(matchId);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Match deleted");
        });
      }}
    >
      <Trash2 className="h-4 w-4 text-red-400" />
    </Button>
  );
}
