import type { MimirState } from '@/components/ui/MimirAvatar/mimir'

const GAZE_ALPHA: Record<MimirState, number> = {
  idle: 0.35,
  listening: 0.95,
  thinking: 0.5,
  processing: 0,
  responding: 0.75,
  success: 0.6,
}

interface FrontLayerProps {
  state: MimirState
  amplitude?: number
  intensity: number
}

export default function FrontLayer({ state, amplitude, intensity }: FrontLayerProps) {
  const gazeOpacity = GAZE_ALPHA[state]
  const showMouth = state === 'responding'
  const showSweep = state === 'processing'

  return (
    <div
      data-testid="layer-front"
      style={{
        position: 'absolute',
        left: '13%',
        right: '13%',
        top: '5%',
        bottom: '3%',
        borderRadius: 'var(--r-avatar)',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        data-testid="gaze"
        style={{
          position: 'absolute',
          left: '30%',
          right: '30%',
          top: '33%',
          height: '2px',
          background: `rgba(var(--light-rgb), ${gazeOpacity * intensity})`,
          opacity: gazeOpacity,
          transition: 'opacity 600ms ease',
        }}
      />
      {showMouth && (
        <div
          data-testid="mouth-active"
          style={{
            position: 'absolute',
            left: '42%',
            right: '42%',
            top: '47%',
            height: '2px',
            background: 'rgba(var(--light-warm-rgb), 0.8)',
            transform: amplitude !== undefined ? `scaleX(${Math.max(0.2, amplitude)})` : undefined,
            transition: 'transform 100ms ease, opacity 400ms ease',
          }}
        />
      )}
      {showSweep && (
        <div
          data-testid="sweep"
          style={{
            position: 'absolute',
            left: '20%',
            right: '20%',
            height: '4%',
            top: '4%',
            background: 'linear-gradient(180deg, transparent, rgba(var(--light-rgb), 0.12), transparent)',
            animation: 'mimir-sweep 2.6s ease-in-out infinite',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '38%',
          background: 'linear-gradient(180deg, transparent 62%, rgba(4, 6, 10, 0.85))',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
