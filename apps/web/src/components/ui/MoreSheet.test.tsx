import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MoreSheet from '@/components/ui/MoreSheet'

function renderMoreSheet() {
  return render(
    <MemoryRouter>
      <MoreSheet />
    </MemoryRouter>,
  )
}

describe('MoreSheet', () => {
  it('does not show sheet content before the trigger is clicked', () => {
    renderMoreSheet()

    expect(screen.queryByText('AI News')).not.toBeInTheDocument()
  })

  it('shows the sheet when the Plus button is clicked', async () => {
    const user = userEvent.setup()

    renderMoreSheet()
    await user.click(screen.getByRole('button', { name: 'Plus' }))

    expect(screen.getByText('AI News')).toBeInTheDocument()
  })

  it('renders a scrim when the sheet is open', async () => {
    const user = userEvent.setup()

    renderMoreSheet()
    await user.click(screen.getByRole('button', { name: 'Plus' }))

    expect(screen.getByTestId('scrim')).toBeInTheDocument()
  })

  it('closes the sheet when the scrim is clicked', async () => {
    const user = userEvent.setup()

    renderMoreSheet()
    await user.click(screen.getByRole('button', { name: 'Plus' }))
    await user.click(screen.getByTestId('scrim'))

    expect(screen.queryByText('AI News')).not.toBeInTheDocument()
  })

  it('contains all 4 navigation items', async () => {
    const user = userEvent.setup()

    renderMoreSheet()
    await user.click(screen.getByRole('button', { name: 'Plus' }))

    expect(screen.getByText('AI News')).toBeInTheDocument()
    expect(screen.getByText('Job Watch')).toBeInTheDocument()
    expect(screen.getByText('Mémoire')).toBeInTheDocument()
    expect(screen.getByText('Réglages')).toBeInTheDocument()
  })
})
