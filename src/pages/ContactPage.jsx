import { Mail, Phone, ArrowUpRight } from 'lucide-react';
import { CinematicAtmosphere } from '../components/shared/CinematicAtmosphere';
import { ReturnToWorld } from '../components/shared/ReturnToWorld';

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
    value: 'github.com/whenommmm',
    href: 'https://github.com/whenommmm',
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


// ── Page ──────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-ink-foreground font-sans antialiased">
      <CinematicAtmosphere />

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 text-center sm:pt-28">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 day:border-foreground/12 bg-white/5 day:bg-white/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/70 backdrop-blur animate-fade-in-up">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
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
          Got a game that needs a designer, a jam that needs a teammate, or a
          build that needs playtesting? I&apos;d love to hear about it.
        </p>

        <div
          className="mx-auto mt-12 h-px w-40 animate-fade-in-up"
          style={{
            animationDelay: '0.3s',
            background: 'linear-gradient(to right, transparent, var(--primary) 50%, transparent)',
            opacity: 0.6,
          }}
        />
      </section>

      {/* Contact methods — circular layout */}
      <section className="relative z-10 mx-auto mt-20 flex w-full max-w-[640px] items-center justify-center px-6 pb-32 sm:mt-24">
        {/* --orbit-r: node distance from the center. Phones get a tighter ring
            and smaller nodes: that's the only fit where a node swinging past
            the screen edge keeps its label on screen without neighbours
            overlapping. */}
        <div className="relative aspect-square w-full [--orbit-r:37%] sm:[--orbit-r:40%]">
          {/* Decorative rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 day:border-foreground/12"
            style={{
              background:
                'radial-gradient(closest-side, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 day:border-foreground/12"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'var(--primary)', boxShadow: '0 0 24px var(--primary)' }}
          />

          {/* Rotating HUD Rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/5 day:border-foreground/12 animate-orbit-ring-counter"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dotted border-white/10 day:border-foreground/12 animate-orbit-ring-slow"
          />

          {/* Orbiting Contact Nodes wrapper */}
          <div className="absolute inset-0 animate-orbit-slow">
            {METHODS.map((m, i) => {
              const angle = -90 + i * (360 / METHODS.length);
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad).toFixed(4);
              const y = Math.sin(rad).toFixed(4);
              return (
                <div
                  key={m.label}
                  style={{
                    left: `calc(50% + ${x} * var(--orbit-r))`,
                    top: `calc(50% + ${y} * var(--orbit-r))`,
                    position: 'absolute',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    style={{
                      animationDelay: `${420 + i * 110}ms`,
                      animationFillMode: 'both',
                    }}
                    className="animate-fade-in"
                  >
                    <a
                      href={m.href}
                      target={m.external ? '_blank' : undefined}
                      rel={m.external ? 'noopener noreferrer' : undefined}
                      className="group block animate-orbit-counter-slow"
                    >
                      <div className="relative flex flex-col items-center gap-2 sm:gap-3">
                        <div className="relative grid h-14 w-14 place-items-center rounded-full border border-white/10 day:border-foreground/12 bg-white/[0.03] day:bg-white/70 text-foreground backdrop-blur-xl transition-all duration-500 ease-out group-hover:-translate-y-[2px] group-hover:border-white/25 day:group-hover:border-foreground/25 group-hover:bg-white/[0.06] day:group-hover:bg-white group-hover:text-primary group-hover:shadow-[0_0_24px_-6px_color-mix(in_oklab,var(--primary)_65%,transparent)] sm:h-24 sm:w-24">
                          <m.icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                          <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/5 day:ring-foreground/10" />
                          <ArrowUpRight className="absolute right-2 top-2 h-3 w-3 text-ink-muted opacity-0 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
                        </div>
                        <div className="text-center">
                          <div className="font-mono text-[9px] tracking-[0.3em] text-ink-muted sm:text-[10px]">
                            {m.label.toUpperCase()}
                          </div>
                          <div className="mt-1 max-w-[104px] truncate text-[11px] text-ink-foreground/80 transition-colors group-hover:text-ink-foreground sm:max-w-[150px] sm:text-[12px]">
                            {m.value}
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ReturnToWorld />
    </main>
  );
}
