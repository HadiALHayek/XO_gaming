import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-neon-purple/40 bg-neon-purple/15 text-neon-purple",
        cyan: "border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan",
        success: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
        warning: "border-amber-400/40 bg-amber-500/15 text-amber-300",
        danger: "border-red-400/40 bg-red-500/15 text-red-300",
        outline: "border-white/15 bg-white/5 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
