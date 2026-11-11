// The day/night switch. The View Transitions API snapshots the screen before
// and after the theme changes, and the "after" snapshot is revealed by the
// symbiote spreading from the toggle (ink.js): its outline is redrawn every
// frame as a sharp vector clip-path, and its glossy goo and tendrils are drawn
// on a live canvas that has its own view-transition-name, so it sits above both.
// With reduced motion, or without WebGL, the browser's plain crossfade runs
// instead; without View Transitions the theme just switches.
import { flushSync } from 'react-dom';
import { getTheme, setTheme } from './theme';
import { EventBus } from './game/EventBus';
import { loadInk } from './ink';

let running = false;

/** Compile the ink's shaders ahead of time, so the first switch starts at once. */
export function prepareInk() {
  loadInk().catch(() => {});
}

/** Flip the theme, with the ink spreading from (x, y) px. Clicks during a switch are ignored. */
export async function switchTheme(x, y) {
  if (running) return;
  const next = getTheme() === 'day' ? 'night' : 'day';
  const apply = () => flushSync(() => setTheme(next));
  if (!document.startViewTransition) {
    apply();
    return;
  }

  running = true;
  const root = document.documentElement;
  let ink = null;
  try {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    ink = reduceMotion ? null : await loadInk().catch(() => null);
    if (ink) root.dataset.ink = '';

    // Going to night the suit goes on; going to day it strips off
    const frame = ink?.spread({ x, y, width: innerWidth, height: innerHeight, mode: next === 'night' ? 'on' : 'off' });
    let firstPath = '';

    // Animation frames are held back until the "after" snapshot is taken, so
    // the game is asked to draw its new sky straight away instead of on its next
    // frame, and the goo's first frame is drawn now
    const transition = document.startViewTransition(() => {
      apply();
      EventBus.emit('render-now');
      if (frame) {
        document.body.append(ink.canvas);
        firstPath = frame(0);
      }
    });

    if (frame && (await transition.ready.then(() => true, () => false))) {
      const clip = (path) => {
        const keyframe = { clipPath: `path("${path}")` };
        return [keyframe, keyframe];
      };
      const reveal = root.animate(clip(firstPath), {
        duration: frame.duration,
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)',
      });
      // Redraw the goo and the outline every frame; the transition ends when this animation does
      const tick = () => {
        if (reveal.playState !== 'running') return;
        reveal.effect.setKeyframes(clip(frame(Math.min(1, (reveal.currentTime ?? 0) / frame.duration))));
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    await transition.finished;
  } finally {
    delete root.dataset.ink;
    ink?.canvas.remove();
    running = false;
  }
}
