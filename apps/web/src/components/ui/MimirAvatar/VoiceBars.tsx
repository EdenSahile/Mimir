import { useEffect, useState } from 'react'
import type { MimirState } from '@/components/ui/MimirAvatar/mimir'
import '@/components/ui/MimirAvatar/mimirAvatar.css'

const BAR_COUNT = 27

interface VoiceBarsProps {
  state: MimirState
  className?: string
}

export default function VoiceBars({ state, className }: VoiceBarsProps) {
  const active = state === 'listening' || state === 'responding'
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return (
    <div
      data-active={active || undefined}
      className={`flex items-center justify-center gap-[1px] ${className ?? ''}`}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          data-testid="voice-bar"
          className="w-[2px] rounded-full bg-current"
          style={{
            height: active ? undefined : '2px',
            animationName: active && !reducedMotion ? 'mimir-voice-bar' : 'none',
            animationDuration: '600ms',
            animationDelay: `${i * 45}ms`,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      ))}
    </div>
  )
}
