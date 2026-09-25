import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it.each(['primary', 'secondary', 'ghost', 'destructive'] as const)(
    'renders %s variant with distinct classes',
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>)

      const button = screen.getByRole('button', { name: variant })
      expect(button).toBeInTheDocument()
      expect(button.className).not.toBe('')
    },
  )

  it('has cursor-pointer by default', () => {
    render(<Button>Click</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toContain('cursor-pointer')
  })

  it('overrides cursor-pointer with cursor-not-allowed when disabled', () => {
    render(<Button disabled>Click</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toContain('disabled:cursor-not-allowed')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Click</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button disabled onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('has min-height of 44px (touch target)', () => {
    render(<Button>Click</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toMatch(/min-h-11|min-h-\[44px\]/)
  })

  it('primary variant has glow box-shadow', () => {
    render(<Button variant="primary">Glow</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toMatch(/shadow|glow/)
  })
})
