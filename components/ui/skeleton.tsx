import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/[0.04] border border-white/5",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
