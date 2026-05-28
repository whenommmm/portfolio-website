import { Play, ArrowUpRight, Trophy } from 'lucide-react';
import { CinematicAtmosphere } from '../components/shared/CinematicAtmosphere';

function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Accent map ────────────────────────────────────────────────────────────────
const accentMap = {
  amber: {
    ring: 'group-hover:shadow-[0_0_80px_-10px_rgba(255,184,77,0.55)]',
    text: 'text-[#FFB84D]',
    border: 'group-hover:border-[#FFB84D]/40',
    from: '#FFB84D',
    chip: 'bg-[#FFB84D]/10 text-[#FFB84D] border-[#FFB84D]/20',
  },
  blue: {
    ring: 'group-hover:shadow-[0_0_80px_-10px_rgba(93,169,255,0.55)]',
    text: 'text-[#5DA9FF]',
    border: 'group-hover:border-[#5DA9FF]/40',
    from: '#5DA9FF',
    chip: 'bg-[#5DA9FF]/10 text-[#5DA9FF] border-[#5DA9FF]/20',
  },
  violet: {
    ring: 'group-hover:shadow-[0_0_80px_-10px_rgba(167,139,250,0.55)]',
    text: 'text-[#B8A3FF]',
    border: 'group-hover:border-[#A78BFA]/40',
    from: '#A78BFA',
    chip: 'bg-[#A78BFA]/10 text-[#B8A3FF] border-[#A78BFA]/20',
  },
  cyan: {
    ring: 'group-hover:shadow-[0_0_80px_-10px_rgba(120,220,200,0.55)]',
    text: 'text-[#7DDCC8]',
    border: 'group-hover:border-[#7DDCC8]/40',
    from: '#7DDCC8',
    chip: 'bg-[#7DDCC8]/10 text-[#7DDCC8] border-[#7DDCC8]/20',
  },
};

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ index, title, tech, description, highlights, achievement, links, accent }) {
  const a = accentMap[accent];
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl transition-all duration-500 ${a.border} ${a.ring} hover:-translate-y-1`}
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
      <div className="relative h-44 overflow-hidden border-b border-white/[0.06]">
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
        <div className="absolute bottom-3 left-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: a.from }} />
          Project {index}
        </div>
      </div>

      <div className="relative p-6 sm:p-7">
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
            <li key={h} className="flex items-start gap-2 text-xs text-white/70">
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
            className="mt-5 flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
            style={{ borderColor: `${a.from}30` }}
          >
            <Trophy className={`h-4 w-4 shrink-0 ${a.text}`} style={{ color: a.from }} />
            <p className="text-xs leading-relaxed text-white/80">{achievement}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {links.map((link) => {
            const isDemo = link.label === 'Play Demo';
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={
                  isDemo
                    ? 'group/btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#060816] transition-all hover:scale-[1.03]'
                    : 'group/btn inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/90 transition-all hover:border-white/30 hover:bg-white/[0.08]'
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
                {link.label === 'GitHub' ? <GithubIcon className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
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
    achievement: 'Ranked #228 overall and #120 in Enjoyment among 523 entries.',
    links: [
      { label: 'GitHub', href: 'https://github.com/whenommm' },
      { label: 'Play Demo', href: 'https://itch.io' },
    ],
    accent: 'amber',
  },
  {
    index: '02',
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
      { label: 'GitHub', href: 'https://github.com/whenommm' },
      { label: 'Play Demo', href: 'https://github.com/whenommm' },
    ],
    accent: 'blue',
  },
  {
    index: '03',
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
    links: [{ label: 'GitHub', href: 'https://github.com/whenommm' }],
    accent: 'violet',
  },
  {
    index: '04',
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
    links: [{ label: 'Play Demo', href: 'https://gdevelop.io' }],
    accent: 'cyan',
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
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFB84D] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FFB84D]" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
              Vansh Srivastava · Game Developer
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
            className="mx-auto mt-10 h-px w-32 animate-fade-up"
            style={{
              animationDelay: '0.3s',
              background: 'linear-gradient(to right, transparent, rgba(255,184,77,0.6), transparent)',
            }}
          />
        </div>
      </section>

      {/* Project grid */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7">
          {projects.map((p, i) => (
            <div
              key={p.title}
              className="animate-fade-up"
              style={{ animationDelay: `${0.4 + i * 0.12}s` }}
            >
              <ProjectCard {...p} />
            </div>
          ))}
        </div>

        <footer className="mt-24 flex flex-col items-center gap-2 text-center">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
            End of transmission
          </p>
        </footer>
      </section>
      </div>
    </main>
  );
}
