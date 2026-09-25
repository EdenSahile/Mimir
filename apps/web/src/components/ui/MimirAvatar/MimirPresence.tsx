import { useEffect, useState } from 'react'
import type { MimirState } from '@/components/ui/MimirAvatar/mimir'
import '@/components/ui/MimirAvatar/mimirAvatar.css'

interface MimirPresenceProps {
  state: MimirState
  size?: number
  className?: string
}

export default function MimirPresence({ state, size = 32, className }: MimirPresenceProps) {
  const active = state !== 'idle'
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
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 42% 38%, rgba(190,236,240,.6), rgba(190,236,240,.08) 70%)',
        border: '1px solid rgba(190,236,240,.3)',
        animationName: reducedMotion ? 'none' : 'mimir-breathe',
        animationDuration: active ? '1.6s' : '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      }}
    />
  )
}
