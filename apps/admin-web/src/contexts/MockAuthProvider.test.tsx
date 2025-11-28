import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MockAuthProvider } from './MockAuthProvider'
import { useAuth } from '../hooks/useAuth'

function TestComponent() {
  const { user, loading, error, signInWithGoogle, signOut } = useAuth()

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user-email">{user ? user.email : 'null'}</div>
      <div data-testid="user-uid">{user ? user.uid : 'null'}</div>
      <div data-testid="user-displayName">{user ? user.displayName : 'null'}</div>
      <div data-testid="user-isAdmin">{user ? user.isAdmin.toString() : 'null'}</div>
      <div data-testid="error">{error || 'null'}</div>
      <button onClick={signInWithGoogle}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('MockAuthProvider', () => {
  it('initializes with mock admin user', () => {
    render(
      <MockAuthProvider>
        <TestComponent />
      </MockAuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@mock.local')
    expect(screen.getByTestId('user-uid')).toHaveTextContent('mock-admin-user-001')
    expect(screen.getByTestId('user-displayName')).toHaveTextContent('Mock Admin User')
    expect(screen.getByTestId('user-isAdmin')).toHaveTextContent('true')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('has admin privileges by default', () => {
    render(
      <MockAuthProvider>
        <TestComponent />
      </MockAuthProvider>
    )

    expect(screen.getByTestId('user-isAdmin')).toHaveTextContent('true')
  })

  it('clears user when signOut is called', async () => {
    const user = userEvent.setup()

    render(
      <MockAuthProvider>
        <TestComponent />
      </MockAuthProvider>
    )

    // Verify user is initially logged in
    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@mock.local')

    // Sign out
    await act(async () => {
      await user.click(screen.getByText('Sign Out'))
    })

    // Verify user is cleared
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('null')
    })
  })

  it('restores mock user when signInWithGoogle is called after sign out', async () => {
    const user = userEvent.setup()

    render(
      <MockAuthProvider>
        <TestComponent />
      </MockAuthProvider>
    )

    // Sign out first
    await act(async () => {
      await user.click(screen.getByText('Sign Out'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('null')
    })

    // Sign in again
    await act(async () => {
      await user.click(screen.getByText('Sign In'))
    })

    // Verify mock user is restored
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@mock.local')
      expect(screen.getByTestId('user-isAdmin')).toHaveTextContent('true')
    })
  })

  it('has no error state initially', () => {
    render(
      <MockAuthProvider>
        <TestComponent />
      </MockAuthProvider>
    )

    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('is not in loading state', () => {
    render(
      <MockAuthProvider>
        <TestComponent />
      </MockAuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })
})
