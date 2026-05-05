import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminUser } from "@/lib/auth";

export async function Navbar() {
  const user = await getAdminUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon">
            <Gamepad2 className="h-5 w-5 text-white" />
          </span>
          <span className="gradient-text font-display tracking-tight">
            NeonArena
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/book"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Book
          </Link>
          <Link
            href={user ? "/admin" : "/admin/login"}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="neon" className="hidden sm:inline-flex">
            <Link href="/book">Book Now</Link>
          </Button>
          <Button asChild size="sm" className="sm:hidden">
            <Link href="/book">Book</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
