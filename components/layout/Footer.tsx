import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-background/40 backdrop-blur-xl">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4 text-neon-cyan" />
          <span>XO Gaming</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/book" className="hover:text-foreground">
            Book
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
        </div>
        <div>(c) {new Date().getFullYear()} XO Gaming. All rights reserved.</div>
      </div>
    </footer>
  );
}
