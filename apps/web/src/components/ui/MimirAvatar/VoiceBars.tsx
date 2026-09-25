import type { MimirState } from '@/components/ui/MimirAvatar/mimir'

const BAR_COUNT = 27

interface VoiceBarsProps {
  state: MimirState
  className?: string
}

export default function VoiceBars({ state, className }: VoiceBarsProps) {
  const active = state === 'listening' || state === 'responding'

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
            animationName: active ? 'mimir-voice-bar' : 'none',
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
