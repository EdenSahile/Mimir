import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import VoiceBars from '@/components/ui/MimirAvatar/VoiceBars'

describe('VoiceBars', () => {
  it('renders 27 bars', () => {
    const { container } = render(<VoiceBars state="listening" />)

    const bars = container.querySelectorAll('[data-testid="voice-bar"]')
    expect(bars).toHaveLength(27)
  })

  it('applies staggered animation delay of 45ms per bar', () => {
    const { container } = render(<VoiceBars state="listening" />)

    const bars = container.querySelectorAll('[data-testid="voice-bar"]')
    bars.forEach((bar, i) => {
      expect((bar as HTMLElement).style.animationDelay).toBe(`${i * 45}ms`)
    })
  })

  it.each(['listening', 'responding'] as const)('is active in %s state', (state) => {
    const { container } = render(<VoiceBars state={state} />)

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.dataset.active).toBe('true')
  })

  it.each(['idle', 'thinking', 'processing', 'success'] as const)(
    'is inactive in %s state',
    (state) => {
      const { container } = render(<VoiceBars state={state} />)

      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.dataset.active).toBeUndefined()
    },
  )
})
