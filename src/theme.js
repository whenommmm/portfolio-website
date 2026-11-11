// Site-wide day/night theme. The current theme lives on <html data-theme>,
// set before first paint by the inline script in index.html (the visitor's
// clock until they use the switch), remembered in localStorage once they do,
// and announced to the game on the EventBus.
import { useSyncExternalStore } from 'react';
import { EventBus } from './game/EventBus';

const STORAGE_KEY = 'theme';
const listeners = new Set();

export function getTheme() {
  return document.documentElement.dataset.theme === 'night' ? 'night' : 'day';
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this visit
  }
  listeners.forEach((listener) => listener());
  EventBus.emit('theme-change', theme);
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The current theme, re-rendering when it changes. */
export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme);
}
