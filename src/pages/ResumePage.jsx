import { motion } from 'motion/react';
import { Download, Maximize2 } from 'lucide-react';
import resumeImage from '@/assets/vansh-srivastava-resume.png';
import { CinematicAtmosphere } from '../components/shared/CinematicAtmosphere';
import { ReturnToWorld } from '../components/shared/ReturnToWorld';
import { RESUME_LINKS } from '../resumeLinks';

const RESUME_PDF_URL = '/vansh-srivastava-resume.pdf';

export default function ResumePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--cinematic-navy)] text-foreground">
      <CinematicAtmosphere />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-12 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/70 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
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
          The one-page version: the games I&apos;ve designed, the jams I&apos;ve
          entered, and where I&apos;ve worked.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-12 h-px w-40"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--primary) 50%, transparent)',
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
          <div className="absolute -inset-8 rounded-[2rem] bg-primary opacity-[0.08] blur-3xl" />

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
              <div className="font-mono text-[10px] text-primary/70">
                ● LIVE
              </div>
            </div>

            {/* Resume image */}
            <div className="relative max-h-[80vh] w-full overflow-y-auto overflow-x-hidden rounded-b-xl bg-[oklch(0.97_0.01_85)]">
              {/* The image is a picture of the PDF, so its links are laid over the underlined text */}
              <div className="relative">
                <motion.img
                  src={resumeImage}
                  alt="Vansh Srivastava resume"
                  className="block w-full select-none"
                  draggable={false}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
                {RESUME_LINKS.map((link) => (
                  <a
                    key={`${link.href}-${link.top}`}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    aria-label={link.href.replace(/^(https?:\/\/(www\.)?|mailto:|tel:)/, '')}
                    className="absolute z-10 rounded-sm transition-colors hover:bg-primary/25"
                    style={{ left: `${link.left}%`, top: `${link.top}%`, width: `${link.width}%`, height: `${link.height}%` }}
                  />
                ))}
              </div>
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
              backgroundImage: 'var(--gradient-primary)',
              color: 'var(--primary-foreground)',
              boxShadow: '0 0 32px -8px color-mix(in oklab, var(--primary) 50%, transparent), 0 0 80px -20px color-mix(in oklab, var(--primary) 30%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 50px -8px color-mix(in oklab, var(--primary) 70%, transparent), 0 0 100px -20px color-mix(in oklab, var(--primary) 45%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 32px -8px color-mix(in oklab, var(--primary) 50%, transparent), 0 0 80px -20px color-mix(in oklab, var(--primary) 30%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Download className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5" />
            <span>Download Resume</span>
            {/* Shimmer sweep on hover */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </a>
          <a
            href={RESUME_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--cinematic-cream)]/20 bg-[var(--cinematic-navy-deep)]/50 px-6 py-3.5 text-sm font-medium text-[var(--cinematic-cream)]/80 backdrop-blur transition-all duration-300 hover:border-primary/40 hover:text-primary"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="tracking-wide">View Full Resolution</span>
          </a>
        </motion.div>
      </section>

      <ReturnToWorld />
    </div>
  );
}
