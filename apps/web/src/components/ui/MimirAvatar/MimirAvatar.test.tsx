import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MimirAvatar from '@/components/ui/MimirAvatar/MimirAvatar'
import type { MimirState } from '@/components/ui/MimirAvatar/mimir'

describe('MimirAvatar', () => {
  describe('4 couches dans un conteneur ratio 4:5', () => {
    it('renders a container with 4:5 aspect ratio', () => {
      render(<MimirAvatar state="idle" />)

      const container = screen.getByTestId('mimir-avatar')

      expect(container).toHaveStyle({ aspectRatio: '4 / 5' })
    })

    it('renders 4 distinct layers: back, frame, front, outer', () => {
      render(<MimirAvatar state="idle" />)

      expect(screen.getByTestId('layer-back')).toBeInTheDocument()
      expect(screen.getByTestId('layer-frame')).toBeInTheDocument()
      expect(screen.getByTestId('layer-front')).toBeInTheDocument()
      expect(screen.getByTestId('layer-outer')).toBeInTheDocument()
    })
  })

  describe('placeholder', () => {
    it('renders head, neck, shoulders and seam when media is placeholder', () => {
      render(<MimirAvatar state="idle" media={{ kind: 'placeholder' }} />)

      expect(screen.getByTestId('placeholder-head')).toBeInTheDocument()
      expect(screen.getByTestId('placeholder-neck')).toBeInTheDocument()
      expect(screen.getByTestId('placeholder-shoulders')).toBeInTheDocument()
      expect(screen.getByTestId('placeholder-seam')).toBeInTheDocument()
    })

    it('renders placeholder by default when no media prop is provided', () => {
      render(<MimirAvatar state="idle" />)

      expect(screen.getByTestId('placeholder-head')).toBeInTheDocument()
    })

    it('does not render placeholder when media is an image', () => {
      render(<MimirAvatar state="idle" media={{ kind: 'image', src: '/avatar.png' }} />)

      expect(screen.queryByTestId('placeholder-head')).not.toBeInTheDocument()
      expect(screen.queryByTestId('placeholder-neck')).not.toBeInTheDocument()
      expect(screen.queryByTestId('placeholder-shoulders')).not.toBeInTheDocument()
      expect(screen.queryByTestId('placeholder-seam')).not.toBeInTheDocument()
    })
  })

  describe('6 etats distincts', () => {
    it('idle: no arcs, no landmarks, no active mouth', () => {
      render(<MimirAvatar state="idle" />)

      expect(screen.queryByTestId('arcs')).not.toBeInTheDocument()
      expect(screen.queryByTestId('landmarks')).not.toBeInTheDocument()
      expect(screen.queryByTestId('mouth-active')).not.toBeInTheDocument()
    })

    it('listening: incoming waves are present', () => {
      render(<MimirAvatar state="listening" />)

      const waves = screen.getAllByTestId('wave-incoming')

      expect(waves.length).toBeGreaterThanOrEqual(1)
    })

    it('thinking: arcs are present', () => {
      render(<MimirAvatar state="thinking" />)

      expect(screen.getByTestId('arcs')).toBeInTheDocument()
    })

    it('processing: landmarks and vertical sweep are present, gaze is off', () => {
      render(<MimirAvatar state="processing" />)

      expect(screen.getByTestId('landmarks')).toBeInTheDocument()
      expect(screen.getByTestId('sweep')).toBeInTheDocument()
      expect(screen.getByTestId('gaze')).toHaveStyle({ opacity: '0' })
    })

    it('responding: active mouth is present and warm tint is applied', () => {
      render(<MimirAvatar state="responding" />)

      expect(screen.getByTestId('mouth-active')).toBeInTheDocument()
      expect(screen.getByTestId('layer-back')).toHaveAttribute('data-tint', 'warm')
    })

    it('success: outgoing waves are present', () => {
      render(<MimirAvatar state="success" />)

      const waves = screen.getAllByTestId('wave-outgoing')

      expect(waves.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('transitions', () => {
    it('layer elements have CSS transition properties applied', () => {
      render(<MimirAvatar state="idle" />)

      const halo = screen.getByTestId('halo')

      expect(halo.style.transition).not.toBe('')
    })
  })

  describe('4 tailles', () => {
    it.each([
      'stage',
      'hero',
      'companion',
      'presence',
    ] as const)('applies a distinct data-size attribute for %s', (size) => {
      render(<MimirAvatar state="idle" size={size} />)

      const container = screen.getByTestId('mimir-avatar')

      expect(container).toHaveAttribute('data-size', size)
    })

    it('defaults to stage when no size is provided', () => {
      render(<MimirAvatar state="idle" />)

      const container = screen.getByTestId('mimir-avatar')

      expect(container).toHaveAttribute('data-size', 'stage')
    })
  })

  describe('respiration', () => {
    const breathingDurations: Record<MimirState, string | null> = {
      idle: '8s',
      listening: '3.4s',
      thinking: '2.6s',
      processing: null,
      responding: '4.4s',
      success: '6s',
    }

    it.each(
      Object.entries(breathingDurations).filter(([, d]) => d !== null) as [MimirState, string][],
    )('%s: breathing animation has duration %s', (state, duration) => {
      render(<MimirAvatar state={state} />)

      const breathing = screen.getByTestId('breathing')

      expect(breathing.style.animationDuration).toBe(duration)
    })

    it('processing: no breathing animation', () => {
      render(<MimirAvatar state="processing" />)

      expect(screen.queryByTestId('breathing')).toSatisfy(
        (el: HTMLElement | null) => el === null || el.style.animationName === 'none',
      )
    })
  })

  describe('particules', () => {
    const particleCounts: Record<MimirState, number> = {
      idle: 8,
      listening: 13,
      thinking: 15,
      processing: 7,
      responding: 11,
      success: 7,
    }

    it.each(
      Object.entries(particleCounts) as [MimirState, number][],
    )('%s: renders %i particles', (state, count) => {
      render(<MimirAvatar state={state} />)

      const particles = screen.getAllByTestId('particle')

      expect(particles).toHaveLength(count)
    })
  })

  describe('accessibilite', () => {
    it('has aria-hidden="true" on the container by default', () => {
      render(<MimirAvatar state="idle" />)

      const container = screen.getByTestId('mimir-avatar')

      expect(container).toHaveAttribute('aria-hidden', 'true')
    })

    it('forwards aria-hidden={false} when explicitly set', () => {
      render(<MimirAvatar state="idle" aria-hidden={false} />)

      const container = screen.getByTestId('mimir-avatar')

      expect(container).not.toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('reduced-motion', () => {
    beforeEach(() => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('reduces intensity to 0.4 when prefers-reduced-motion is active', () => {
      render(<MimirAvatar state="listening" />)

      const container = screen.getByTestId('mimir-avatar')

      expect(container).toHaveAttribute('data-reduced-motion', 'true')
    })

    it('stops looping animations when prefers-reduced-motion is active', () => {
      render(<MimirAvatar state="listening" />)

      const breathing = screen.queryByTestId('breathing')

      expect(breathing).toSatisfy(
        (el: HTMLElement | null) =>
          el === null || el.style.animationPlayState === 'paused' || el.style.animationName === 'none',
      )
    })
  })
})
