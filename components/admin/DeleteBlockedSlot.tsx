"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteBlockedSlot } from "@/actions/blocked-slots";

export function DeleteBlockedSlot({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="icon"
      variant="ghost"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const r = await deleteBlockedSlot(id);
          if (r.ok) toast.success("Maintenance window removed");
          else toast.error(r.error);
        })
      }
    >
      <Trash2 className="h-4 w-4 text-red-400" />
    </Button>
  );
}
