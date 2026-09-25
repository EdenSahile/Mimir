import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Wordmark from '@/components/ui/Wordmark'

function renderWordmark() {
  return render(
    <MemoryRouter>
      <Wordmark />
    </MemoryRouter>,
  )
}

describe('Wordmark', () => {
  it('displays the MÍMIR text', () => {
    renderWordmark()

    expect(screen.getByText('MÍMIR')).toBeInTheDocument()
  })

  it('links to the home page', () => {
    renderWordmark()

    expect(screen.getByRole('link', { name: 'MÍMIR' })).toHaveAttribute('href', '/')
  })
})
