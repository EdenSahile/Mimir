import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Onboarding from '@/components/pages/Onboarding/Onboarding'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>,
  )
}

describe('Onboarding', () => {
  it('renders step 1 with text input', () => {
    renderOnboarding()

    expect(screen.getByText('Étape 1 · Identité')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Comment doit-on vous appeler ?' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Votre prénom')).toBeInTheDocument()
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('advances to step 2 on "Continuer"', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByTestId('onboarding-continue'))

    expect(screen.getByText('Étape 2 · Activité')).toBeInTheDocument()
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ex. product designer, freelance')).toBeInTheDocument()
  })

  it('advances on "Passer"', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByTestId('onboarding-skip'))

    expect(screen.getByText('Étape 2 · Activité')).toBeInTheDocument()
  })

  it('shows chips on step 3', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByTestId('onboarding-continue'))
    await user.click(screen.getByTestId('onboarding-continue'))

    expect(screen.getByText('Étape 3 · Objectifs')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Structurer mes projets' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Écrire davantage' })).toBeInTheDocument()
  })

  it('toggles chip selection', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByTestId('onboarding-continue'))
    await user.click(screen.getByTestId('onboarding-continue'))

    const chip = screen.getByRole('checkbox', { name: 'Apprendre' })
    expect(chip).toHaveAttribute('aria-checked', 'false')

    await user.click(chip)
    expect(chip).toHaveAttribute('aria-checked', 'true')

    await user.click(chip)
    expect(chip).toHaveAttribute('aria-checked', 'false')
  })

  it('shows "Entrer dans Mímir" on last step and navigates to /mimir', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByTestId('onboarding-continue'))
    }

    expect(screen.getByText('Étape 5 · Usage')).toBeInTheDocument()
    expect(screen.getByText('5 / 5')).toBeInTheDocument()

    const cta = screen.getByTestId('onboarding-continue')
    expect(cta).toHaveTextContent('Entrer dans Mímir')
    expect(screen.queryByTestId('onboarding-skip')).not.toBeInTheDocument()

    await user.click(cta)
    expect(mockNavigate).toHaveBeenCalledWith('/mimir')
  })

  it('shows 5 progress dots', () => {
    renderOnboarding()

    const dots = screen.getAllByTestId('progress-dot')
    expect(dots).toHaveLength(5)
  })

  it('renders avatar companion', () => {
    renderOnboarding()

    expect(screen.getByText('MÍMIR')).toBeInTheDocument()
    expect(screen.getByText(/Quelques repères suffisent/)).toBeInTheDocument()
  })
})
