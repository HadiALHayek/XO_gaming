import { Skeleton } from "@/components/ui/skeleton";

export default function BookLoading() {
  return (
    <div className="container space-y-8 py-12">
      <div className="space-y-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Skeleton className="h-[640px] w-full" />
        <Skeleton className="h-[640px] w-full" />
      </div>
    </div>
  );
}
