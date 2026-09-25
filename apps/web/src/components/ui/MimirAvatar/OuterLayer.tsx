import type { MimirState } from '@/components/ui/MimirAvatar/mimir'

const GOLDEN_ANGLE = 137.508

const PARTICLE_COUNTS: Record<MimirState, number> = {
  idle: 8,
  listening: 13,
  thinking: 15,
  processing: 7,
  responding: 11,
  success: 7,
}

const ARC_CONFIG: Partial<Record<MimirState, { span: number; duration: string }>> = {
  listening: { span: 0.16, duration: '40s' },
  thinking: { span: 0.42, duration: '10s' },
  responding: { span: 0.28, duration: '28s' },
}

const WAVE_CONFIG: Partial<Record<MimirState, { type: 'incoming' | 'outgoing'; count: number; duration: string }>> = {
  listening: { type: 'incoming', count: 2, duration: '3.4s' },
  success: { type: 'outgoing', count: 3, duration: '2.2s' },
}

interface OuterLayerProps {
  state: MimirState
  intensity: number
  reducedMotion: boolean
}

export default function OuterLayer({ state, intensity, reducedMotion }: OuterLayerProps) {
  const arcs = ARC_CONFIG[state]
  const waves = WAVE_CONFIG[state]
  const particleCount = PARTICLE_COUNTS[state]
  const showLandmarks = state === 'processing'

  return (
    <div
      data-testid="layer-outer"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {arcs && (
        <div data-testid="arcs" style={{ position: 'absolute', inset: 0 }}>
          <div
            style={{
              position: 'absolute',
              width: '112%',
              aspectRatio: '1',
              left: '-6%',
              top: '38%',
              transform: 'translateY(-50%)',
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, rgba(var(--light-rgb), ${0.12 * intensity}) 0turn, transparent ${arcs.span}turn)`,
              mask: 'radial-gradient(circle, transparent 48%, black 49%, black 50%, transparent 51%)',
              WebkitMask: 'radial-gradient(circle, transparent 48%, black 49%, black 50%, transparent 51%)',
              animation: reducedMotion ? 'none' : `mimir-arc-rotate ${arcs.duration} linear infinite`,
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
              borderRadius: '50%',
              background: `conic-gradient(from 180deg, rgba(var(--light-rgb), ${0.08 * intensity}) 0turn, transparent ${arcs.span}turn)`,
              mask: 'radial-gradient(circle, transparent 48%, black 49%, black 50%, transparent 51%)',
              WebkitMask: 'radial-gradient(circle, transparent 48%, black 49%, black 50%, transparent 51%)',
              animation: reducedMotion ? 'none' : `mimir-arc-rotate-reverse ${arcs.duration} linear infinite`,
            }}
          />
        </div>
      )}

      {showLandmarks && (
        <div data-testid="landmarks" style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '1px',
                height: '6%',
                top: '38%',
                left: '50%',
                transformOrigin: '0 0',
                transform: `rotate(${i * 36}deg) translateY(-56%)`,
                background: `rgba(var(--light-rgb), ${0.3 * intensity})`,
                animation: reducedMotion ? 'none' : `mimir-landmark-twinkle 1.4s ease-in-out ${i * 0.14}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {waves?.type === 'incoming' &&
        Array.from({ length: waves.count }, (_, i) => (
          <div
            key={`wave-in-${i}`}
            data-testid="wave-incoming"
            style={{
              position: 'absolute',
              width: '70%',
              aspectRatio: '1',
              left: '15%',
              top: '38%',
              transform: 'translateY(-50%)',
              borderRadius: '50%',
              border: `1px solid rgba(var(--light-rgb), ${0.15 * intensity})`,
              animation: reducedMotion ? 'none' : `mimir-wave-in ${waves.duration} ease-out ${i * 0.8}s infinite`,
            }}
          />
        ))}

      {waves?.type === 'outgoing' &&
        Array.from({ length: waves.count }, (_, i) => (
          <div
            key={`wave-out-${i}`}
            data-testid="wave-outgoing"
            style={{
              position: 'absolute',
              width: '70%',
              aspectRatio: '1',
              left: '15%',
              top: '38%',
              transform: 'translateY(-50%)',
              borderRadius: '50%',
              border: `1px solid rgba(var(--light-rgb), ${0.3 * intensity})`,
              animation: reducedMotion ? 'none' : `mimir-wave-out ${waves.duration} ease-out ${i * 0.3}s infinite`,
            }}
          />
        ))}

      {Array.from({ length: particleCount }, (_, i) => {
        const angle = i * GOLDEN_ANGLE
        const radius = 52 + (i % 3) * 4
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180) * 0.5
        const y = 38 + radius * Math.sin((angle * Math.PI) / 180) * 0.5
        const size = 2 + (i % 2)

        return (
          <div
            key={`particle-${i}`}
            data-testid="particle"
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              left: `${x}%`,
              top: `${y}%`,
              borderRadius: '50%',
              background: `rgba(var(--light-rgb), ${0.3 * intensity})`,
              animation: reducedMotion ? 'none' : `mimir-particle-drift ${3 + i * 0.2}s ease-in-out ${i * 0.3}s infinite alternate`,
            }}
          />
        )
      })}
    </div>
  )
}
