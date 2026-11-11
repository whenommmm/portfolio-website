import { Play, ArrowUpRight, Trophy } from 'lucide-react';
import { CinematicAtmosphere } from '../components/shared/CinematicAtmosphere';
import { ReturnToWorld } from '../components/shared/ReturnToWorld';

function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

// ── Accent map ────────────────────────────────────────────────────────────────
const accentMap = {
  amber: {
    ring: 'group-hover:shadow-[0_0_80px_-10px_rgba(255,184,77,0.55)]',
    text: 'text-[#FFB84D] day:text-[#b8620f]',
    border: 'group-hover:border-[#FFB84D]/40',
    from: '#FFB84D',
    chip: 'bg-[#FFB84D]/10 text-[#FFB84D] day:text-[#b8620f] border-[#FFB84D]/20',
  },
  blue: {
    ring: 'group-hover:shadow-[0_0_80px_-10px_rgba(93,169,255,0.55)]',
    text: 'text-[#5DA9FF] day:text-[#1e5bad]',
    border: 'group-hover:border-[#5DA9FF]/40',
    from: '#5DA9FF',
    chip: 'bg-[#5DA9FF]/10 text-[#5DA9FF] day:text-[#1e5bad] border-[#5DA9FF]/20',
  },
  violet: {
    ring: 'group-hover:shadow-[0_0_80px_-10px_rgba(167,139,250,0.55)]',
    text: 'text-[#B8A3FF] day:text-[#5b3fc0]',
    border: 'group-hover:border-[#A78BFA]/40',
    from: '#A78BFA',
    chip: 'bg-[#A78BFA]/10 text-[#B8A3FF] day:text-[#5b3fc0] border-[#A78BFA]/20',
  },
  cyan: {
    ring: 'group-hover:shadow-[0_0_80px_-10px_rgba(120,220,200,0.55)]',
    text: 'text-[#7DDCC8] day:text-[#1f7a68]',
    border: 'group-hover:border-[#7DDCC8]/40',
    from: '#7DDCC8',
    chip: 'bg-[#7DDCC8]/10 text-[#7DDCC8] day:text-[#1f7a68] border-[#7DDCC8]/20',
  },
};

// ── Project Card ──────────────────────────────────────────────────────────────
const linkIcons = { GitHub: GithubIcon, 'Jam Results': Trophy, 'Post on X': XIcon };

function ProjectCard({ index, title, tech, description, highlights, achievement, ranks, links, accent }) {
  const a = accentMap[accent];
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] day:border-foreground/12 bg-white/[0.02] day:bg-white/70 backdrop-blur-xl transition-all duration-500 ${a.border} ${a.ring} hover:-translate-y-1`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(135deg, ${a.from}22, transparent 40%, ${a.from}11 100%)` }}
      />
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full blur-3xl opacity-60 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${a.from}40 0%, transparent 70%)` }}
      />

      {/* Preview pane */}
      <div className="relative h-44 overflow-hidden border-b border-white/[0.06] day:border-foreground/12">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${a.from}25 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${a.from}30, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(to right, ${a.from}30 1px, transparent 1px), linear-gradient(to bottom, ${a.from}30 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          }}
        />
        <span
          className={`absolute -bottom-6 right-5 select-none font-display text-[8rem] font-bold leading-none tracking-tighter opacity-[0.08] ${a.text}`}
        >
          {index}
        </span>
        <div className="absolute bottom-3 left-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 day:text-foreground/55">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: a.from }} />
          Project {index}
        </div>
      </div>

      {/* Fills the card, so the links sit on the bottom edge whatever the content length */}
      <div className="relative flex flex-1 flex-col p-6 sm:p-7">
        <h3
          className={`text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-gradient-card-${accent}`}
          style={{ filter: `drop-shadow(0 0 24px ${a.from}30)`, letterSpacing: '-0.01em' }}
        >
          {title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tech.map((t) => (
            <span
              key={t}
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${a.chip}`}
            >
              {t}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>

        <ul className="mt-5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-xs text-white/70 day:text-foreground/75">
              <span
                className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full"
                style={{ background: a.from, boxShadow: `0 0 8px ${a.from}` }}
              />
              {h}
            </li>
          ))}
        </ul>

        {achievement && (
          <div
            className="mt-5 rounded-lg border border-white/10 day:border-foreground/12 bg-white/[0.03] day:bg-white/70 p-3"
            style={{ borderColor: `${a.from}30` }}
          >
            <div className="flex items-start gap-3">
              <Trophy className={`h-4 w-4 shrink-0 ${a.text}`} style={{ color: a.from }} />
              <p className="text-pretty text-xs leading-relaxed text-white/80 day:text-foreground/85">{achievement}</p>
            </div>

            {/* Per-category jam ranks */}
            {ranks && (
              <dl
                className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t pt-3"
                style={{ borderColor: `${a.from}20` }}
              >
                {ranks.map(([label, rank]) => (
                  <div key={label} className="flex flex-row-reverse items-baseline justify-end gap-2">
                    <dt className="font-mono text-[9px] uppercase leading-snug tracking-wider text-white/50 day:text-foreground/60">{label}</dt>
                    <dd className="w-7 shrink-0 font-display text-sm font-semibold" style={{ color: a.from }}>
                      #{rank}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {links.map((link) => {
            const isDemo = link.label === 'Play Demo';
            const Icon = linkIcons[link.label] ?? Play;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={
                  isDemo
                    ? 'group/btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#060816] transition-all hover:scale-[1.03]'
                    : 'group/btn inline-flex items-center gap-1.5 rounded-full border border-white/15 day:border-foreground/12 bg-white/[0.04] day:bg-white/70 px-4 py-2 text-xs font-medium text-white/90 day:text-foreground/90 transition-all hover:border-white/30 day:hover:border-foreground/25 hover:bg-white/[0.08] day:hover:bg-white'
                }
                style={
                  isDemo
                    ? {
                        background: `linear-gradient(135deg, ${a.from}, ${a.from}cc)`,
                        boxShadow: `0 8px 24px -8px ${a.from}80`,
                      }
                    : undefined
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </a>
            );
          })}
        </div>
      </div>
    </article>
  );
}

// ── Project data ──────────────────────────────────────────────────────────────
const projects = [
  {
    index: '01',
    title: 'Monsters Inc.',
    tech: ['Unity', 'C#', 'WebGL', 'Puzzle', 'Game Jam'],
    description: 'A turn-based puzzle game: stop closet monsters reaching your bed with nothing but toy blocks and wall outlets.',
    highlights: [
      'Turn-based grid & block pushing',
      'Outlet turrets powered by blocks',
      'Monsters detour or chew through walls',
      'Monster schedule shown up front',
      'Unlimited undo & instant restart',
      '10 rooms, one exact solution each',
    ],
    achievement: 'Ranked #43 overall of 207 ranked entries in the Bezi Mega Jam 2026, from 23 ratings. Made solo.',
    ranks: [
      ['Overall', 43],
      ['Scope & Completion', 25],
      ['Technical Execution', 40],
      ['Polish & Presentation', 40],
      ['Gameplay & Core Idea', 43],
      ['Creativity & Theme', 93],
    ],
    links: [
      { label: 'Play Demo', href: 'https://whenommm.itch.io/monsters-inc' },
      { label: 'Jam Results', href: 'https://itch.io/jam/bezi-mega-jam-1/rate/5068009' },
    ],
    accent: 'violet',
  },
  {
    index: '02',
    title: 'Later',
    tech: ['JavaScript', 'HTML/CSS', 'Web Audio', 'Game Jam'],
    description: 'A 20-second dodge game with a twist: weave your little moon through bright green pills for points, until the final seconds show what you were really dodging.',
    highlights: [
      'Exactly 20 seconds of play',
      'Three endings shaped by your choices',
      'Simulated bots prove every pill is dodgeable',
      'Mouse, touch & keyboard controls',
      'All sound synthesized with Web Audio',
      'Built overnight, no libraries',
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/whenommmm/20-second-jam' },
      { label: 'Play Demo', href: 'https://later-alpha.vercel.app' },
      { label: 'Post on X', href: 'https://x.com/whenommm/status/2115937092534722593' },
    ],
    accent: 'cyan',
  },
  {
    index: '03',
    title: 'PongPing',
    tech: ['Unity', 'C#', 'WebGL', 'Game Jam'],
    description: 'A reverse-pong inspired arcade game where the player controls the ball instead of paddles.',
    highlights: [
      'Time-based difficulty scaling',
      'Procedural block spawning',
      'Collision systems',
      'Object pooling logic',
      'UI game over flow',
      'Fast arcade gameplay loop',
    ],
    achievement: 'Ranked #228 overall and #120 in Enjoyment among 517 ranked entries.',
    links: [
      { label: 'GitHub', href: 'https://github.com/whenommmm/PongPing' },
      { label: 'Play Demo', href: 'https://whenommm.itch.io/pongping' },
    ],
    accent: 'amber',
  },
  {
    index: '04',
    title: 'Griddle',
    tech: ['Unity', 'C#', 'WebGL', 'Puzzle'],
    description: 'A crossword with amnesia — guess words Wordle-style without clues as the grid confesses global deduction rules with each solve.',
    highlights: [
      'Cryptic rule-deduction puzzle mechanic',
      'Wordle-style letter validation & feedback',
      '20 hand-crafted progression levels',
      'Daily puzzle mode with persistent streaks',
      'Endless procedural puzzle generation',
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/whenommmm/griddle' },
      { label: 'Play Demo', href: 'https://whenommm.itch.io/playgriddle' },
    ],
    accent: 'blue',
  },
  {
    index: '05',
    title: 'FallingBlocks',
    tech: ['Unity', 'C#', 'WebGL'],
    description: 'A 2D arcade survival game focused on Unity mechanics and scripting fundamentals.',
    highlights: [
      'Keyboard movement systems',
      'Collision detection',
      'Dynamic difficulty scaling',
      'Procedural obstacle spawning',
      'Event-driven game systems',
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/whenommmm/falling-blocks' },
      { label: 'Play Demo', href: 'https://whenommmm.github.io/falling-blocks-build/' },
    ],
    accent: 'violet',
  },
  {
    index: '06',
    title: 'SphereRunner',
    tech: ['Unity', 'C#', 'Game Design'],
    description: 'A precision-focused 2D runner built around movement timing and obstacle patterns.',
    highlights: [
      'Precision movement systems',
      'Obstacle behavior design',
      'Scene management',
      'Collision systems',
      'Level progression structure',
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/whenommmm/SphereRunner' }],
    accent: 'cyan',
  },
  {
    index: '07',
    title: 'WorldOfShadows',
    tech: ['GDevelop', 'Photopea', 'Level Design'],
    description: 'A single-level 2D platformer focused on event-driven logic and gameplay readability.',
    highlights: [
      'Enemy movement systems',
      'Jump-through platforms',
      'Gameplay pacing',
      'Progression flow',
      'Platform readability',
    ],
    links: [{ label: 'Play Demo', href: 'https://gd.games/games/52c558b6-0bc4-4209-bfc3-84e4d6da34fe' }],
    accent: 'amber',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  return (
    <main
      className="relative min-h-screen"
      style={{ background: 'oklch(0.10 0.04 268)' }}
    >
      <CinematicAtmosphere />
      <div className="relative z-[1]">

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-12 text-center sm:pt-32 sm:pb-16">
        <div className="animate-fade-up">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 day:border-foreground/12 bg-white/[0.03] day:bg-white/70 px-3 py-1 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFB84D] opacity-75 day:bg-primary" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FFB84D] day:bg-primary" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70 day:text-foreground/75">
              Vansh Srivastava · Game Designer
            </span>
          </div>

          <h1
            className="text-gradient-amber font-display text-6xl font-semibold tracking-tight sm:text-7xl md:text-8xl"
            style={{
              filter:
                'drop-shadow(0 0 30px rgba(255, 200, 130, 0.18)) drop-shadow(0 2px 18px rgba(255, 170, 100, 0.12))',
              letterSpacing: '-0.02em',
            }}
          >
            Projects
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-up"
            style={{ animationDelay: '0.15s' }}
          >
            Interactive experiments, gameplay systems, and small worlds built through
            curiosity and iteration.
          </p>

          <div
            className="mx-auto mt-10 h-px w-32 animate-fade-up bg-gradient-to-r from-transparent via-[rgba(255,184,77,0.6)] to-transparent day:via-primary/60"
            style={{ animationDelay: '0.3s' }}
          />
        </div>
      </section>

      {/* Project grid: two per row, every card as tall as the tallest; an odd last card is centred on its own row */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-1 gap-6 md:auto-rows-fr md:grid-cols-2 md:gap-7">
          {projects.map((p, i) => {
            const isLoneLast = i === projects.length - 1 && projects.length % 2 === 1;
            return (
              <div
                key={p.title}
                className={`animate-fade-up ${isLoneLast ? 'md:col-span-2 md:mx-auto md:w-[calc(50%-0.875rem)]' : ''}`}
                style={{ animationDelay: `${0.4 + i * 0.12}s` }}
              >
                <ProjectCard {...p} />
              </div>
            );
          })}
        </div>

        <ReturnToWorld className="mt-24" />
      </section>
      </div>
    </main>
  );
}
