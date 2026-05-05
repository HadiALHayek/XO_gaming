"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "border border-white/10 bg-[hsl(240,10%,7%)]/95 backdrop-blur-xl shadow-xl",
          title: "text-foreground",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
