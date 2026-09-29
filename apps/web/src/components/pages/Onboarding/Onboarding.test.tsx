import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Onboarding from '@/components/pages/Onboarding/Onboarding'
import { ONBOARDING_STEPS } from '@/data/onboarding'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/components/ui/MimirAvatar/MimirAvatar', () => ({
  default: (props: Record<string, unknown>) => (
    <div
      data-testid="mimir-avatar"
      data-state={props.state as string}
      data-size={props.size as string}
    />
  ),
}))

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>,
  )
}

async function advanceSteps(
  user: ReturnType<typeof userEvent.setup>,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    await user.click(screen.getByTestId('onboarding-continue'))
  }
}

describe('Onboarding', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('colonne avatar', () => {
    it('displays wordmark MÍMIR', () => {
      renderOnboarding()

      expect(screen.getByText('MÍMIR')).toBeInTheDocument()
    })

    it('displays reassuring phrase', () => {
      renderOnboarding()

      expect(
        screen.getByText(
          'Quelques repères suffisent pour commencer. Vous pourrez tout ajuster plus tard.',
        ),
      ).toBeInTheDocument()
    })

    it('renders MimirAvatar with size companion', () => {
      renderOnboarding()

      const avatar = screen.getByTestId('mimir-avatar')
      expect(avatar).toHaveAttribute('data-size', 'companion')
    })
  })

  describe('layout grille', () => {
    it('has a grid root with 2 child sections', () => {
      const { container } = renderOnboarding()

      const gridRoot = container.firstElementChild as HTMLElement
      expect(gridRoot.children).toHaveLength(2)
    })

    it('form section has max-w-[560px]', () => {
      const { container } = renderOnboarding()

      const gridRoot = container.firstElementChild as HTMLElement
      const formSection = gridRoot.children[1] as HTMLElement
      expect(formSection.className).toContain('max-w-[560px]')
    })
  })

  describe('barre de progression', () => {
    it('renders 5 progress dots', () => {
      renderOnboarding()

      const dots = screen.getAllByTestId('progress-dot')
      expect(dots).toHaveLength(5)
    })

    it('shows counter "1 / 5" at start', () => {
      renderOnboarding()

      expect(screen.getByText('1 / 5')).toBeInTheDocument()
    })

    it('increments counter on each advance', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 1)
      expect(screen.getByText('2 / 5')).toBeInTheDocument()

      await advanceSteps(user, 1)
      expect(screen.getByText('3 / 5')).toBeInTheDocument()

      await advanceSteps(user, 1)
      expect(screen.getByText('4 / 5')).toBeInTheDocument()

      await advanceSteps(user, 1)
      expect(screen.getByText('5 / 5')).toBeInTheDocument()
    })

    it('active dot has width 22 and inactive dots have width 6', () => {
      renderOnboarding()

      const dots = screen.getAllByTestId('progress-dot')
      expect(dots[0]).toHaveStyle({ width: '22px' })
      expect(dots[1]).toHaveStyle({ width: '6px' })
      expect(dots[2]).toHaveStyle({ width: '6px' })
      expect(dots[3]).toHaveStyle({ width: '6px' })
      expect(dots[4]).toHaveStyle({ width: '6px' })
    })

    it('active dot follows current step', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 2)

      const dots = screen.getAllByTestId('progress-dot')
      expect(dots[0]).toHaveStyle({ width: '6px' })
      expect(dots[1]).toHaveStyle({ width: '6px' })
      expect(dots[2]).toHaveStyle({ width: '22px' })
      expect(dots[3]).toHaveStyle({ width: '6px' })
      expect(dots[4]).toHaveStyle({ width: '6px' })
    })
  })

  describe('textes des étapes', () => {
    it('step 1 shows kicker, question and help text', () => {
      renderOnboarding()

      expect(screen.getByText('Étape 1 · Identité')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Comment doit-on vous appeler ?',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Mímir utilisera ce prénom dans ses réponses.'),
      ).toBeInTheDocument()
    })

    it('step 2 shows kicker, question and help text', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 1)

      expect(screen.getByText('Étape 2 · Activité')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Que faites-vous en ce moment ?',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Une phrase suffit. Cela cadre le contexte de tous vos échanges.',
        ),
      ).toBeInTheDocument()
    })

    it('step 3 shows kicker, question and help text', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 2)

      expect(screen.getByText('Étape 3 · Objectifs')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Sur quoi voulez-vous avancer ?',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Choisissez ce qui compte cette saison. Vous pourrez en ajouter.',
        ),
      ).toBeInTheDocument()
    })

    it('step 4 shows kicker, question and help text', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 3)

      expect(screen.getByText('Étape 4 · Intérêts')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Que doit suivre Mímir pour vous ?',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Cela alimente votre veille.'),
      ).toBeInTheDocument()
    })

    it('step 5 shows kicker, question and help text', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 4)

      expect(screen.getByText('Étape 5 · Usage')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Comment voulez-vous travailler avec Mímir ?',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /Le ton et le niveau d.initiative de Mímir s.ajustent\./,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('champs texte étapes 1-2', () => {
    it('step 1 shows input with placeholder "Votre prénom"', () => {
      renderOnboarding()

      expect(screen.getByPlaceholderText('Votre prénom')).toBeInTheDocument()
    })

    it('step 2 shows input with placeholder "ex. product designer, freelance"', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 1)

      expect(
        screen.getByPlaceholderText('ex. product designer, freelance'),
      ).toBeInTheDocument()
    })

    it('typing in step 1 updates the input value', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      const input = screen.getByPlaceholderText('Votre prénom')

      await user.type(input, 'Eden')

      expect(input).toHaveValue('Eden')
    })

    it('typing in step 2 updates the input value', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      await advanceSteps(user, 1)
      const input = screen.getByPlaceholderText(
        'ex. product designer, freelance',
      )

      await user.type(input, 'developer')

      expect(input).toHaveValue('developer')
    })
  })

  describe('chips étapes 3-5', () => {
    it('step 3 renders 6 chips with role checkbox', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 2)

      const chips = screen.getAllByRole('checkbox')
      expect(chips).toHaveLength(6)
    })

    it('step 3 chip labels match the options from data', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 2)

      for (const option of ONBOARDING_STEPS[2].options!) {
        expect(
          screen.getByRole('checkbox', { name: option }),
        ).toBeInTheDocument()
      }
    })

    it('step 4 renders 6 chips', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 3)

      const chips = screen.getAllByRole('checkbox')
      expect(chips).toHaveLength(6)
    })

    it('step 5 renders 4 chips', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 4)

      const chips = screen.getAllByRole('checkbox')
      expect(chips).toHaveLength(4)
    })

    it('chip toggles aria-checked on click', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      await advanceSteps(user, 2)
      const chip = screen.getByRole('checkbox', { name: 'Apprendre' })

      expect(chip).toHaveAttribute('aria-checked', 'false')

      await user.click(chip)
      expect(chip).toHaveAttribute('aria-checked', 'true')

      await user.click(chip)
      expect(chip).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('avatar state', () => {
    it('step 1 sets avatar state to idle', () => {
      renderOnboarding()

      const avatar = screen.getByTestId('mimir-avatar')
      expect(avatar).toHaveAttribute('data-state', 'idle')
    })

    it('step 2 sets avatar state to listening', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 1)

      const avatar = screen.getByTestId('mimir-avatar')
      expect(avatar).toHaveAttribute('data-state', 'listening')
    })

    it('step 3 sets avatar state to thinking', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 2)

      const avatar = screen.getByTestId('mimir-avatar')
      expect(avatar).toHaveAttribute('data-state', 'thinking')
    })

    it('step 4 sets avatar state to processing', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 3)

      const avatar = screen.getByTestId('mimir-avatar')
      expect(avatar).toHaveAttribute('data-state', 'processing')
    })

    it('step 5 sets avatar state to responding', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 4)

      const avatar = screen.getByTestId('mimir-avatar')
      expect(avatar).toHaveAttribute('data-state', 'responding')
    })
  })

  describe('navigation', () => {
    it('"Continuer" and "Passer" are both present at steps 1-4', () => {
      renderOnboarding()

      expect(screen.getByTestId('onboarding-continue')).toHaveTextContent(
        'Continuer',
      )
      expect(screen.getByTestId('onboarding-skip')).toHaveTextContent('Passer')
    })

    it('"Continuer" advances to next step', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await user.click(screen.getByTestId('onboarding-continue'))

      expect(screen.getByText('Étape 2 · Activité')).toBeInTheDocument()
    })

    it('"Passer" advances to next step', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await user.click(screen.getByTestId('onboarding-skip'))

      expect(screen.getByText('Étape 2 · Activité')).toBeInTheDocument()
    })
  })

  describe('dernière étape', () => {
    it('shows "Entrer dans Mímir" instead of "Continuer"', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 4)

      expect(screen.getByTestId('onboarding-continue')).toHaveTextContent(
        'Entrer dans Mímir',
      )
    })

    it('does not show "Passer" button', async () => {
      const user = userEvent.setup()
      renderOnboarding()

      await advanceSteps(user, 4)

      expect(screen.queryByTestId('onboarding-skip')).not.toBeInTheDocument()
    })

    it('CTA navigates to /mimir', async () => {
      const user = userEvent.setup()
      renderOnboarding()
      await advanceSteps(user, 4)

      await user.click(screen.getByTestId('onboarding-continue'))

      expect(mockNavigate).toHaveBeenCalledWith('/mimir')
    })
  })
})
