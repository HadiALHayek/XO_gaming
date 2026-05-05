"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="glass p-8">
      <h2 className="font-display text-lg font-semibold">
        Admin error
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {error.message || "Something went wrong loading this page."}
      </p>
      <div className="mt-4">
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  );
}
