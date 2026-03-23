import { render, screen } from '@testing-library/react'
import HomePage from './page'

describe('HomePage', () => {
  it('renders the hero section', () => {
    render(<HomePage />)
    expect(screen.getByText(/What do you/i)).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<HomePage />)
    expect(
      screen.getByText(/universal life-growing platform/i)
    ).toBeInTheDocument()
  })
})
