import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('TextField (Input)', () => {
  it('renders an input element', () => {
    render(<Input aria-label="Name" />)

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()

    render(<Input aria-label="Name" />)
    await user.type(screen.getByRole('textbox'), 'Mímir')

    expect(screen.getByRole('textbox')).toHaveValue('Mímir')
  })

  it('has Mímir field background class', () => {
    render(<Input aria-label="Name" />)

    const input = screen.getByRole('textbox')
    expect(input.className).toContain('bg-[var(--field)]')
  })

  it('has border-radius 14px', () => {
    render(<Input aria-label="Name" />)

    const input = screen.getByRole('textbox')
    expect(input.className).toContain('rounded-[var(--r-md)]')
  })

  it('has min-height of 44px (touch target)', () => {
    render(<Input aria-label="Name" />)

    const input = screen.getByRole('textbox')
    expect(input.className).toMatch(/min-h-11|min-h-\[44px\]/)
  })
})
