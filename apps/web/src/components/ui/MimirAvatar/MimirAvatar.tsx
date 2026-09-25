import { useEffect, useState } from 'react'
import type { MimirAvatarProps } from '@/components/ui/MimirAvatar/mimir'
import '@/components/ui/MimirAvatar/mimirAvatar.css'
import BackLayer from '@/components/ui/MimirAvatar/BackLayer'
import FrameLayer from '@/components/ui/MimirAvatar/FrameLayer'
import FrontLayer from '@/components/ui/MimirAvatar/FrontLayer'
import OuterLayer from '@/components/ui/MimirAvatar/OuterLayer'

export default function MimirAvatar({
  state,
  amplitude,
  intensity = 1,
  media = { kind: 'placeholder' },
  size = 'stage',
  className,
  'aria-hidden': ariaHidden = true,
}: MimirAvatarProps) {
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

  const effectiveIntensity = reducedMotion ? Math.min(intensity, 0.4) : intensity

  return (
    <div
      data-testid="mimir-avatar"
      data-size={size}
      data-reduced-motion={reducedMotion ? 'true' : undefined}
      aria-hidden={ariaHidden}
      className={className}
      style={{ position: 'relative', aspectRatio: '4 / 5' }}
    >
      <BackLayer state={state} intensity={effectiveIntensity} reducedMotion={reducedMotion} />
      <FrameLayer media={media} state={state} />
      <FrontLayer state={state} amplitude={amplitude} intensity={effectiveIntensity} />
      <OuterLayer state={state} intensity={effectiveIntensity} reducedMotion={reducedMotion} />
    </div>
  )
}
