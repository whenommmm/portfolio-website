/**
 * DayClouds — the day sky's answer to the night's tinted stars: puffy pixel
 * clouds drifting slowly across a sky that runs the whole length of the page. Each is a cluster of round puffs on
 * a flat base, lit white from the upper left, with the section's accent colour
 * gathering softly in the shaded sides and undersides, step by step rather
 * than in a band.
 */

import { useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from '../../theme';

// Seeded so the clouds are the same shapes on every page and every visit.
let seed = 23;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Sunlight from the upper left, a little in front of the cloud
const LIGHT = (() => {
  const v = [-0.35, -0.8, 0.5];
  const m = Math.hypot(...v);
  return v.map((c) => c / m);
})();

// How much of the accent colour is mixed into the white at each shade step
const TONES = [0, 0.06, 0.13, 0.21, 0.3, 0.4, 0.52];
const EMPTY = 255;
// A 2×2 ordered dither, so each step feathers into the next
const DITHER = [
  [-0.12, 0.04],
  [0.12, -0.04],
];

/** A cumulus cloud about `w` cells wide, as a grid of shade steps. */
function shapeCloud(w) {
  const n = 3 + Math.round(w / 20 + rand() * 1.5);
  const puffs = Array.from({ length: n }, (_, k) => {
    const t = (k + 0.5) / n + (rand() - 0.5) * 0.1;
    // Biggest in the middle, smaller towards the ends
    const r = w * (0.09 + 0.15 * Math.sin(Math.PI * t)) * (0.7 + rand() * 0.6);
    return { x: w * (0.12 + 0.76 * t), y: -r * (0.2 + rand() * 0.45), r };
  });
  // A crown or two heaped on top, for a billowing cumulus
  const crowns = 1 + Math.round(rand());
  for (let k = 0; k < crowns; k++) {
    const r = w * (0.1 + rand() * 0.05);
    puffs.push({ x: w * (0.32 + rand() * 0.36), y: -w * (0.16 + rand() * 0.06), r });
  }
  // The base is y = 0: every puff sits above it, cut flat
  const left = Math.min(...puffs.map((p) => p.x - p.r));
  const top = Math.min(...puffs.map((p) => p.y - p.r));
  const width = Math.ceil(Math.max(...puffs.map((p) => p.x + p.r)) - left);
  const height = Math.ceil(-top);
  const cells = new Uint8Array(width * height).fill(EMPTY);

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const x = left + i + 0.5;
      const y = top + j + 0.5;
      // The cloud's surface is the front-most puff here; its normal sets the light
      let h = 0;
      let nx = 0;
      let ny = 0;
      for (const p of puffs) {
        const dx = x - p.x;
        const dy = y - p.y;
        const h2 = p.r * p.r - dx * dx - dy * dy;
        if (h2 > h * h) {
          h = Math.sqrt(h2);
          nx = dx / p.r;
          ny = dy / p.r;
        }
      }
      if (!h) continue;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const lit = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
      const depth = (y - top) / -top; // 0 at the top, 1 at the base
      // Mostly the light on each puff, so the colour follows its curve; a
      // little more towards the base, where the cloud is thickest
      const shade = 0.9 * (0.45 - 0.65 * lit) + 0.38 * depth * depth;
      const step = Math.floor(shade * TONES.length + DITHER[j & 1][i & 1]);
      cells[j * width + i] = Math.max(0, Math.min(TONES.length - 1, step));
    }
  }
  return { width, height, cells };
}

// Three depths, each drifting at its own pace: far clouds are small, faint and
// slow, near ones big and quicker.
const LAYERS = [
  { cell: 3, size: [22, 34], dur: 180, opacity: 0.7 },
  { cell: 4, size: [28, 40], dur: 130, opacity: 0.85 },
  { cell: 5, size: [34, 46], dur: 95, opacity: 0.95 },
];
// Far clouds are the most common, near ones the rarest
const DEPTHS = [0, 1, 0, 2, 1, 0, 1, 0, 2];
const SPACING = 105; // px of page height per cloud

// Clouds are made on demand, in order, so a longer page just has more of the
// same sky: cloud n is always the same shape in the same place.
const made = [];
function cloudAt(n) {
  while (made.length <= n) {
    const i = made.length;
    const layer = LAYERS[DEPTHS[i % DEPTHS.length]];
    made.push({
      ...shapeCloud(Math.round(layer.size[0] + rand() * (layer.size[1] - layer.size[0]))),
      ...layer,
      // The golden ratio spreads them evenly across the width, however many there are
      phase: (i * 0.618034 + rand() * 0.1) % 1,
      top: (i + 0.15 + rand() * 0.7) * SPACING,
    });
  }
  return made[n];
}

/** The accent colour as [r, g, b], whatever CSS colour syntax it's written in. */
function toRgb(colour) {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#f15a29';
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data;
}

// sRGB (0–255) to and from OKLab, Björn Ottosson's perceptual colour space
const toLinear = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.max(0, c) ** (1 / 2.4) - 0.055);
function oklab(rgb) {
  const [r, g, b] = [...rgb].slice(0, 3).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function fromOklab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(toSrgb);
}

/**
 * The cloud's colour at each shade step: white blended towards the accent.
 * Dark or muted accents are lifted and saturated first, keeping their hue, so
 * their tints come out clearly coloured rather than grey.
 */
function palette(accent) {
  const [L, a, b] = oklab(accent);
  const lit = Math.max(L, 0.62);
  const boost = Math.min(1.6, Math.max(1, 0.17 / (Math.hypot(a, b) || 1)));
  return TONES.map((t) => fromOklab([1 - t * (1 - lit), a * boost * t, b * boost * t]));
}

function paint(canvas, cloud, colours) {
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(cloud.width, cloud.height);
  cloud.cells.forEach((step, k) => {
    if (step !== EMPTY) image.data.set([...colours[step], 255], k * 4);
  });
  ctx.putImageData(image, 0, 0);
}

export function DayClouds() {
  const theme = useTheme();
  const ref = useRef(null);
  const [count, setCount] = useState(8);
  // Positions follow the clock, so the clouds carry on drifting from page to page
  const [start] = useState(() => performance.now() / 1000);

  // Enough clouds to fill the page from top to bottom, however long it is
  useLayoutEffect(() => {
    const fit = () => setCount(Math.max(1, Math.floor(ref.current.parentElement.offsetHeight / SPACING)));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(ref.current.parentElement);
    return () => observer.disconnect();
  }, []);

  // Repaint in the section's colour whenever day comes round, before it's shown
  useLayoutEffect(() => {
    if (theme !== 'day') return;
    const colours = palette(toRgb(getComputedStyle(ref.current).getPropertyValue('--accent-glow').trim()));
    ref.current.querySelectorAll('canvas').forEach((canvas, n) => paint(canvas, cloudAt(n), colours));
  }, [theme, count]);

  // The day sky and its clouds are part of the page: they run its whole length
  // and scroll with it, while each cloud drifts slowly from left to right
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden day:block"
      style={{ background: 'var(--sky)' }}
    >
      {Array.from({ length: count }, (_, n) => {
        const c = cloudAt(n);
        return (
          <canvas
            key={n}
            width={c.width}
            height={c.height}
            className="absolute left-0 origin-top-left animate-cloud-drift max-sm:scale-[0.7] motion-reduce:[animation-play-state:paused]"
            style={{
              top: c.top,
              width: c.width * c.cell,
              height: c.height * c.cell,
              opacity: c.opacity,
              imageRendering: 'pixelated',
              animationDuration: `${c.dur}s`,
              animationDelay: `${-((c.phase * c.dur + start) % c.dur)}s`,
            }}
          />
        );
      })}
    </div>
  );
}
