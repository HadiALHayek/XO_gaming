import { Gamepad2, Monitor } from "lucide-react";
import type { DeviceType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  type: DeviceType;
  isActive: boolean;
  status?: "available" | "busy";
  className?: string;
};

export function DeviceCard({
  name,
  type,
  isActive,
  status = "available",
  className,
}: Props) {
  const Icon = type === "PC" ? Monitor : Gamepad2;
  const inactive = !isActive;
  const busy = status === "busy";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:translate-y-[-2px]",
        inactive && "opacity-60",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl border",
            type === "PC"
              ? "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan"
              : "border-neon-purple/40 bg-neon-purple/10 text-neon-purple",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-semibold">{name}</span>
          <span className="text-xs text-muted-foreground">
            {type === "PC" ? "Gaming PC" : "PlayStation 5"}
          </span>
        </div>
        {inactive ? (
          <Badge variant="warning">Maintenance</Badge>
        ) : busy ? (
          <Badge variant="danger">Busy</Badge>
        ) : (
          <Badge variant="success">Available</Badge>
        )}
      </CardContent>
    </Card>
  );
}
