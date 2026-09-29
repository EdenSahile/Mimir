interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          data-testid="progress-dot"
          className="h-0.5 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 22 : 6,
            background:
              i === current
                ? 'rgba(206,244,248,.85)'
                : 'rgba(255,255,255,.15)',
          }}
        />
      ))}
      <span className="ml-2.5 font-mono text-[10px] tracking-[.18em] text-[var(--ink-3)]">
        {current + 1} / {total}
      </span>
    </div>
  )
}
