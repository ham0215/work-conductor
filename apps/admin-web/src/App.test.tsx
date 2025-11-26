import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the header', () => {
    render(<App />)
    expect(screen.getByText('Work Conductor Admin')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<App />)
    expect(screen.getByText('Administration Dashboard')).toBeInTheDocument()
  })
})
