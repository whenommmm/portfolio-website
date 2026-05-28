// ── Experience data ───────────────────────────────────────────────────────────
const experiences = [
  {
    index: '01',
    company: 'Subatomic Forge Studios',
    role: 'Beta Tester',
    date: 'September 2025',
    description:
      'Worked with the studio to help improve the user experience of the game "The Space Between" — playing through active builds, surfacing friction, and shaping how the game felt in players\' hands.',
    highlights: [
      'Reported gameplay bugs across active testing phases',
      'Identified usability concerns and player friction points',
      'Provided balancing feedback during live iterations',
      'Mentioned in the credits of the game',
    ],
    accent: 'amber',
    meta: 'GAME STUDIO • PLAYTEST',
  },
  {
    index: '02',
    company: 'VeritusAI',
    role: 'Business Development Intern',
    date: 'November 2025 – January 2026',
    location: 'Osaka, Japan — Remote',
    description:
      'Worked on professor outreach and onboarding for academic researchers and IIT professors — leading the top of funnel for an AI research platform\'s earliest adopters.',
    highlights: [
      'Led cold messaging campaigns to academic researchers',
      'Personalized communication for professor onboarding',
      'Identified and qualified high-intent potential users',
      'Supported early adoption and outreach strategy',
    ],
    accent: 'cyan',
    meta: 'AI • RESEARCH OUTREACH',
  },
];

// ── Background FX ─────────────────────────────────────────────────────────────
const STAR_DOTS = Array.from({ length: 28 }, (_, i) => {
  const sx = (i * 9301 + 49297) % 233280;
  const sy = (i * 4096 + 12345) % 233280;
  return {
    i,
    x: (sx / 233280) * 100,
    y: (sy / 233280) * 100,
    size: 1 + ((i * 7) % 3) * 0.5,
    dur: 5 + (i % 7),
    delay: (i % 9) * 0.65,
  };
});

function BackgroundFX() {
  const dots = Array.from({ length: 18 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#060816_0%,#0B1020_55%,#060816_100%)]" />

      {/* Fine 64px futuristic grid — matches Resume/Contact */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.88 0.04 230) 1px, transparent 1px), linear-gradient(90deg, oklch(0.88 0.04 230) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%)',
        }}
      />

      {/* Animated 80px grid pan — existing, preserved */}
      <div className="absolute inset-0 bg-grid-cinematic animate-grid-pan opacity-40" />

      <div
        className="absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full blur-3xl animate-ambient-pulse"
        style={{ background: 'var(--gradient-amber)' }}
      />
      <div
        className="absolute bottom-0 right-[-10%] h-[520px] w-[520px] rounded-full blur-3xl animate-ambient-pulse"
        style={{ background: 'var(--gradient-cyan)', animationDelay: '-4s' }}
      />

      {/* Twinkling star particles — matches Resume/Contact */}
      <div className="absolute inset-0">
        {STAR_DOTS.map((p) => (
          <span
            key={p.i}
            className="absolute rounded-full animate-twinkle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: 'oklch(0.96 0.02 85)',
              boxShadow: '0 0 6px oklch(0.82 0.16 65 / 0.5)',
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Float-slow dots — existing, preserved */}
      <div className="absolute inset-0">
        {dots.map((_, i) => {
          const top = (i * 53) % 100;
          const left = (i * 37 + 11) % 100;
          const size = (i % 3) + 1.5;
          const delay = (i % 7) * -1.3;
          return (
            <span
              key={i}
              className="absolute rounded-full bg-white/40 animate-float-slow"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
                animationDelay: `${delay}s`,
                boxShadow: '0 0 8px oklch(1 0 0 / 0.6)',
                opacity: 0.5,
              }}
            />
          );
        })}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#060816_90%)]" />
    </div>
  );
}

// ── Experience Card ───────────────────────────────────────────────────────────
function ExperienceCard({ exp, reverse }) {
  const isAmber = exp.accent === 'amber';
  return (
    <div
      className={`relative grid items-center gap-10 animate-fade-in-up md:grid-cols-2 md:gap-16 ${
        reverse ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      {/* Meta column */}
      <aside className="relative">
        <div className="relative">
          <div
            className="absolute -inset-10 -z-10 rounded-full blur-3xl opacity-70"
            style={{
              background: isAmber
                ? 'radial-gradient(circle, var(--color-amber-glow) 0%, transparent 65%)'
                : 'radial-gradient(circle, var(--color-cyan-glow) 0%, transparent 65%)',
              opacity: 0.35,
            }}
          />
          <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            {exp.meta}
          </div>
          <div
            className="mt-3 text-[120px] font-semibold leading-none tracking-tighter text-transparent md:text-[160px]"
            style={{
              WebkitTextStroke: `1px ${
                isAmber ? 'oklch(0.82 0.16 65 / 0.55)' : 'oklch(0.68 0.16 245 / 0.55)'
              }`,
            }}
          >
            {exp.index}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                isAmber ? 'border-amber-glow/30 text-amber-glow' : 'border-cyan-glow/30 text-cyan-glow'
              }`}
              style={{
                background: isAmber
                  ? 'oklch(0.82 0.16 65 / 0.08)'
                  : 'oklch(0.68 0.16 245 / 0.08)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: isAmber ? 'var(--color-amber-glow)' : 'var(--color-cyan-glow)',
                  boxShadow: `0 0 10px ${isAmber ? 'var(--color-amber-glow)' : 'var(--color-cyan-glow)'}`,
                }}
              />
              {exp.date}
            </span>
            {exp.location && <span className="text-foreground/60">{exp.location}</span>}
          </div>
        </div>
      </aside>

      {/* Card */}
      <article
        className="group relative glass-card rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 md:p-10"
        style={{
          boxShadow: isAmber
            ? 'var(--shadow-card), var(--shadow-amber-local)'
            : 'var(--shadow-card), var(--shadow-cyan-local)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: isAmber
              ? 'radial-gradient(circle, var(--color-amber-glow) 0%, transparent 70%)'
              : 'radial-gradient(circle, var(--color-cyan-glow) 0%, transparent 70%)',
            opacity: 0.35,
          }}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {exp.role}
          </span>
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: isAmber ? 'var(--color-amber-glow)' : 'var(--color-cyan-glow)',
              boxShadow: `0 0 14px ${isAmber ? 'var(--color-amber-glow)' : 'var(--color-cyan-glow)'}`,
            }}
          />
        </div>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          <span className="text-gradient-hero">{exp.company}</span>
        </h2>

        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
          {exp.description}
        </p>

        <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <ul className="space-y-3.5">
          {exp.highlights.map((h) => (
            <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85 md:text-[15px]">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background: isAmber ? 'var(--color-amber-glow)' : 'var(--color-cyan-glow)',
                  boxShadow: `0 0 8px ${isAmber ? 'var(--color-amber-glow)' : 'var(--color-cyan-glow)'}`,
                }}
              />
              {h}
            </li>
          ))}
        </ul>

        <div
          className="mt-9 h-px w-full opacity-50"
          style={{
            background: isAmber
              ? 'linear-gradient(90deg, transparent, var(--color-amber-glow), transparent)'
              : 'linear-gradient(90deg, transparent, var(--color-cyan-glow), transparent)',
          }}
        />
      </article>
    </div>
  );
}

// ── Closing ───────────────────────────────────────────────────────────────────
function Closing() {
  return (
    <section className="relative mx-auto max-w-3xl px-6 pb-24 text-center">
      <div className="glass-card mx-auto rounded-3xl p-10 md:p-14">
        <div className="mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-amber-glow/70 to-transparent" />
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          The Journey Continues
        </p>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="text-gradient-hero">Always shipping, always learning.</span>
        </h3>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Every project, playtest, and conversation adds another layer.
          The next chapter is already in motion.
        </p>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ExperiencePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <BackgroundFX />

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative mx-auto max-w-5xl px-6 pt-20 pb-24 text-center md:pt-28 md:pb-32">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/70 backdrop-blur animate-fade-in-up">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-glow shadow-[0_0_10px_var(--color-amber-glow)]" />
            Career Path • Experience
          </div>

          <h1
            className="mt-8 text-gradient-hero text-6xl font-semibold tracking-tight md:text-8xl animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            Experience
          </h1>

          <p
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Building experience through creative technology, gameplay systems,
            collaboration, and experimentation.
          </p>

          <div
            className="mx-auto mt-12 h-px w-40 bg-gradient-to-r from-transparent via-amber-glow/60 to-transparent animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          />
        </section>

        {/* Showcase */}
        <section className="relative mx-auto max-w-6xl px-6 pb-32">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent md:block" />
          <div className="flex flex-col gap-24 md:gap-32">
            {experiences.map((exp, i) => (
              <ExperienceCard key={exp.company} exp={exp} reverse={i % 2 === 1} />
            ))}
          </div>
        </section>

        <Closing />
      </main>

      <footer className="relative z-10 mx-auto max-w-6xl px-6 py-12 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vansh Srivastava — Crafted with care.
      </footer>
    </div>
  );
}
