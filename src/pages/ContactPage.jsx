import { Mail, Phone, ArrowUpRight } from 'lucide-react';

function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function LinkedinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}


// ── X icon ────────────────────────────────────────────────────────────────────
function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const METHODS = [
  {
    label: 'Email',
    value: 'vanshsrivastavaqa@gmail.com',
    href: 'mailto:vanshsrivastavaqa@gmail.com',
    icon: Mail,
  },
  {
    label: 'GitHub',
    value: 'github.com/whenommm',
    href: 'https://github.com/whenommm',
    icon: GithubIcon,
    external: true,
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/vansh-srivastava-whenom',
    href: 'https://linkedin.com/in/vansh-srivastava-whenom/',
    icon: LinkedinIcon,
    external: true,
  },
  {
    label: 'X',
    value: 'x.com/whenommm',
    href: 'https://x.com/whenommm',
    icon: XIcon,
    external: true,
  },
  {
    label: 'Phone',
    value: '+91 7905620740',
    href: 'tel:+917905620740',
    icon: Phone,
  },
];


// ── Particles ─────────────────────────────────────────────────────────────────
function Particles() {
  const dots = Array.from({ length: 38 }, (_, i) => {
    const sx = (i * 9301 + 49297) % 233280;
    const sy = (i * 4096 + 12345) % 233280;
    return {
      i,
      x: (sx / 233280) * 100,
      y: (sy / 233280) * 100,
      size: 1 + ((i * 7) % 3) * 0.5,
      delay: (i % 9) * 0.7,
      dur: 6 + (i % 6),
    };
  });
  return (
    <div className="absolute inset-0">
      {dots.map((d) => (
        <span
          key={d.i}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            background: 'var(--cream)',
            boxShadow: '0 0 8px color-mix(in oklab, var(--glow-amber) 60%, transparent)',
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-ink-foreground font-sans antialiased">
      {/* Atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center,black 40%,transparent 85%)',
          }}
        />
        <div
          className="absolute left-1/2 top-[16%] h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-60 blur-2xl"
          style={{ background: 'radial-gradient(closest-side,var(--glow-amber),transparent 70%)' }}
        />
        <div
          className="absolute -left-40 bottom-0 h-[40rem] w-[40rem] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(closest-side,var(--glow-cyan),transparent 70%)' }}
        />
        <div
          className="absolute -right-40 top-1/3 h-[36rem] w-[36rem] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(closest-side,var(--glow-amber),transparent 70%)' }}
        />
        <Particles />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,var(--ink)_100%)]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 text-center sm:pt-28">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/70 backdrop-blur animate-fade-in-up">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--color-amber-glow)', boxShadow: '0 0 10px var(--color-amber-glow)' }}
          />
          Get In Touch
        </div>

        <h1
          className="mt-8 text-gradient-hero text-6xl font-semibold tracking-tight md:text-8xl animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          Contact
        </h1>

        <p
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          Whether it&apos;s game development, creative technology, or interactive
          experiences — I&apos;m always open to building interesting things.
        </p>

        <div
          className="mx-auto mt-12 h-px w-40 animate-fade-in-up"
          style={{
            animationDelay: '0.3s',
            background: 'linear-gradient(to right, transparent, var(--color-amber-glow, oklch(0.82 0.16 65)) 50%, transparent)',
            opacity: 0.6,
          }}
        />
      </section>

      {/* Contact methods — circular layout */}
      <section className="relative z-10 mx-auto mt-20 flex w-full max-w-[640px] items-center justify-center px-6 pb-32 sm:mt-24">
        <div className="relative aspect-square w-full" style={{ ['--radius']: '42%' }}>
          {/* Decorative rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            style={{
              background:
                'radial-gradient(closest-side, color-mix(in oklab, var(--glow-amber) 12%, transparent), transparent 70%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'var(--glow-amber)', boxShadow: '0 0 24px var(--glow-amber)' }}
          />

          {METHODS.map((m, i) => {
            const angle = -90 + i * (360 / METHODS.length);
            const rad = (angle * Math.PI) / 180;
            const x = 50 + Math.cos(rad) * 42;
            const y = 50 + Math.sin(rad) * 42;
            return (
              <a
                key={m.label}
                href={m.href}
                target={m.external ? '_blank' : undefined}
                rel={m.external ? 'noopener noreferrer' : undefined}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  animationDelay: `${420 + i * 110}ms`,
                  animationFillMode: 'both',
                }}
                className="group absolute -translate-x-1/2 -translate-y-1/2 animate-fade-in"
              >
                <div className="relative flex flex-col items-center gap-3">
                  <div className="relative grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-cream backdrop-blur-xl transition-all duration-500 ease-out group-hover:-translate-y-[2px] group-hover:border-white/25 group-hover:bg-white/[0.06] group-hover:text-glow-amber group-hover:shadow-amber-glow sm:h-24 sm:w-24">
                    <m.icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                    <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/5" />
                    <ArrowUpRight className="absolute right-2 top-2 h-3 w-3 text-ink-muted opacity-0 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-glow-amber group-hover:opacity-100" />
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-[9px] tracking-[0.3em] text-ink-muted sm:text-[10px]">
                      {m.label.toUpperCase()}
                    </div>
                    <div className="mt-1 max-w-[140px] truncate text-[11px] text-ink-foreground/80 transition-colors group-hover:text-ink-foreground sm:text-[12px]">
                      {m.value}
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 pb-10 text-center">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <p className="font-mono text-[10px] tracking-[0.32em] text-ink-muted">
          END OF TRANSMISSION &mdash; VANSH SRIVASTAVA &middot; MMXXVI
        </p>
      </footer>
    </main>
  );
}
