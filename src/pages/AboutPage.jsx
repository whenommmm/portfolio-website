import { Reveal } from '../components/shared/Reveal';
import { CinematicAtmosphere } from '../components/shared/CinematicAtmosphere';


function SectionDivider() {
  return (
    <div className="relative mx-auto my-2 h-px w-full max-w-5xl px-6">
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, oklch(0.97 0.005 240 / 0.12) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

// ── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 font-pixel text-xs tracking-[0.3em] text-primary">
      <span className="h-px w-8 bg-primary" />
      {children}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-6 pt-28"
    >
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div
          className="mb-7 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-pixel tracking-wider text-muted-foreground animate-rise"
          style={{ animationDelay: '0.05s' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
          PRESS START — PORTFOLIO v1.0
        </div>

        <h1
          className="animate-rise text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl"
          style={{ animationDelay: '0.15s' }}
        >
          <span className="text-gradient">Vansh Srivastava</span>
        </h1>

        <p
          className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-rise"
          style={{ animationDelay: '0.3s' }}
        >
          Computer science student &amp; aspiring game developer. I build
          interactive experiences, tinker with gameplay systems, and live at the
          intersection of code, design, and creative tech.
        </p>

        <div
          className="mt-12 flex justify-center animate-rise"
          style={{ animationDelay: '0.45s' }}
        >
          <a
            href="#about"
            className="group relative inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_70px_-10px_oklch(0.82_0.14_75/0.5)]"
            style={{ backgroundImage: 'var(--gradient-primary)' }}
          >
            Enter world
            <span className="font-pixel animate-blink">▸</span>
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-rise"
        style={{ animationDelay: '0.7s' }}
      >
        <div className="font-pixel text-[10px] tracking-[0.4em] text-muted-foreground/70">
          ↓ SCROLL TO CONTINUE
        </div>
      </div>
    </section>
  );
}

// ── About ────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionLabel>01 — About</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
            I build worlds you can <span className="text-gradient">play with</span>.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              I'm drawn to the kind of software that reacts — interfaces that feel
              alive, mechanics that surprise you, and small interactions that make
              you smile. Most of my time is spent prototyping gameplay systems and
              seeing what happens when you push them a little too far.
            </p>
            <p>
              I love sitting between disciplines: writing code that's careful and
              considered, but never losing sight of how something <em>feels</em>.
              Whether it's a tiny game loop, a frontend experiment, or a creative
              tool, I'm chasing the same thing — moments that turn passive users
              into curious players.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Education ─────────────────────────────────────────────────────────────────
const EDUCATION = [
  {
    school: 'Scaler School of Technology',
    degree: 'Bachelor of Sciences in CS by BITS Pilani',
    period: 'Aug 2024 – Aug 2027',
    place: 'Bengaluru, India',
  },
  {
    school: 'City Montessori School',
    degree: 'Schooling',
    period: 'Apr 2009 – Apr 2024',
    place: 'Lucknow, India',
  },
];

function Education() {
  return (
    <section id="resume" className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionLabel>02 — Education</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
            The save points so far.
          </h2>
        </Reveal>

        <div className="relative mt-12">
          <div className="absolute left-2 top-8 bottom-8 w-px bg-border" />
          {EDUCATION.map((e, i) => (
            <Reveal key={e.school} delay={120 + i * 120}>
              <div className="group relative mb-5 pl-10 last:mb-0">
                <div className="absolute left-2 top-[30px] h-2 w-2 -translate-x-1/2 rounded-full bg-primary ring-4 ring-background transition-all duration-300 group-hover:shadow-glow" />
                <div className="glass rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 sm:p-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold sm:text-xl">{e.school}</h3>
                    <span className="font-pixel text-xs tracking-wider text-muted-foreground">
                      {e.period}
                    </span>
                  </div>
                  <p className="mt-1.5 text-muted-foreground">{e.degree}</p>
                  <p className="mt-1 text-sm text-muted-foreground/60">{e.place}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Tech Stack ────────────────────────────────────────────────────────────────
const GROUPS = [
  {
    title: 'Languages',
    color: 'primary',
    items: ['Java', 'C#', 'Python', 'HTML/CSS', 'MySQL', 'React', 'Spring Boot'],
  },
  {
    title: 'Game Engines',
    color: 'accent',
    items: ['Unity', 'Unreal Engine', 'GDevelop'],
  },
  {
    title: 'Developer Tools',
    color: 'secondary',
    items: ['Git', 'GitHub', 'VSCode', 'Canva', 'GitHub Pages', 'Itch.io'],
  },
];

function TechStack() {
  return (
    <section id="experience" className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionLabel>03 — Tech Stack</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
            The toolkit in my inventory.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-4 max-w-xl text-muted-foreground">
            A mix of engines, languages, and tools I reach for when building
            gameplay, prototypes, and interfaces.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {GROUPS.map((g, i) => (
            <Reveal key={g.title} delay={200 + i * 120}>
              <div className="glass group relative h-full overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20">
                <div
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                  style={{ background: `var(--${g.color})` }}
                />
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2" style={{ background: `var(--${g.color})` }} />
                  <h3 className="font-pixel text-sm tracking-[0.2em] uppercase text-muted-foreground">
                    {g.title}
                  </h3>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="cursor-default rounded-md border border-border bg-background/40 px-3 py-1.5 text-sm transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'oklch(0.10 0.04 268)' }}
    >
      <CinematicAtmosphere />
      <div className="relative z-[1]">
        <Hero />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Education />
        <SectionDivider />
        <TechStack />
        <div className="h-24" />
      </div>
    </main>
  );
}
