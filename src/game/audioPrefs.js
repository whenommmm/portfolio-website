// Whether the player muted the game, remembered across visits. Storage can be
// unavailable (private mode, blocked site data), so every access is guarded and
// falls back to unmuted.
const MUTED_KEY = 'portfolio:muted';

export function loadMuted() {
  try {
    return localStorage.getItem(MUTED_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveMuted(muted) {
  try {
    localStorage.setItem(MUTED_KEY, muted ? '1' : '0');
  } catch {
    // Not remembered this time; the toggle still works for this visit
  }
}
