import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MimirAvatar from '@/components/ui/MimirAvatar/MimirAvatar'
import type { MimirState } from '@/components/ui/MimirAvatar/mimir'
import '@/components/pages/Landing/landing.css'

const CYCLE_STATES: MimirState[] = ['idle', 'listening', 'thinking', 'responding']
const STATE_DURATION = 3800

function useStateCycle() {
  const [state, setState] = useState<MimirState>('idle')
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (prefersReducedMotion.current) return

    let index = 0
    const timer = setInterval(() => {
      index = (index + 1) % CYCLE_STATES.length
      setState(CYCLE_STATES[index])
    }, STATE_DURATION)

    return () => clearInterval(timer)
  }, [])

  return state
}

const FEATURE_TAGS = ['Mémoire contrôlable', 'Projets vivants', 'Intégrations']

const FOOTER_COLUMNS = [
  {
    title: 'Présence',
    text: 'Mímir est là, attentif à votre contexte, sans être intrusif.',
  },
  {
    title: 'Contexte',
    text: 'Vos projets, vos documents, votre agenda : tout est connecté.',
  },
  {
    title: 'Contrôle',
    text: 'Vous décidez ce que Mímir retient, oublie ou suggère.',
  },
]

export default function Landing() {
  const avatarState = useStateCycle()

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ padding: '34px clamp(24px,5vw,80px) 48px' }}
    >
      <header className="flex items-center justify-between">
        <span className="font-sans text-[var(--ink-strong)] tracking-[.16em] text-sm font-medium">
          MÍMIR
        </span>
        <nav className="flex items-center gap-6">
          <span className="hidden text-sm text-[var(--ink-2)] md:inline">Produit</span>
          <span className="hidden text-sm text-[var(--ink-2)] md:inline">Mémoire</span>
          <span className="hidden text-sm text-[var(--ink-2)] md:inline">Confidentialité</span>
          <Link
            to="/mimir"
            className="cursor-pointer rounded-lg border border-white/10 px-4 py-1.5 text-sm text-[var(--ink)]"
          >
            Entrer
          </Link>
        </nav>
      </header>

      <div
        data-testid="landing-hero"
        className="grid flex-1 items-center"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
      >
        <div
          data-testid="hero-text"
          className="rise flex max-w-[540px] flex-col gap-6 py-12"
          style={{ animationDuration: '900ms' }}
        >
          <span className="font-mono text-xs tracking-[.2em] uppercase text-[var(--ink-3)]">
            Assistant personnel · présence contextuelle
          </span>

          <h1
            className="font-display leading-[1.08] text-[var(--ink-strong)]"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-display)' }}
          >
            Une intelligence qui connaît votre contexte.
          </h1>

          <p className="text-[var(--fs-body-l)] leading-relaxed text-[var(--ink-2)]">
            Mímir apprend de vos projets, de vos documents et de vos habitudes
            pour vous accompagner au quotidien.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/welcome"
              className="cursor-pointer rounded-xl px-6 py-2.5 text-sm font-medium text-[var(--on-light)]"
              style={{ background: 'var(--light)' }}
            >
              Faire connaissance
            </Link>
            <Link
              to="/mimir"
              className="cursor-pointer rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-[var(--ink)]"
            >
              Voir l&apos;assistant
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {FEATURE_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/7 px-3 py-1 font-mono text-xs text-[var(--ink-3)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div
          data-testid="hero-avatar"
          className="fade flex items-center justify-center py-12"
          style={{ animationDuration: '1.6s' }}
        >
          <MimirAvatar state={avatarState} size="hero" aria-hidden />
        </div>
      </div>

      <footer
        className="grid rounded-2xl"
        style={{
          gridTemplateColumns: '1fr auto 1fr auto 1fr',
          background: 'rgba(255,255,255,.028)',
        }}
      >
        {FOOTER_COLUMNS.map((col, i) => (
          <div key={col.title} className="flex flex-col gap-2 px-6 py-5" style={{ order: i * 2 }}>
            <span className="text-sm font-medium text-[var(--ink)]">{col.title}</span>
            <span className="text-xs leading-relaxed text-[var(--ink-3)]">{col.text}</span>
          </div>
        ))}
        <div
          data-testid="footer-separator"
          className="w-px self-stretch bg-white/7"
          style={{ order: 1 }}
        />
        <div
          data-testid="footer-separator"
          className="w-px self-stretch bg-white/7"
          style={{ order: 3 }}
        />
      </footer>
    </div>
  )
}
