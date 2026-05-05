export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-neon-purple/25 blur-[140px] animate-pulse-neon" />
      <div className="absolute top-1/3 right-[-10%] h-[360px] w-[520px] rounded-full bg-neon-cyan/20 blur-[120px] animate-pulse-neon" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[340px] w-[520px] rounded-full bg-neon-purple/20 blur-[120px] animate-pulse-neon" />
    </div>
  );
}
