"use client";

import { useEffect, useState } from "react";
import type { HomeDrinkImage } from "@/types";

export function DrinkImagesCarousel({ drinks }: { drinks: HomeDrinkImage[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (drinks.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % drinks.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [drinks.length]);

  if (drinks.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div className="relative aspect-square">
        {drinks.map((drink, i) => (
          <img
            key={drink.id}
            src={drink.image_url}
            alt="Drink slide"
            className={[
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {drinks.map((drink, i) => (
          <button
            key={drink.id}
            type="button"
            aria-label={`Go to drink image ${i + 1}`}
            onClick={() => setIndex(i)}
            className={[
              "h-2.5 w-2.5 rounded-full transition",
              i === index ? "bg-neon-cyan" : "bg-white/40 hover:bg-white/70",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
