"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PublicError({
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
    <div className="container py-20">
      <div className="glass mx-auto max-w-md p-8 text-center">
        <h2 className="font-display text-xl font-semibold">
          We hit a snag
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "Please try again."}
        </p>
        <div className="mt-5 flex justify-center">
          <Button onClick={reset}>Retry</Button>
        </div>
      </div>
    </div>
  );
}
