import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accent?: "purple" | "cyan" | "amber" | "emerald";
};

const accentMap = {
  purple: "text-neon-purple bg-neon-purple/10 border-neon-purple/30",
  cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30",
  amber: "text-amber-300 bg-amber-500/10 border-amber-400/30",
  emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
} as const;

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border",
                  accentMap[stat.accent ?? "purple"],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </span>
                <span className="text-2xl font-semibold">{stat.value}</span>
                {stat.hint ? (
                  <span className="text-xs text-muted-foreground">
                    {stat.hint}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
