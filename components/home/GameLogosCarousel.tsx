"use client";

import { useEffect, useState } from "react";
import type { HomeLogoImage } from "@/types";

type Props = {
  logos: HomeLogoImage[];
};

export function GameLogosCarousel({ logos }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (logos.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % logos.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [logos.length]);

  if (logos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          <span className="gradient-text">Featured</span> Game Logos
        </h2>
        <p className="text-sm text-muted-foreground">
          Auto-rotating game highlights from your admin media panel.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <div className="relative h-44 sm:h-56 md:h-72">
          {logos.map((logo, i) => (
            <img
              key={logo.id}
              src={logo.image_url}
              alt="Game logo slide"
              className={[
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                i === index ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        </div>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {logos.map((logo, i) => (
            <button
              key={logo.id}
              type="button"
              aria-label={`Go to logo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={[
                "h-2.5 w-2.5 rounded-full transition",
                i === index ? "bg-neon-cyan" : "bg-white/40 hover:bg-white/70",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
