import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Landing from '@/components/pages/Landing/Landing'

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/welcome" element={<h1>Welcome</h1>} />
        <Route path="/mimir" element={<h1>Mimir</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Landing', () => {
  describe('layout', () => {
    it('renders text and avatar in two distinct columns', () => {
      renderLanding()

      const textColumn = screen.getByTestId('hero-text')
      const avatarColumn = screen.getByTestId('hero-avatar')

      expect(textColumn).toBeInTheDocument()
      expect(avatarColumn).toBeInTheDocument()
    })

    it('positions the text column before the avatar column in DOM order', () => {
      renderLanding()

      const hero = screen.getByTestId('landing-hero')
      const children = Array.from(hero.children)
      const textIndex = children.indexOf(screen.getByTestId('hero-text'))
      const avatarIndex = children.indexOf(screen.getByTestId('hero-avatar'))

      expect(textIndex).toBeLessThan(avatarIndex)
    })
  })

  describe('headline', () => {
    it('renders an h1 with the headline text and display font', () => {
      renderLanding()

      const heading = screen.getByRole('heading', {
        level: 1,
        name: 'Une intelligence qui connaît votre contexte.',
      })

      expect(heading).toBeInTheDocument()
      expect(heading.className).toMatch(/font-display/)
    })
  })

  describe('avatar state cycle', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('starts with the avatar in idle state', () => {
      renderLanding()

      expect(screen.queryByTestId('wave-incoming')).not.toBeInTheDocument()
      expect(screen.queryByTestId('arcs')).not.toBeInTheDocument()
      expect(screen.queryByTestId('mouth-active')).not.toBeInTheDocument()
    })

    it('transitions to listening after 3.8s', () => {
      renderLanding()

      act(() => {
        vi.advanceTimersByTime(3800)
      })

      expect(screen.getAllByTestId('wave-incoming').length).toBeGreaterThanOrEqual(1)
    })

    it('transitions to thinking after 7.6s', () => {
      renderLanding()

      act(() => {
        vi.advanceTimersByTime(7600)
      })

      expect(screen.getByTestId('arcs')).toBeInTheDocument()
    })

    it('transitions to responding after 11.4s', () => {
      renderLanding()

      act(() => {
        vi.advanceTimersByTime(11400)
      })

      expect(screen.getByTestId('mouth-active')).toBeInTheDocument()
    })

    it('returns to idle after a full cycle of 15.2s', () => {
      renderLanding()

      act(() => {
        vi.advanceTimersByTime(15200)
      })

      expect(screen.queryByTestId('wave-incoming')).not.toBeInTheDocument()
      expect(screen.queryByTestId('arcs')).not.toBeInTheDocument()
      expect(screen.queryByTestId('mouth-active')).not.toBeInTheDocument()
    })
  })

  describe('reduced motion', () => {
    beforeEach(() => {
      vi.useFakeTimers()
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
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    it('keeps the avatar in idle when prefers-reduced-motion is active', () => {
      renderLanding()

      act(() => {
        vi.advanceTimersByTime(15200)
      })

      expect(screen.queryByTestId('wave-incoming')).not.toBeInTheDocument()
      expect(screen.queryByTestId('arcs')).not.toBeInTheDocument()
      expect(screen.queryByTestId('mouth-active')).not.toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('navigates to /welcome when clicking "Faire connaissance"', async () => {
      const user = userEvent.setup()

      renderLanding()
      await user.click(screen.getByRole('link', { name: 'Faire connaissance' }))

      expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    })

    it('navigates to /mimir when clicking "Voir l\'assistant"', async () => {
      const user = userEvent.setup()

      renderLanding()
      await user.click(screen.getByRole('link', { name: "Voir l'assistant" }))

      expect(screen.getByRole('heading', { name: 'Mimir' })).toBeInTheDocument()
    })
  })

  describe('animations', () => {
    it('applies rise animation with 900ms duration to the text column', () => {
      renderLanding()

      const textColumn = screen.getByTestId('hero-text')

      expect(textColumn.className).toMatch(/rise/)
      expect(textColumn.style.animationDuration).toBe('900ms')
    })

    it('applies fade animation with 1.6s duration to the avatar column', () => {
      renderLanding()

      const avatarColumn = screen.getByTestId('hero-avatar')

      expect(avatarColumn.className).toMatch(/fade/)
      expect(avatarColumn.style.animationDuration).toBe('1.6s')
    })
  })

  describe('footer', () => {
    it('renders three footer columns with titles', () => {
      renderLanding()

      expect(screen.getByText('Présence')).toBeInTheDocument()
      expect(screen.getByText('Contexte')).toBeInTheDocument()
      expect(screen.getByText('Contrôle')).toBeInTheDocument()
    })

    it('renders separators between footer columns', () => {
      renderLanding()

      const separators = screen.getAllByTestId('footer-separator')

      expect(separators).toHaveLength(2)
    })
  })

  describe('copy', () => {
    it('renders the kicker text', () => {
      renderLanding()

      expect(
        screen.getByText('Assistant personnel · présence contextuelle'),
      ).toBeInTheDocument()
    })

    it('renders the headline', () => {
      renderLanding()

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Une intelligence qui connaît votre contexte.',
        }),
      ).toBeInTheDocument()
    })

    it('renders the two CTA links', () => {
      renderLanding()

      expect(screen.getByRole('link', { name: 'Faire connaissance' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: "Voir l'assistant" })).toBeInTheDocument()
    })

    it('renders the feature tags', () => {
      renderLanding()

      expect(screen.getByText('Mémoire contrôlable')).toBeInTheDocument()
      expect(screen.getByText('Projets vivants')).toBeInTheDocument()
      expect(screen.getByText('Intégrations')).toBeInTheDocument()
    })

    it('renders the header with wordmark and navigation', () => {
      renderLanding()

      expect(screen.getByText('MÍMIR')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Entrer' })).toBeInTheDocument()
      expect(screen.getByText('Produit')).toBeInTheDocument()
      expect(screen.getByText('Mémoire')).toBeInTheDocument()
      expect(screen.getByText('Confidentialité')).toBeInTheDocument()
    })
  })
})
