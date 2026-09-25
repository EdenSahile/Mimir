import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MimirPresence from '@/components/ui/MimirAvatar/MimirPresence'

describe('MimirPresence', () => {
  it('renders a radial gradient disc', () => {
    const { container } = render(<MimirPresence state="idle" />)

    const disc = container.firstElementChild as HTMLElement
    expect(disc.style.background).toContain('radial-gradient')
  })

  it('renders a border', () => {
    const { container } = render(<MimirPresence state="idle" />)

    const disc = container.firstElementChild as HTMLElement
    expect(disc.style.border).toBeTruthy()
  })

  it('has 5s breathing animation in idle', () => {
    const { container } = render(<MimirPresence state="idle" />)

    const disc = container.firstElementChild as HTMLElement
    expect(disc.style.animationDuration).toBe('5s')
  })

  it.each(['listening', 'thinking', 'processing', 'responding', 'success'] as const)(
    'has 1.6s breathing animation in %s',
    (state) => {
      const { container } = render(<MimirPresence state={state} />)

      const disc = container.firstElementChild as HTMLElement
      expect(disc.style.animationDuration).toBe('1.6s')
    },
  )

  it('accepts a custom size via style', () => {
    const { container } = render(<MimirPresence state="idle" size={36} />)

    const disc = container.firstElementChild as HTMLElement
    expect(disc.style.width).toBe('36px')
    expect(disc.style.height).toBe('36px')
  })

  it('is round', () => {
    const { container } = render(<MimirPresence state="idle" />)

    const disc = container.firstElementChild as HTMLElement
    expect(disc.style.borderRadius).toBe('50%')
  })
})
