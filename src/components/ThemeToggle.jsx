import { useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme';
import { prepareInk, switchTheme } from '../themeTransition';

// Day/night switch, fixed in the top-right corner over every screen: the intro,
// the game and the pages. It shows where it takes you: a moon by day, a sun by night.
// Hovering it stirs the symbiote underneath.
export default function ThemeToggle() {
  const theme = useTheme();
  const ref = useRef(null);

  const centre = () => {
    const r = ref.current.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  };

  // Get the ink ready while the page is idle
  useEffect(() => {
    const whenIdle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 300));
    whenIdle(prepareInk);
  }, []);

  const next = theme === 'day' ? 'night' : 'day';
  return (
    <div className="theme-toggle fixed right-4 top-4 z-[300] h-10 w-10">
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          // After a mouse click, drop focus so the game's Space-to-jump doesn't press it again
          if (e.detail > 0) e.currentTarget.blur();
          switchTheme(...centre());
        }}
        className="retro-btn grid h-10 w-10 cursor-pointer place-items-center bg-[#282828] text-white hover:bg-[#383838]"
        aria-label={`Switch to ${next}`}
        title={`Switch to ${next}`}
      >
        {theme === 'day' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* The symbiote lives under the switch. Hover it and the goo wraps the
          button: woven strands round its border, glossy blobs swelling at the
          corners, fine webs across its face, hair-thin wisps flying off, and a
          few short tendrils curling out around it. It is all snatched back
          when you leave (see index.css). The drawing's top-right is the
          screen's corner; the button's box is (204,16)–(244,56). */}
      <svg aria-hidden viewBox="0 0 260 230" className="pointer-events-none absolute -right-4 -top-4 h-[230px] w-[260px]" fill="none" strokeLinecap="round">
        {TENDRILS.map(({ d, width, delay, grow = 0.7, sway = 1, root }) => (
          <g key={d} className="toggle-tendril" style={{ '--delay': `${delay}ms`, '--grow': `${grow}s`, '--sway': sway, transformOrigin: root }}>
            <path d={d} pathLength="1" stroke="rgba(255,255,255,0.22)" strokeWidth={width + 1.6} />
            <path d={d} pathLength="1" stroke={GOO} strokeWidth={width} />
            {/* Thicker where it leaves the switch */}
            <path d={d} pathLength="1" stroke={GOO} strokeWidth={width * 1.5} style={{ '--len': 0.3 }} />
            <path d={d} pathLength="1" stroke="rgba(255,255,255,0.75)" strokeWidth={width * 0.2} transform="translate(-0.5 -0.6)" />
          </g>
        ))}
        {FRAME.map(({ d, width, delay }) => (
          <g key={d} className="toggle-tendril" style={{ '--delay': `${delay}ms`, '--grow': '0.5s', '--sway': 0 }}>
            <path d={d} pathLength="1" stroke="rgba(255,255,255,0.2)" strokeWidth={width + 1.4} />
            <path d={d} pathLength="1" stroke={GOO} strokeWidth={width} />
            <path d={d} pathLength="1" stroke="rgba(255,255,255,0.8)" strokeWidth={width * 0.18} transform="translate(-0.4 -0.9)" />
          </g>
        ))}
        {WEBS.map((d, i) => (
          <g key={d} className="toggle-tendril" style={{ '--delay': `${420 + i * 35}ms`, '--grow': '0.45s', '--sway': 0 }}>
            <path d={d} pathLength="1" stroke="rgba(255,255,255,0.34)" strokeWidth="0.5" />
          </g>
        ))}
        {WISPS.map(({ d, root }, i) => (
          <g key={d} className="toggle-tendril" style={{ '--delay': `${380 + i * 60}ms`, '--grow': '0.5s', '--sway': 2.2, transformOrigin: root }}>
            <path d={d} pathLength="1" stroke="rgba(255,255,255,0.2)" strokeWidth="1.9" />
            <path d={d} pathLength="1" stroke={GOO} strokeWidth="1" />
          </g>
        ))}
        {BLOBS.map(([cx, cy, rx, ry, turn], i) => (
          <g key={`${cx},${cy}`} className="toggle-blob" style={{ '--delay': `${180 + i * 70}ms`, transformOrigin: `${cx}px ${cy}px` }}>
            <g transform={`rotate(${turn} ${cx} ${cy})`}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={GOO} stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
              <ellipse cx={cx - rx * 0.28} cy={cy - ry * 0.4} rx={rx * 0.4} ry={ry * 0.2} fill="rgba(255,255,255,0.85)" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

const GOO = '#06070c';

// Each tendril: its path from where it comes out from under the switch to its
// curled tip, its thickness, how long after the hover it stirs and how long it
// takes to grow, how much it sways, and the point it sways about.
const TENDRILS = [
  // Into the corner of the screen
  { d: 'M240 20 C248 14 256 13 256 6 C256 0 247 1 249 7', width: 3, delay: 120, grow: 0.5, root: '240px 20px' },
  // Two short ones hanging below
  { d: 'M210 55 C206 66 198 70 196 79 C195 85 201 87 203 82', width: 3.2, delay: 180, grow: 0.55, root: '210px 55px' },
  { d: 'M232 56 C235 66 230 74 233 82 C235 87 229 89 228 84', width: 2.8, delay: 260, grow: 0.55, root: '232px 56px' },
  // One to each side and one over the top
  { d: 'M245 34 C251 35 255 40 254 48 C253 53 248 52 249 48', width: 2.8, delay: 220, grow: 0.5, root: '245px 34px' },
  { d: 'M204 48 C197 52 192 50 188 55 C185 59 189 62 192 59', width: 2.6, delay: 300, grow: 0.5, root: '204px 48px' },
  { d: 'M214 16 C210 9 200 8 195 12 C191 15 194 20 198 17', width: 2.8, delay: 340, grow: 0.5, root: '214px 16px' },
];

// The goo wrapped round the button's border: on each side a fat strand and a
// thinner one woven across it, each running a little past the corners.
const FRAME = [
  { d: 'M199 18 C210 12 224 21 236 15 C241 13 247 14 249 18', width: 6, delay: 0 },
  { d: 'M243 11 C248 22 240 36 245 46 C247 52 246 58 242 61', width: 6, delay: 70 },
  { d: 'M249 54 C238 60 224 51 212 57 C207 59 201 58 199 54', width: 6, delay: 140 },
  { d: 'M205 61 C200 50 208 36 203 26 C201 20 202 14 206 11', width: 6, delay: 210 },
  { d: 'M202 13 C214 19 230 11 247 17', width: 3, delay: 120 },
  { d: 'M247 14 C241 26 249 40 243 59', width: 3, delay: 190 },
  { d: 'M246 59 C234 53 218 61 201 55', width: 3, delay: 260 },
  { d: 'M201 58 C207 46 199 32 205 13', width: 3, delay: 330 },
];

// Fine webs strung from each corner across the button's face, towards the icon
const WEBS = [
  'M208 20 C212 24 214 27 217 31', 'M208 20 C214 21 219 22 224 23', 'M208 20 C209 26 209 31 210 37', 'M212 27 C215 26 218 26 220 23',
  'M240 20 C236 24 234 27 231 31', 'M240 20 C239 27 239 32 238 38', 'M240 20 C235 21 231 22 227 22',
  'M240 52 C236 49 233 46 231 42', 'M240 52 C234 51 229 50 223 50', 'M236 44 C237 47 239 48 240 45',
  'M208 52 C212 48 214 46 216 42', 'M208 52 C209 46 209 41 210 36', 'M208 52 C214 51 218 51 222 50',
];

// Hair-thin wisps flying off the frame
const WISPS = [
  { d: 'M246 12 C250 6 252 8 257 2', root: '246px 12px' },
  { d: 'M202 13 C196 9 197 4 189 2', root: '202px 13px' },
  { d: 'M201 59 C194 64 190 61 183 70', root: '201px 59px' },
  { d: 'M247 60 C252 66 249 72 256 79', root: '247px 60px' },
  { d: 'M199 31 C193 32 192 27 186 29', root: '199px 31px' },
  { d: 'M225 60 C224 66 229 68 226 75', root: '225px 60px' },
  { d: 'M249 40 C254 41 254 46 258 44', root: '249px 40px' },
];

// Glossy blobs where the strands bunch up: [centre x, centre y, radius x, radius y, turn in degrees]
const BLOBS = [
  [205, 17, 7, 5, -40], [244, 17, 6.5, 5, 35], [243, 56, 7, 5.5, -35], [205, 56, 6, 5, 40],
  [226, 15, 4.5, 3, 0], [245, 38, 3, 4.5, 0], [221, 57, 4, 2.8, 0],
];
