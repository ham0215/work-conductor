import { useEffect, useCallback, useRef } from 'react'
import './DeleteConfirmationModal.css'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  nodeName: string
  nodeTitle: string
  childCount: number
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmationModal({
  isOpen,
  nodeName,
  nodeTitle,
  childCount,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: Tab and Shift+Tab
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return

    // Store the previously focused element
    previousActiveElement.current = document.activeElement

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Focus the first button in the modal
    const timer = setTimeout(() => {
      const cancelButton = modalRef.current?.querySelector<HTMLButtonElement>('.btn-secondary')
      cancelButton?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)

      // Restore focus to the previously focused element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal-content delete-confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <div className="modal-header danger">
          <div className="header-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <div className="header-content">
            <h3 id="delete-modal-title">Delete Team Member</h3>
            <p>This action cannot be undone</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-target-info">
            <span className="target-name">{nodeName}</span>
            <span className="target-title">{nodeTitle}</span>
          </div>

          {childCount > 0 && (
            <div className="warning-box" id="delete-modal-description">
              <h4>
                Warning: This will also delete {childCount} subordinate
                {childCount > 1 ? 's' : ''}
              </h4>
              <p>
                All team members reporting to this person will also be removed from the organization
                chart.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
