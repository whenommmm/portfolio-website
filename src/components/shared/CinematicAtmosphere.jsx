/**
 * CinematicAtmosphere — the background behind every portfolio page.
 *
 * By night, a deep blue sky that lifts slightly toward the horizon, with an
 * uneven field of stars: mostly faint pinpricks, a few bright ones, and a
 * handful that slowly twinkle, each tinted and haloed in the section's accent
 * colour. By day, a soft blue sky with drifting pixel clouds whose undersides
 * pick up the section's colour (DayClouds). The sky itself is the --sky
 * variable in index.css. No grid.
 */

import { glow } from '../../accent';
import { DayClouds } from './DayClouds';

// Seeded so the sky is the same on every page and every visit.
let seed = 7;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const STARS = Array.from({ length: 170 }, (_, i) => {
  const bright = rand() < 0.08;
  return {
    i,
    bright,
    x: rand() * 100,
    y: rand() * 100,
    size: bright ? 2 : 1 + rand() * 0.5,
    opacity: bright ? 0.7 + rand() * 0.3 : 0.3 + rand() * 0.4,
    twinkle: bright && rand() < 0.6,
    dur: 4 + rand() * 5,
    delay: rand() * -9,
    // How much of the accent colour is mixed into the star's white (30–69%)
    tint: 30 + ((i * 37) % 40),
  };
});

export function CinematicAtmosphere() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'var(--sky)' }}
      >
        <div className="day:hidden">
          {STARS.map((s) => (
            <span
              key={s.i}
              className={`absolute rounded-full ${s.twinkle ? 'animate-twinkle' : ''}`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                background: `color-mix(in oklab, var(--accent-glow) ${s.tint}%, white)`,
                // A tight bright core plus a wide soft halo
                boxShadow: s.bright
                  ? `0 0 4px 1px ${glow()}, 0 0 18px 5px ${glow(55)}`
                  : `0 0 3px 1px ${glow(80)}, 0 0 9px 2px ${glow(45)}`,
                opacity: s.twinkle ? undefined : s.opacity,
                animationDuration: s.twinkle ? `${s.dur}s` : undefined,
                animationDelay: s.twinkle ? `${s.delay}s` : undefined,
              }}
            />
          ))}
        </div>
      </div>
      <DayClouds />
    </>
  );
}
