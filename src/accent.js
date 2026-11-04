// The current section's accent colours at a given strength (0–100, omitted for
// full). They're the --accent-* variables in index.css: amber by default, and
// swapped per section through data-accent (see sections.js).
const mix = (name) => (pct) =>
  pct === undefined ? `var(${name})` : `color-mix(in oklab, var(${name}) ${pct}%, transparent)`;

export const glow = mix('--accent-glow');
export const card = mix('--accent-card');
