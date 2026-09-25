import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from '@/components/ui/switch'

describe('Toggle (Switch)', () => {
  it('renders with role switch', () => {
    render(<Switch aria-label="Dark mode" />)

    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument()
  })

  it('has aria-checked false by default', () => {
    render(<Switch aria-label="Dark mode" />)

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles aria-checked on click', async () => {
    const user = userEvent.setup()

    render(<Switch aria-label="Dark mode" />)
    await user.click(screen.getByRole('switch'))

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('has 300ms transition class', () => {
    render(<Switch aria-label="Dark mode" />)

    const toggle = screen.getByRole('switch')
    expect(toggle.className).toMatch(/duration-300|dur-quick/)
  })
})
