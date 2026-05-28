/**
 * CinematicAtmosphere — unified atmospheric background for all cinematic pages.
 *
 * Layers (bottom to top):
 *  1. Deep navy gradient base
 *  2. Futuristic fine grid overlay (64px, 0.07 opacity)
 *  3. Ambient radial glow crown (amber, top-center)
 *  4. Ambient radial glow (cyan, bottom-left)
 *  5. Ambient radial glow (amber-peach, top-right)
 *  6. Floating star particles (CSS-only, no deps)
 *  7. Edge vignette
 */

const STAR_PARTICLES = Array.from({ length: 32 }, (_, i) => {
  const sx = (i * 9301 + 49297) % 233280;
  const sy = (i * 4096 + 12345) % 233280;
  return {
    i,
    x: (sx / 233280) * 100,
    y: (sy / 233280) * 100,
    size: 1 + ((i * 7) % 3) * 0.6,
    dur: 5 + (i % 7),
    delay: (i % 9) * 0.65,
  };
});

export function CinematicAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">

      {/* 1. Deep navy base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, oklch(0.10 0.04 268) 0%, oklch(0.12 0.04 265) 50%, oklch(0.10 0.04 268) 100%)',
        }}
      />

      {/* 2. Futuristic grid overlay — matches Resume/Contact exactly */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.88 0.04 230) 1px, transparent 1px), linear-gradient(90deg, oklch(0.88 0.04 230) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%)',
        }}
      />

      {/* 3. Amber crown glow — top center */}
      <div
        className="absolute -top-48 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full blur-[160px]"
        style={{
          background:
            'radial-gradient(closest-side, oklch(0.82 0.16 65 / 0.22), transparent)',
        }}
      />

      {/* 4. Cyan bloom — bottom left */}
      <div
        className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full blur-[140px]"
        style={{
          background:
            'radial-gradient(closest-side, oklch(0.68 0.16 245 / 0.16), transparent)',
        }}
      />

      {/* 5. Amber-peach edge bloom — top right */}
      <div
        className="absolute -top-20 -right-32 h-[420px] w-[560px] rounded-full blur-[160px]"
        style={{
          background:
            'radial-gradient(closest-side, oklch(0.78 0.14 55 / 0.13), transparent)',
        }}
      />

      {/* 6. Floating star particles */}
      <div className="absolute inset-0">
        {STAR_PARTICLES.map((p) => (
          <span
            key={p.i}
            className="absolute rounded-full animate-twinkle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: 'oklch(0.96 0.02 85)',
              boxShadow: '0 0 6px oklch(0.82 0.16 65 / 0.5)',
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 7. Edge vignette — pulls edges into darkness */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, oklch(0.08 0.04 265 / 0.80) 100%)',
        }}
      />
    </div>
  );
}
