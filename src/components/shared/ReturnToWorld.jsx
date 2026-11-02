import { useNavigate } from 'react-router-dom';

// ── Return to World ──────────────────────────────────────────────────────────
// Closing button on every section page. A solid pixel-game button in the same
// face as the in-game block labels, with the knight in it — idling, and
// breaking into a run on hover. Styles: .pixel-button / .knight-icon (index.css).
export function ReturnToWorld({ className = 'pb-20' }) {
  const navigate = useNavigate();
  return (
    <footer className={`relative z-10 flex justify-center ${className}`}>
      <button type="button" onClick={() => navigate('/')} className="pixel-button">
        <span aria-hidden className="knight-icon" />
        Return to World
      </button>
    </footer>
  );
}
