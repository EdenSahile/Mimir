import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Segmented } from '@/components/ui/Segmented'

describe('Segmented', () => {
  it('renders all options as radio buttons', () => {
    render(
      <Segmented options={['Assistant', 'Workspace']} value="Assistant" onChange={vi.fn()} />,
    )

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
  })

  it('renders inside a radiogroup', () => {
    render(
      <Segmented options={['Assistant', 'Workspace']} value="Assistant" onChange={vi.fn()} />,
    )

    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('marks the active option with aria-checked true', () => {
    render(
      <Segmented options={['Assistant', 'Workspace']} value="Workspace" onChange={vi.fn()} />,
    )

    expect(screen.getByRole('radio', { name: 'Workspace' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('marks inactive options with aria-checked false', () => {
    render(
      <Segmented options={['Assistant', 'Workspace']} value="Workspace" onChange={vi.fn()} />,
    )

    expect(screen.getByRole('radio', { name: 'Assistant' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('calls onChange with the clicked option value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<Segmented options={['Assistant', 'Workspace']} value="Assistant" onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: 'Workspace' }))

    expect(onChange).toHaveBeenCalledWith('Workspace')
  })

  it('applies different classes for active and inactive options', () => {
    render(
      <Segmented options={['Assistant', 'Workspace']} value="Assistant" onChange={vi.fn()} />,
    )

    const activeClassName = screen.getByRole('radio', { name: 'Assistant' }).className
    const inactiveClassName = screen.getByRole('radio', { name: 'Workspace' }).className

    expect(activeClassName).not.toBe(inactiveClassName)
  })
})
