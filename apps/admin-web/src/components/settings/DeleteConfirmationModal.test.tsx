import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'

describe('DeleteConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    nodeName: 'John Doe',
    nodeTitle: 'Engineering Manager',
    childCount: 0,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with correct node information', () => {
    render(<DeleteConfirmationModal {...defaultProps} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Engineering Manager')).toBeInTheDocument()
    expect(screen.getByText('Delete Team Member')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<DeleteConfirmationModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Delete Team Member')).not.toBeInTheDocument()
  })

  it('shows warning box when childCount is greater than 0', () => {
    render(<DeleteConfirmationModal {...defaultProps} childCount={3} />)

    expect(screen.getByText(/Warning: This will also delete 3 subordinates/)).toBeInTheDocument()
    expect(
      screen.getByText(/All team members reporting to this person will also be removed/)
    ).toBeInTheDocument()
  })

  it('shows singular subordinate when childCount is 1', () => {
    render(<DeleteConfirmationModal {...defaultProps} childCount={1} />)

    expect(screen.getByText(/Warning: This will also delete 1 subordinate$/)).toBeInTheDocument()
  })

  it('does not show warning box when childCount is 0', () => {
    render(<DeleteConfirmationModal {...defaultProps} childCount={0} />)

    expect(screen.queryByText(/Warning:/)).not.toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when Delete button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(<DeleteConfirmationModal {...defaultProps} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: /Delete/ }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} />)

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking outside the modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} />)

    // Click on the overlay (outside the modal content)
    const overlay = document.querySelector('.modal-overlay')
    if (overlay) {
      await user.click(overlay)
    }

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when clicking inside the modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<DeleteConfirmationModal {...defaultProps} onClose={onClose} />)

    // Click on the modal content
    await user.click(screen.getByText('John Doe'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('has correct ARIA attributes for accessibility', () => {
    render(<DeleteConfirmationModal {...defaultProps} />)

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-modal-title')
  })

  it('has close button with correct aria-label', () => {
    render(<DeleteConfirmationModal {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument()
  })

  it('focuses Cancel button when modal opens', async () => {
    render(<DeleteConfirmationModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
    })
  })
})
