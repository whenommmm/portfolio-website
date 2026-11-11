import { ArrowUpRight, Award, Play, Trophy } from 'lucide-react';
import { CinematicAtmosphere } from '../components/shared/CinematicAtmosphere';
import { Reveal } from '../components/shared/Reveal';
import { ReturnToWorld } from '../components/shared/ReturnToWorld';

// ── Experience data (newest first) ────────────────────────────────────────────
const ENTRIES = [
  {
    kind: 'Game Jam',
    date: 'Sep 2026',
    title: 'Bezi Mega Jam 2026',
    role: 'Solo entry, made in Unity',
    subject: 'Monsters Inc.',
    description:
      'The theme was Genre Collision: smash two genres together and make them work. I crossed a turn-based block-pushing puzzle with tower defense. You protect your bed by crushing monsters with blocks, or by pushing blocks onto outlets that zap anything nearby.',
    highlights: [
      'Ten rooms, each with exactly one solution',
      'The whole monster schedule is shown up front, so players can plan every move',
      'Unlimited undo and instant restart, so trying an idea costs nothing',
    ],
    result: { icon: Trophy, text: 'Ranked #43 overall of 207 ranked entries, and #25 for Scope & Completion.' },
    links: [
      { label: 'Play', href: 'https://whenommm.itch.io/monsters-inc', icon: Play },
      { label: 'Jam Results', href: 'https://itch.io/jam/bezi-mega-jam-1/rate/5068009', icon: Trophy },
    ],
  },
  {
    kind: 'Game Jam',
    date: 'Mar 2026',
    title: 'Bad Ideas Game Jam 2026',
    role: 'Solo entry, made in Unity',
    subject: 'PongPing',
    description:
      'The theme was Outside the Box, so I turned one of the first video games inside out: in PongPing you play as the ball, not the paddles.',
    highlights: [
      'Difficulty ramps up the longer you survive',
      'Blocks spawn procedurally, so every run plays differently',
      'Fast arcade runs that last a few seconds each',
    ],
    result: { icon: Trophy, text: 'Ranked #120 for Enjoyment and #228 overall, of 517 ranked entries.' },
    links: [
      { label: 'Play', href: 'https://whenommm.itch.io/pongping', icon: Play },
      { label: 'Jam Results', href: 'https://itch.io/jam/bad-ideas-game-jam-2026/rate/4326710', icon: Trophy },
    ],
  },
  {
    kind: 'Internship',
    date: 'Nov 2025 – Jan 2026',
    title: 'VeritusAI',
    role: 'Business Development Intern',
    subject: 'Osaka, Japan (remote)',
    description:
      "Led outreach and onboarding for an AI research platform's first users: academic researchers and IIT professors.",
    highlights: [
      'Ran cold messaging campaigns to academic researchers',
      'Wrote personalized messages to onboard each professor',
      'Found and qualified high-intent users',
    ],
  },
  {
    kind: 'Studio',
    date: 'Sep 2025',
    title: 'Subatomic Forge Studios',
    role: 'Beta Tester',
    subject: 'The Space Between',
    description:
      'Playtested active builds of The Space Between with the studio, finding where players struggled and giving feedback on how the game felt to play.',
    highlights: [
      'Spotted usability problems and points of player friction',
      'Gave balancing feedback during live iterations',
      'Reported gameplay bugs across testing phases',
    ],
    result: { icon: Award, text: "Named in the game's credits." },
  },
];

// ── Timeline entry ────────────────────────────────────────────────────────────
function Entry({ kind, date, title, role, subject, description, highlights, result, links }) {
  return (
    <div className="group relative pl-10">
      {/* Dot on the timeline, level with the tab */}
      <div className="absolute left-2 top-[12px] h-2 w-2 -translate-x-1/2 rounded-full bg-primary ring-4 ring-background transition-all duration-300 group-hover:shadow-glow" />

      <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
        {/* The entry's kind, as a folder tab on top of the card */}
        <div className="relative -mb-px inline-block rounded-t-lg border border-b-0 border-primary bg-primary px-4 pt-2 pb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground">
          {kind}
        </div>

        <article className="glass rounded-2xl rounded-tl-none p-6 transition-colors duration-300 group-hover:border-foreground/20 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            <span className="whitespace-nowrap text-xs text-muted-foreground">{date}</span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {role} <span className="text-muted-foreground/50">·</span>{' '}
            <span className="text-foreground/90">{subject}</span>
          </p>

          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">{description}</p>

          <ul className="mt-5 space-y-2.5">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85 sm:text-[15px]">
                <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 bg-primary" />
                {h}
              </li>
            ))}
          </ul>

          {result && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm">
              <result.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-pretty text-foreground/90">{result.text}</span>
            </div>
          )}

          {links && (
            <div className="mt-6 flex flex-wrap gap-2">
              {links.map(({ label, href, icon: Icon }, i) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    i === 0
                      ? 'group/btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:scale-[1.03]'
                      : 'group/btn inline-flex items-center gap-1.5 rounded-full border border-white/15 day:border-foreground/12 bg-white/[0.04] day:bg-white/70 px-4 py-2 text-xs font-medium text-white/90 day:text-foreground/90 transition-all hover:border-white/30 day:hover:border-foreground/25 hover:bg-white/[0.08] day:hover:bg-white'
                  }
                  style={i === 0 ? { backgroundImage: 'var(--gradient-primary)' } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ExperiencePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <CinematicAtmosphere />

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 text-center md:pt-28 md:pb-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 day:border-foreground/12 bg-white/5 day:bg-white/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/70 backdrop-blur animate-fade-in-up">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
            Quest Log • Experience
          </div>

          <h1
            className="mt-8 text-gradient-hero text-6xl font-semibold tracking-tight md:text-8xl animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            Experience
          </h1>

          <p
            className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Designing games against the clock, and helping studios make theirs better.
          </p>

          <div
            className="mx-auto mt-12 h-px w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          />
        </section>

        {/* Timeline */}
        <section className="relative mx-auto max-w-3xl px-6 pb-24">
          <div className="absolute left-8 top-4 bottom-32 w-px bg-gradient-to-b from-primary/50 via-white/10 day:via-foreground/15 to-transparent" />
          {ENTRIES.map((entry, i) => (
            <Reveal key={entry.title} delay={i === 0 ? 350 : 80} className="mb-6 last:mb-0">
              <Entry {...entry} />
            </Reveal>
          ))}
        </section>
      </main>

      <ReturnToWorld />
    </div>
  );
}
