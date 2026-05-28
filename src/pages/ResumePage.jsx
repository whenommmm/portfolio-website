import { motion } from 'motion/react';
import { Download, Maximize2 } from 'lucide-react';
import resumeImage from '@/assets/vansh-srivastava-resume.png';

const RESUME_PDF_URL = '/vansh-srivastava-resume.pdf';

function Particles() {
  const particles = Array.from({ length: 24 });
  return (
    <div className="absolute inset-0">
      {particles.map((_, i) => {
        const left = (i * 37) % 100;
        const top = (i * 53) % 100;
        const delay = (i % 7) * 0.6;
        const duration = 6 + (i % 5);
        return (
          <motion.span
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full bg-[var(--cinematic-amber)]"
            style={{ left: `${left}%`, top: `${top}%` }}
            animate={{ opacity: [0, 0.6, 0], y: [0, -30, -60] }}
            transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

export default function ResumePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--cinematic-navy)] text-foreground">
      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(var(--cinematic-cream) 1px, transparent 1px), linear-gradient(90deg, var(--cinematic-cream) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--cinematic-glow)] opacity-[0.10] blur-[160px]" />
        <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-[var(--cinematic-amber)] opacity-[0.07] blur-[180px]" />
        <div className="absolute -bottom-20 right-0 h-[400px] w-[600px] rounded-full bg-[oklch(0.35_0.15_265)] opacity-[0.20] blur-[160px]" />
        <Particles />
      </div>


      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-12 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/70 backdrop-blur"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: 'var(--color-amber-glow)',
              boxShadow: '0 0 10px var(--color-amber-glow)',
            }}
          />
          Career Archive • Resume
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-gradient-hero text-6xl font-semibold tracking-tight md:text-8xl"
        >
          Resume
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          A snapshot of my journey through gameplay systems, creative technology,
          and interactive development.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-12 h-px w-40"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-amber-glow, oklch(0.82 0.16 65)) 50%, transparent)',
            opacity: 0.6,
          }}
        />
      </section>

      {/* Resume showcase */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-8 rounded-[2rem] bg-[var(--cinematic-amber)] opacity-[0.08] blur-3xl" />

          {/* Viewer frame */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--cinematic-cream)]/10 bg-[var(--cinematic-navy-deep)]/60 p-3 backdrop-blur-xl shadow-[var(--shadow-cinematic)]">
            {/* Terminal top bar */}
            <div className="flex items-center justify-between border-b border-[var(--cinematic-cream)]/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.65_0.18_25)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--cinematic-amber)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.15_150)]/70" />
              </div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--cinematic-cream)]/40">
                ARCHIVE / VANSH_SRIVASTAVA.RESUME
              </div>
              <div className="font-mono text-[10px] text-[var(--cinematic-amber)]/70">
                ● LIVE
              </div>
            </div>

            {/* Resume image */}
            <div className="relative max-h-[80vh] w-full overflow-y-auto overflow-x-hidden rounded-b-xl bg-[oklch(0.97_0.01_85)]">
              <motion.img
                src={resumeImage}
                alt="Vansh Srivastava resume"
                className="block w-full select-none"
                draggable={false}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Scanline overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent 0, transparent 3px, oklch(0.96 0.04 85) 3px, oklch(0.96 0.04 85) 4px)',
                }}
              />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_oklch(0.11_0.03_265/0.35)]" />
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href={RESUME_PDF_URL}
            download="Vansh-Srivastava-Resume.pdf"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-500"
            style={{
              background: 'linear-gradient(135deg, oklch(0.97 0.03 85) 0%, oklch(0.88 0.14 72) 40%, oklch(0.79 0.16 58) 75%, oklch(0.72 0.15 45) 100%)',
              color: 'oklch(0.18 0.04 50)',
              boxShadow: '0 0 32px -8px oklch(0.82 0.16 65 / 0.5), 0 0 80px -20px oklch(0.82 0.14 70 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 50px -8px oklch(0.82 0.16 65 / 0.7), 0 0 100px -20px oklch(0.82 0.14 70 / 0.45), inset 0 1px 0 oklch(1 0 0 / 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 32px -8px oklch(0.82 0.16 65 / 0.5), 0 0 80px -20px oklch(0.82 0.14 70 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Download className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5" />
            <span>Download Resume</span>
            {/* Shimmer sweep on hover */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </a>
          <a
            href={resumeImage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--cinematic-cream)]/20 bg-[var(--cinematic-navy-deep)]/50 px-6 py-3.5 text-sm font-medium text-[var(--cinematic-cream)]/80 backdrop-blur transition-all duration-300 hover:border-[var(--cinematic-amber)]/40 hover:text-[var(--cinematic-amber)]"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="tracking-wide">View Full Resolution</span>
          </a>
        </motion.div>
      </section>
    </div>
  );
}
