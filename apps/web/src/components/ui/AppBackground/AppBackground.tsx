import { useMemo } from "react"

const STAR_COUNT = 46

function generateStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    dur: `${6 + Math.random() * 6}s`,
    delay: `${Math.random() * 6}s`,
  }))
}

export default function AppBackground() {
  const stars = useMemo(() => generateStars(), [])

  return (
    <div
      data-testid="app-background"
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      <div data-testid="bg-gradient" className="bg-gradient absolute inset-0" />
      <div data-testid="bg-grid" className="bg-grid absolute inset-0" />

      {stars.map((star) => (
        <div
          key={star.id}
          data-testid="star"
          className="star absolute size-px rounded-full"
          style={{
            top: star.top,
            left: star.left,
            "--dur": star.dur,
            "--delay": star.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
