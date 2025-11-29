import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { OrgChartEditor } from './OrgChartEditor'
import type { OrgNode } from '../../types/tenant'

describe('OrgChartEditor', () => {
  const mockOnChange = vi.fn()

  const sampleNodes: OrgNode[] = [
    {
      id: 'node-1',
      name: 'Alice',
      title: 'CEO',
      parentId: null,
      children: [
        {
          id: 'node-2',
          name: 'Bob',
          title: 'CTO',
          parentId: 'node-1',
          children: [
            {
              id: 'node-3',
              name: 'Charlie',
              title: 'Engineer',
              parentId: 'node-2',
            },
          ],
        },
        {
          id: 'node-4',
          name: 'Diana',
          title: 'CFO',
          parentId: 'node-1',
        },
      ],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all nodes in the tree', () => {
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
      expect(screen.getByText('Diana')).toBeInTheDocument()
    })

    it('renders node titles', () => {
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      expect(screen.getByText('CEO')).toBeInTheDocument()
      expect(screen.getByText('CTO')).toBeInTheDocument()
      expect(screen.getByText('Engineer')).toBeInTheDocument()
      expect(screen.getByText('CFO')).toBeInTheDocument()
    })

    it('renders empty state when no nodes', () => {
      render(<OrgChartEditor nodes={[]} onChange={mockOnChange} />)

      expect(screen.getByText(/No organization chart yet/)).toBeInTheDocument()
    })

    it('renders drag handles for all nodes', () => {
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      const dragHandles = screen.getAllByRole('button', { name: /Drag.*to reposition/ })
      expect(dragHandles).toHaveLength(4)
    })

    it('renders action buttons for each node', () => {
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      // Each node has Add, Edit, Delete buttons
      expect(screen.getAllByRole('button', { name: /Add subordinate/ })).toHaveLength(4)
      expect(screen.getAllByRole('button', { name: /Edit/ })).toHaveLength(4)
      expect(screen.getAllByRole('button', { name: /Delete/ })).toHaveLength(4)
    })
  })

  describe('Adding nodes', () => {
    it('shows add form when Add Member button is clicked', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      await user.click(screen.getByRole('button', { name: '+ Add Member' }))

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Title / Position')).toBeInTheDocument()
    })

    it('adds a new node when form is submitted', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      await user.click(screen.getByRole('button', { name: '+ Add Member' }))

      await user.type(screen.getByPlaceholderText('Name'), 'Eve')
      await user.type(screen.getByPlaceholderText('Title / Position'), 'Designer')
      await user.click(screen.getByRole('button', { name: 'Add Member' }))

      expect(mockOnChange).toHaveBeenCalled()
      const newNodes = mockOnChange.mock.calls[0][0]
      // Should have original root + new root node
      expect(newNodes.length).toBe(2)
    })

    it('cancels adding when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      await user.click(screen.getByRole('button', { name: '+ Add Member' }))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument()
    })

    it('can add subordinate to specific node', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      // Click add on Bob's node
      const addButtons = screen.getAllByRole('button', { name: /Add subordinate to Bob/ })
      await user.click(addButtons[0])

      // The form should appear with Bob pre-selected as parent
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    })
  })

  describe('Editing nodes', () => {
    it('shows edit form when Edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      const editButtons = screen.getAllByRole('button', { name: /Edit Alice/ })
      await user.click(editButtons[0])

      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveValue('Alice')
      expect(inputs[1]).toHaveValue('CEO')
    })

    it('saves edits when Save button is clicked', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      const editButtons = screen.getAllByRole('button', { name: /Edit Alice/ })
      await user.click(editButtons[0])

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      await user.type(inputs[0], 'Alice Updated')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('cancels edit when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      const editButtons = screen.getAllByRole('button', { name: /Edit Alice/ })
      await user.click(editButtons[0])
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      // Edit form should be closed
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Deleting nodes', () => {
    it('shows confirmation modal when Delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      const deleteButtons = screen.getAllByRole('button', { name: /Delete Charlie/ })
      await user.click(deleteButtons[0])

      expect(screen.getByText('Delete Team Member')).toBeInTheDocument()
      // Charlie appears both in the tree and in the modal
      expect(screen.getAllByText('Charlie')).toHaveLength(2)
      // Engineer appears both in the tree and in the modal
      expect(screen.getAllByText('Engineer')).toHaveLength(2)
    })

    it('shows child count warning for nodes with children', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      // Delete Alice who has 3 descendants (Bob, Charlie, Diana)
      const deleteButtons = screen.getAllByRole('button', { name: /Delete Alice/ })
      await user.click(deleteButtons[0])

      expect(screen.getByText(/Warning: This will also delete 3 subordinates/)).toBeInTheDocument()
    })

    it('deletes node when confirmed', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      const deleteButtons = screen.getAllByRole('button', { name: /Delete Charlie/ })
      await user.click(deleteButtons[0])

      // Click Delete in the modal
      const deleteInModal = screen.getByRole('alertdialog').querySelector('.btn-danger')
      if (deleteInModal) {
        await user.click(deleteInModal)
      }

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('closes modal without deleting when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      const deleteButtons = screen.getAllByRole('button', { name: /Delete Charlie/ })
      await user.click(deleteButtons[0])

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.queryByText('Delete Team Member')).not.toBeInTheDocument()
      })
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Input validation', () => {
    it('has maxLength attribute on name input', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      await user.click(screen.getByRole('button', { name: '+ Add Member' }))

      const nameInput = screen.getByPlaceholderText('Name')
      expect(nameInput).toHaveAttribute('maxLength', '100')
    })

    it('has maxLength attribute on title input', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      await user.click(screen.getByRole('button', { name: '+ Add Member' }))

      const titleInput = screen.getByPlaceholderText('Title / Position')
      expect(titleInput).toHaveAttribute('maxLength', '100')
    })

    it('trims whitespace from inputs when saving', async () => {
      const user = userEvent.setup()
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      await user.click(screen.getByRole('button', { name: '+ Add Member' }))

      await user.type(screen.getByPlaceholderText('Name'), '  Trimmed Name  ')
      await user.type(screen.getByPlaceholderText('Title / Position'), '  Trimmed Title  ')
      await user.click(screen.getByRole('button', { name: 'Add Member' }))

      expect(mockOnChange).toHaveBeenCalled()
      const newNodes = mockOnChange.mock.calls[0][0]
      const addedNode = newNodes.find(
        (n: OrgNode) => n.name === 'Trimmed Name' && n.title === 'Trimmed Title'
      )
      expect(addedNode).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('has accessible drag handles with aria-labels', () => {
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      expect(screen.getByRole('button', { name: 'Drag Alice to reposition' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Drag Bob to reposition' })).toBeInTheDocument()
    })

    it('has accessible action buttons with aria-labels', () => {
      render(<OrgChartEditor nodes={sampleNodes} onChange={mockOnChange} />)

      expect(screen.getByRole('button', { name: 'Add subordinate to Alice' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit Alice' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete Alice' })).toBeInTheDocument()
    })
  })
})
