import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Assistant from '@/components/pages/Assistant/Assistant'

vi.mock('@/components/ui/MimirAvatar/MimirAvatar', () => ({
  default: (props: Record<string, unknown>) => (
    <div
      data-testid="mimir-avatar"
      data-state={props.state as string}
      data-size={props.size as string}
    />
  ),
}))

function matchesViewport(
  query: string,
  viewport: { width: number; height: number },
): boolean {
  const minWidth = query.match(/min-width:\s*(\d+)px/)
  if (minWidth) return viewport.width >= Number(minWidth[1])

  const maxWidth = query.match(/max-width:\s*(\d+)px/)
  if (maxWidth) return viewport.width <= Number(maxWidth[1])

  const minHeight = query.match(/min-height:\s*(\d+)px/)
  if (minHeight) return viewport.height >= Number(minHeight[1])

  const maxHeight = query.match(/max-height:\s*(\d+)px/)
  if (maxHeight) return viewport.height <= Number(maxHeight[1])

  return false
}

function setViewport(viewport: { width: number; height: number }) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matchesViewport(query, viewport),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function renderAssistant(viewport = { width: 1440, height: 900 }) {
  setViewport(viewport)

  return render(
    <MemoryRouter>
      <Assistant />
    </MemoryRouter>,
  )
}

async function sendRequest(
  user: ReturnType<typeof userEvent.setup>,
  text: string,
) {
  await user.type(screen.getByPlaceholderText('Parlez à Mímir'), `${text}{Enter}`)
}

describe('Assistant', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  function setupUser() {
    return userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  }

  describe('la page ne défile jamais', () => {
    it('locks the scene against scrolling', () => {
      renderAssistant()

      const scene = screen.getByTestId('assistant-scene')
      expect(scene.className).toMatch(/overflow-hidden/)
      expect(scene.className).toMatch(/min-h-0/)
      expect(scene.className).toMatch(/flex-1/)
    })

    it('never opens a scroll container on the scene root', () => {
      renderAssistant()

      const scene = screen.getByTestId('assistant-scene')
      expect(scene.className).not.toMatch(/overflow-(auto|scroll)/)
    })
  })

  describe("l'avatar est le seul élément flexible", () => {
    it('gives the flex class to the avatar stage', () => {
      renderAssistant()

      const stage = screen.getByTestId('avatar-stage')
      expect(stage.className).toMatch(/flex-1/)
      expect(stage.className).not.toMatch(/shrink-0/)
    })

    it('keeps the composer at a fixed height', () => {
      renderAssistant()

      const composer = screen.getByTestId('composer')
      expect(composer.className).toMatch(/shrink-0/)
    })
  })

  describe('le Composer est toujours visible', () => {
    it('shows the composer in idle', () => {
      renderAssistant()

      expect(screen.getByTestId('composer')).toBeInTheDocument()
    })

    it('keeps the composer visible during a request', async () => {
      const user = setupUser()
      renderAssistant()

      await sendRequest(user, 'Résume ma semaine')

      expect(screen.getByTestId('composer')).toBeInTheDocument()
    })
  })

  describe('Composer texte', () => {
    it('echoes the request above the avatar and clears the field on send', async () => {
      const user = setupUser()
      renderAssistant()

      await sendRequest(user, 'Résume ma semaine')

      expect(screen.getByTestId('request-echo')).toHaveTextContent(
        'Résume ma semaine',
      )
      expect(screen.getByPlaceholderText('Parlez à Mímir')).toHaveValue('')
    })
  })

  describe('SuggestionChips', () => {
    it('shows the suggestion chips in idle', () => {
      renderAssistant()

      expect(screen.getByTestId('suggestion-chips')).toBeInTheDocument()
    })

    it('hides the suggestion chips during a request', async () => {
      const user = setupUser()
      renderAssistant()

      await sendRequest(user, 'Résume ma semaine')

      expect(screen.queryByTestId('suggestion-chips')).not.toBeInTheDocument()
    })
  })

  describe('ThreadDrawer', () => {
    it('opens the thread drawer from the pill button', async () => {
      const user = setupUser()
      renderAssistant()

      await user.click(screen.getByRole('button', { name: /Fil de l'échange/ }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('panneaux ambiants', () => {
    it('shows both ambient panels in idle at 1440px', () => {
      renderAssistant({ width: 1440, height: 900 })

      expect(screen.getByText("Aujourd'hui")).toBeInTheDocument()
      expect(screen.getByText('Contexte actif')).toBeInTheDocument()
    })

    it('hides the ambient panels below 1180px', () => {
      renderAssistant({ width: 1000, height: 900 })

      expect(screen.queryByText("Aujourd'hui")).not.toBeInTheDocument()
      expect(screen.queryByText('Contexte actif')).not.toBeInTheDocument()
    })

    it('hides the ambient panels during a request even at 1440px', async () => {
      const user = setupUser()
      renderAssistant({ width: 1440, height: 900 })

      await sendRequest(user, 'Résume ma semaine')

      expect(screen.queryByText("Aujourd'hui")).not.toBeInTheDocument()
      expect(screen.queryByText('Contexte actif')).not.toBeInTheDocument()
    })
  })

  describe('seuils de hauteur', () => {
    it('shows the greeting above 700px of height', () => {
      renderAssistant({ width: 1440, height: 900 })

      expect(screen.getByText(/Bonjour/)).toBeInTheDocument()
    })

    it('hides the greeting below 700px of height', () => {
      renderAssistant({ width: 1440, height: 680 })

      expect(screen.queryByText(/Bonjour/)).not.toBeInTheDocument()
    })

    it('shows the "Votre demande" label during a request above 640px', async () => {
      const user = setupUser()
      renderAssistant({ width: 1440, height: 900 })

      await sendRequest(user, 'Résume ma semaine')

      expect(screen.getByText('Votre demande')).toBeInTheDocument()
    })

    it('hides the "Votre demande" label during a request below 640px', async () => {
      const user = setupUser()
      renderAssistant({ width: 1440, height: 620 })

      await sendRequest(user, 'Résume ma semaine')

      expect(screen.queryByText('Votre demande')).not.toBeInTheDocument()
    })
  })

  describe('mobile', () => {
    it('reserves 84px at the bottom on mobile', () => {
      renderAssistant({ width: 390, height: 844 })

      expect(screen.getByTestId('assistant-scene')).toHaveStyle({
        paddingBottom: '84px',
      })
    })

    it('reserves no bottom space on desktop', () => {
      renderAssistant({ width: 1440, height: 900 })

      expect(screen.getByTestId('assistant-scene')).not.toHaveStyle({
        paddingBottom: '84px',
      })
    })
  })
})
