import type { MimirState } from '@/components/ui/MimirAvatar/mimir'

const BREATH_DURATION: Record<MimirState, string | null> = {
  idle: '8s',
  listening: '3.4s',
  thinking: '2.6s',
  processing: null,
  responding: '4.4s',
  success: '6s',
}

const HALO: Record<MimirState, { alpha: number; y: number }> = {
  idle: { alpha: 0.16, y: 36 },
  listening: { alpha: 0.30, y: 36 },
  thinking: { alpha: 0.34, y: 22 },
  processing: { alpha: 0.22, y: 36 },
  responding: { alpha: 0.40, y: 44 },
  success: { alpha: 0.30, y: 36 },
}

interface BackLayerProps {
  state: MimirState
  intensity: number
  reducedMotion: boolean
}

export default function BackLayer({ state, intensity, reducedMotion }: BackLayerProps) {
  const halo = HALO[state]
  const breathDuration = BREATH_DURATION[state]
  const lightRgb = state === 'responding' ? 'var(--light-warm-rgb)' : 'var(--light-rgb)'

  return (
    <div
      data-testid="layer-back"
      data-tint={state === 'responding' ? 'warm' : 'cold'}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <div
        data-testid="breathing"
        style={{
          position: 'absolute',
          inset: '-22% -30%',
          animationName: !breathDuration || reducedMotion ? 'none' : 'mimir-breathe',
          animationDuration: breathDuration ?? '0s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          animationPlayState: reducedMotion ? 'paused' : 'running',
        }}
      >
        <div
          data-testid="halo"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(42% 36% at 50% ${halo.y}%, rgba(${lightRgb}, ${halo.alpha * intensity}), transparent 72%)`,
            transition: 'opacity 600ms ease, background 600ms ease',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          width: '112%',
          aspectRatio: '1',
          left: '-6%',
          top: '38%',
          transform: 'translateY(-50%)',
          border: '1px solid rgba(190, 236, 240, 0.09)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '86%',
          aspectRatio: '1',
          left: '7%',
          top: '38%',
          transform: 'translateY(-50%)',
          border: '1px solid rgba(190, 236, 240, 0.07)',
          borderRadius: '50%',
        }}
      />
    </div>
  )
}
