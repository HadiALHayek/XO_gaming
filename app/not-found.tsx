import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="glass max-w-md p-8 text-center">
        <h1 className="font-display text-3xl font-bold">
          <span className="gradient-text">404</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That page doesn&apos;t exist. Maybe try booking a session instead.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/book">Book</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
