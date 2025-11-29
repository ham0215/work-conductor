# Organization Chart Editor Enhancements - Technical Design Document

## Issue Reference
- **Issue**: #81 - [Admin] Organization Chart Editor
- **Parent Epic**: #72

## 1. Overview

This document outlines the technical design for enhancing the Organization Chart Editor component with drag-and-drop functionality and a delete confirmation dialog. The existing implementation provides basic CRUD operations for organization nodes; this enhancement adds intuitive drag-and-drop repositioning and safer deletion with user confirmation.

### Business Context and Goals
- Enable administrators to easily reorganize reporting structures by dragging nodes
- Prevent accidental deletion of nodes (especially those with subordinates) through confirmation dialogs
- Maintain data integrity during drag operations
- Provide accessible, responsive UI for all users

## 2. Requirements Summary

### 2.1 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1 | Create organization chart tree view | Implemented |
| FR-2 | Implement drag-and-drop node positioning | **To Be Implemented** |
| FR-3 | Build node creation dialog | Implemented |
| FR-4 | Create node edit form | Implemented |
| FR-5 | Implement node deletion with confirmation | **Partial - Confirmation Missing** |

### 2.2 Non-Functional Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-1 | Accessibility | WCAG 2.1 AA compliance for drag-and-drop and modal |
| NFR-2 | Performance | Drag operations must be smooth (60fps) |
| NFR-3 | Bundle Size | Minimize additional dependencies |
| NFR-4 | Browser Support | Modern browsers (Chrome, Firefox, Safari, Edge) |

### 2.3 Constraints and Assumptions

- React 19.2.0 is used (supports modern hooks)
- No external drag-and-drop library currently installed
- Existing modal pattern established in `/components/users/*Modal.tsx`
- CSS-based styling (no CSS-in-JS libraries)

## 3. Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Drag-and-Drop | **@dnd-kit/core + @dnd-kit/sortable** | Modern, lightweight (~15KB gzipped), excellent accessibility, tree-friendly, React 18/19 compatible |
| Confirmation Dialog | Native React Component | Follows existing modal patterns in codebase |
| State Management | React useState/useRef | Matches existing component patterns |
| Styling | CSS | Consistent with project conventions |

### 3.1 Drag-and-Drop Library Comparison

| Library | Bundle Size | Accessibility | Tree Support | React 19 | Recommendation |
|---------|-------------|---------------|--------------|----------|----------------|
| Native HTML5 DnD | 0KB | Poor | Manual | Yes | Not recommended - poor accessibility, complex edge cases |
| react-dnd | ~40KB | Fair | Manual | Yes | Heavy, complex API |
| @dnd-kit | ~15KB | Excellent | Built-in | Yes | **Recommended** - lightweight, accessible, tree-specific utilities |

**Decision**: Use `@dnd-kit/core` and `@dnd-kit/sortable` for their:
- Built-in keyboard navigation and screen reader support
- Tree-specific utilities (`@dnd-kit/sortable` with custom strategies)
- Smaller bundle size compared to alternatives
- Active maintenance and React 19 compatibility

## 4. Architecture

### 4.1 High-Level Architecture

```
+--------------------------------------------------+
|              OrgChartEditor.tsx                   |
|                                                   |
|  +--------------------------------------------+  |
|  |           DndContext Provider              |  |
|  |  +--------------------------------------+  |  |
|  |  |         SortableContext              |  |  |
|  |  |  +--------------------------------+  |  |  |
|  |  |  |    DraggableOrgNode (x N)      |  |  |  |
|  |  |  |    - useSortable hook          |  |  |  |
|  |  |  |    - Visual feedback           |  |  |  |
|  |  |  +--------------------------------+  |  |  |
|  |  +--------------------------------------+  |  |
|  +--------------------------------------------+  |
|                                                   |
|  +--------------------------------------------+  |
|  |        DeleteConfirmationModal             |  |
|  |  - Node info display                       |  |
|  |  - Child count warning                     |  |
|  |  - Cancel/Confirm actions                  |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

### 4.2 Component Design

#### 4.2.1 DraggableOrgNode Component

**Purpose**: Wrapper for individual org nodes that enables drag-and-drop

**Props Interface**:
```typescript
interface DraggableOrgNodeProps {
  node: FlatNode
  isEditing: boolean
  editForm: { name: string; title: string }
  onEdit: (node: FlatNode) => void
  onDelete: (id: string) => void
  onAddSubordinate: (parentId: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditFormChange: (form: { name: string; title: string }) => void
  isDragDisabled?: boolean
}
```

**Dependencies**:
- `@dnd-kit/core`: DndContext, DragOverlay
- `@dnd-kit/sortable`: useSortable, SortableContext

**Behavior**:
- Renders drag handle on left side of node
- Provides visual feedback during drag (opacity, shadow)
- Disables drag when in edit mode

#### 4.2.2 DeleteConfirmationModal Component

**Purpose**: Confirm deletion of org nodes with child count warning

**Props Interface**:
```typescript
interface DeleteConfirmationModalProps {
  isOpen: boolean
  node: FlatNode | null
  childCount: number
  onClose: () => void
  onConfirm: () => void
}
```

**Dependencies**: None (pure React component)

**Behavior**:
- Shows node name and title
- Displays warning with count of child nodes that will be deleted
- Escape key closes modal
- Click outside closes modal
- Focus trap within modal

### 4.3 Data Flow

```
User Drag Action
       |
       v
+------------------+
| DndContext       |
| onDragStart      |-----> Set dragging state
| onDragOver       |-----> Calculate drop target
| onDragEnd        |-----> Validate & update parentId
+------------------+
       |
       v
+------------------+
| handleDragEnd()  |
| - Validate move  |
| - Update flatNodes
| - Call onChange  |
+------------------+
       |
       v
+------------------+
| buildTree()      |
| - Reconstruct    |
| - Pass to parent |
+------------------+
```

### 4.4 Security Design

| Concern | Mitigation |
|---------|------------|
| XSS in node names | React's built-in escaping handles this |
| Data validation | Validate parentId references before applying |
| Infinite loops | Prevent dropping node onto its descendants |

## 5. API Specifications

### 5.1 Component Props (No Changes to External API)

The `OrgChartEditor` component maintains its existing props interface:

```typescript
interface OrgChartEditorProps {
  nodes: OrgNode[]
  onChange: (nodes: OrgNode[]) => void
}
```

### 5.2 Internal Event Handlers

#### handleDragEnd

```typescript
function handleDragEnd(event: DragEndEvent): void
```

**Parameters**:
- `event.active.id`: ID of the dragged node
- `event.over?.id`: ID of the drop target node (new parent)

**Behavior**:
1. If `over` is null, abort (dropped outside valid target)
2. If `active.id === over.id`, abort (dropped on self)
3. If `over.id` is descendant of `active.id`, abort (circular reference)
4. Update `parentId` of dragged node to `over.id`
5. Rebuild tree and call `onChange`

#### handleDeleteRequest

```typescript
function handleDeleteRequest(id: string): void
```

**Behavior**:
1. Find node by ID
2. Count descendants
3. Open DeleteConfirmationModal with node info

#### handleConfirmDelete

```typescript
function handleConfirmDelete(): void
```

**Behavior**:
1. Collect all descendant IDs
2. Filter out deleted nodes from flatNodes
3. Rebuild tree and call `onChange`
4. Close modal

## 6. Database Design

No database changes required. The `OrgNode` type remains unchanged:

```typescript
interface OrgNode {
  id: string
  name: string
  title: string
  parentId: string | null
  children?: OrgNode[]
}
```

## 7. Error Handling

### 7.1 Error Categories

| Category | Example | Handling |
|----------|---------|----------|
| Invalid Drop | Drop on descendant | Silently ignore, return node to original position |
| Empty Data | No nodes exist | Show empty state (existing) |
| Orphaned Nodes | Parent deleted | Treat as root nodes (existing behavior) |

### 7.2 Recovery Strategies

- **Drag Failures**: Drag overlay returns to original position via `@dnd-kit` animation
- **Delete Failures**: Modal shows error message, keeps modal open for retry

### 7.3 Logging Requirements

No additional logging required for client-side component.

## 8. Monitoring & Observability

Not applicable for client-side UI component.

---

# Task Breakdown

## Task 1: Add @dnd-kit Dependencies

- **Type**: feature
- **Priority**: high
- **Dependencies**: None
- **Estimated Complexity**: S
- **Description**: Install @dnd-kit/core and @dnd-kit/sortable packages
- **Acceptance Criteria**:
  - [ ] `@dnd-kit/core` added to package.json dependencies
  - [ ] `@dnd-kit/sortable` added to package.json dependencies
  - [ ] `npm install` completes without errors
  - [ ] TypeScript types are available
- **Technical Notes**:
  ```bash
  cd apps/admin-web && npm install @dnd-kit/core @dnd-kit/sortable
  ```

---

## Task 2: Create DeleteConfirmationModal Component

- **Type**: feature
- **Priority**: high
- **Dependencies**: None
- **Estimated Complexity**: M
- **Description**: Create a reusable confirmation modal for delete operations following the existing modal pattern
- **Acceptance Criteria**:
  - [ ] New file: `src/components/settings/DeleteConfirmationModal.tsx`
  - [ ] New file: `src/components/settings/DeleteConfirmationModal.css`
  - [ ] Modal displays node name and title
  - [ ] Modal shows warning with child count when > 0
  - [ ] Modal has Cancel and Delete buttons
  - [ ] Escape key closes modal
  - [ ] Click outside closes modal
  - [ ] Proper ARIA attributes for accessibility
  - [ ] Focus management (focus trap, return focus on close)
- **Technical Notes**:
  - Follow pattern from `UserDeactivateModal.tsx`
  - Use existing `.modal-overlay` and `.modal-content` CSS classes
  - Add danger styling similar to deactivate modal

### File: `DeleteConfirmationModal.tsx`

```typescript
import { useEffect, useCallback } from 'react'
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
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content delete-confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <div className="modal-header danger">
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <div className="header-content">
            <h3 id="delete-modal-title">Delete Team Member</h3>
            <p>This action cannot be undone</p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <h4>Warning: This will also delete {childCount} subordinate{childCount > 1 ? 's' : ''}</h4>
              <p>All team members reporting to this person will also be removed from the organization chart.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
```

### File: `DeleteConfirmationModal.css`

```css
.delete-confirm-modal {
  max-width: 420px;
}

.delete-confirm-modal .modal-header.danger {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
}

.delete-confirm-modal .header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fee2e2;
  border-radius: 50%;
  color: #dc2626;
  flex-shrink: 0;
}

.delete-confirm-modal .header-content {
  flex: 1;
}

.delete-confirm-modal .header-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #991b1b;
}

.delete-confirm-modal .header-content p {
  margin: 0;
  font-size: 0.875rem;
  color: #b91c1c;
}

.delete-confirm-modal .modal-close {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #991b1b;
  border-radius: 4px;
}

.delete-confirm-modal .modal-close:hover {
  background: rgba(185, 28, 28, 0.1);
}

.delete-target-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.delete-target-info .target-name {
  font-weight: 600;
  color: #333;
}

.delete-target-info .target-title {
  font-size: 0.875rem;
  color: #666;
}

.delete-confirm-modal .warning-box {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 1rem;
}

.delete-confirm-modal .warning-box h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400e;
}

.delete-confirm-modal .warning-box p {
  margin: 0;
  font-size: 0.8125rem;
  color: #a16207;
  line-height: 1.5;
}

.delete-confirm-modal .modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.delete-confirm-modal .btn-secondary {
  padding: 0.625rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-confirm-modal .btn-secondary:hover {
  background: #f3f4f6;
}

.delete-confirm-modal .btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #dc2626;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-confirm-modal .btn-danger:hover {
  background: #b91c1c;
}
```

---

## Task 3: Integrate DeleteConfirmationModal into OrgChartEditor

- **Type**: feature
- **Priority**: high
- **Dependencies**: Task 2
- **Estimated Complexity**: S
- **Description**: Replace direct delete with confirmation modal flow
- **Acceptance Criteria**:
  - [ ] Click Delete button opens confirmation modal
  - [ ] Modal shows correct node information
  - [ ] Modal shows correct child count
  - [ ] Cancel closes modal without deleting
  - [ ] Confirm deletes node and children
  - [ ] Modal closes after successful delete
- **Technical Notes**:
  - Add state for `deleteTarget: { node: FlatNode; childCount: number } | null`
  - Modify `handleDelete` to open modal instead of deleting
  - Add `handleConfirmDelete` to perform actual deletion

### Changes to `OrgChartEditor.tsx`:

```typescript
// Add import
import { DeleteConfirmationModal } from './DeleteConfirmationModal'

// Add state (after line 62)
const [deleteTarget, setDeleteTarget] = useState<{
  node: FlatNode
  childCount: number
} | null>(null)

// Replace handleDelete function (lines 87-97)
const handleDeleteRequest = (id: string) => {
  const node = flatNodes.find((n) => n.id === id)
  if (!node) return

  // Count descendants
  let childCount = 0
  const countChildren = (nodeId: string) => {
    flatNodes.filter((n) => n.parentId === nodeId).forEach((child) => {
      childCount++
      countChildren(child.id)
    })
  }
  countChildren(id)

  setDeleteTarget({ node, childCount })
}

const handleConfirmDelete = () => {
  if (!deleteTarget) return

  const toDelete = new Set<string>()
  const collectChildren = (nodeId: string) => {
    toDelete.add(nodeId)
    flatNodes.filter((n) => n.parentId === nodeId).forEach((child) => collectChildren(child.id))
  }
  collectChildren(deleteTarget.node.id)

  const updated = flatNodes.filter((n) => !toDelete.has(n.id))
  onChange(buildTree(updated))
  setDeleteTarget(null)
}

const handleCloseDeleteModal = () => {
  setDeleteTarget(null)
}

// Update button onClick (line 191)
// Change: onClick={() => handleDelete(node.id)}
// To:     onClick={() => handleDeleteRequest(node.id)}

// Add modal before closing div (before line 274)
<DeleteConfirmationModal
  isOpen={deleteTarget !== null}
  nodeName={deleteTarget?.node.name ?? ''}
  nodeTitle={deleteTarget?.node.title ?? ''}
  childCount={deleteTarget?.childCount ?? 0}
  onClose={handleCloseDeleteModal}
  onConfirm={handleConfirmDelete}
/>
```

---

## Task 4: Implement Drag-and-Drop Infrastructure

- **Type**: feature
- **Priority**: high
- **Dependencies**: Task 1
- **Estimated Complexity**: L
- **Description**: Add DndContext and SortableContext to OrgChartEditor with drag handlers
- **Acceptance Criteria**:
  - [ ] DndContext wraps the org tree
  - [ ] onDragStart, onDragOver, onDragEnd handlers implemented
  - [ ] Dragging state tracked for visual feedback
  - [ ] Invalid drops (self, descendant) are rejected
  - [ ] Successful drops update parent relationships
- **Technical Notes**:
  - Use `closestCenter` collision detection
  - Create helper `isDescendant(nodeId, potentialAncestorId)` function
  - Track `activeId` state during drag

### Add to `OrgChartEditor.tsx`:

```typescript
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

// Add state
const [activeId, setActiveId] = useState<string | null>(null)

// Add sensors for accessibility
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px movement before drag starts
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
)

// Helper to check if nodeId is descendant of ancestorId
const isDescendant = (nodeId: string, ancestorId: string): boolean => {
  const node = flatNodes.find((n) => n.id === nodeId)
  if (!node || !node.parentId) return false
  if (node.parentId === ancestorId) return true
  return isDescendant(node.parentId, ancestorId)
}

// Drag handlers
const handleDragStart = (event: DragStartEvent) => {
  setActiveId(event.active.id as string)
}

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  setActiveId(null)

  if (!over) return
  if (active.id === over.id) return

  const activeNodeId = active.id as string
  const overNodeId = over.id as string

  // Prevent dropping on descendant (would create circular reference)
  if (isDescendant(overNodeId, activeNodeId)) return

  // Update parent relationship
  const updated = flatNodes.map((n) =>
    n.id === activeNodeId ? { ...n, parentId: overNodeId } : n
  )

  // Recalculate levels
  const recalculateLevels = (nodes: FlatNode[]): FlatNode[] => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    return nodes.map(n => {
      let level = 0
      let current = n
      while (current.parentId) {
        level++
        const parent = nodeMap.get(current.parentId)
        if (!parent) break
        current = parent
      }
      return { ...n, level }
    })
  }

  onChange(buildTree(recalculateLevels(updated)))
}

// Wrap tree in DndContext (in return statement)
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={flatNodes.map((n) => n.id)}
    strategy={verticalListSortingStrategy}
  >
    <div className="org-tree">
      {flatNodes.map(renderNode)}
      {/* ... empty state ... */}
    </div>
  </SortableContext>

  <DragOverlay>
    {activeId ? (
      <div className="org-node drag-overlay">
        {/* Simplified node preview */}
        {(() => {
          const node = flatNodes.find((n) => n.id === activeId)
          return node ? (
            <div className="node-display">
              <div className="node-info">
                <div className="node-details">
                  <span className="node-name">{node.name}</span>
                  <span className="node-title">{node.title}</span>
                </div>
              </div>
            </div>
          ) : null
        })()}
      </div>
    ) : null}
  </DragOverlay>
</DndContext>
```

---

## Task 5: Create DraggableOrgNode Component

- **Type**: feature
- **Priority**: high
- **Dependencies**: Task 4
- **Estimated Complexity**: M
- **Description**: Extract node rendering into a sortable component with drag handle
- **Acceptance Criteria**:
  - [ ] Nodes are draggable via drag handle
  - [ ] Visual feedback during drag (opacity change)
  - [ ] Drop targets are highlighted
  - [ ] Drag is disabled when editing
  - [ ] Keyboard navigation works (Tab to handle, Space/Enter to pick up)
- **Technical Notes**:
  - Use `useSortable` hook from @dnd-kit/sortable
  - Add drag handle icon on left side
  - Apply transform styles during drag

### New Component Approach (refactor renderNode):

```typescript
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DraggableOrgNodeProps {
  node: FlatNode
  isEditing: boolean
  editForm: { name: string; title: string }
  onEdit: () => void
  onDelete: () => void
  onAddSubordinate: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditFormChange: (form: { name: string; title: string }) => void
}

function DraggableOrgNode({
  node,
  isEditing,
  editForm,
  onEdit,
  onDelete,
  onAddSubordinate,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
}: DraggableOrgNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    disabled: isEditing,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: `${node.level * 2}rem`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`org-node ${isDragging ? 'is-dragging' : ''}`}
    >
      {isEditing ? (
        // ... existing edit form JSX ...
      ) : (
        <div className="node-display">
          <div className="node-info">
            <button
              type="button"
              className="drag-handle"
              {...attributes}
              {...listeners}
              aria-label={`Drag ${node.name} to reposition`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
            </button>
            {node.level > 0 && <span className="node-connector" />}
            <div className="node-details">
              <span className="node-name">{node.name}</span>
              <span className="node-title">{node.title}</span>
            </div>
          </div>
          <div className="node-actions">
            {/* ... existing action buttons ... */}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Task 6: Add Drag-and-Drop CSS Styles

- **Type**: feature
- **Priority**: medium
- **Dependencies**: Task 5
- **Estimated Complexity**: S
- **Description**: Add CSS for drag states, handles, and visual feedback
- **Acceptance Criteria**:
  - [ ] Drag handle has hover state
  - [ ] Dragging node has reduced opacity
  - [ ] Drag overlay has shadow/elevation
  - [ ] Drop targets have highlight indication
  - [ ] Cursor changes appropriately
- **Technical Notes**:
  - Add styles to `OrgChartEditor.css`

### Add to `OrgChartEditor.css`:

```css
/* Drag handle */
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: grab;
  border-radius: 4px;
  transition: color 0.15s, background-color 0.15s;
  flex-shrink: 0;
}

.drag-handle:hover {
  color: #6b7280;
  background: #e5e7eb;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle:focus-visible {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

/* Dragging state */
.org-node.is-dragging {
  opacity: 0.5;
  border-color: #93c5fd;
  background: #eff6ff;
}

/* Drag overlay */
.org-node.drag-overlay {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
              0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border-color: #0d6efd;
  background: white;
  cursor: grabbing;
}

/* Drop target indicator */
.org-node.is-over {
  background: #dbeafe;
  border-color: #3b82f6;
}

/* Disable drag handle during edit */
.node-edit-form .drag-handle {
  display: none;
}
```

---

## Task 7: Add Unit Tests for Delete Confirmation

- **Type**: test
- **Priority**: medium
- **Dependencies**: Task 3
- **Estimated Complexity**: M
- **Description**: Write unit tests for DeleteConfirmationModal and delete flow
- **Acceptance Criteria**:
  - [ ] Test modal renders with correct props
  - [ ] Test modal shows child count warning when > 0
  - [ ] Test Cancel button calls onClose
  - [ ] Test Delete button calls onConfirm
  - [ ] Test Escape key closes modal
  - [ ] Test click outside closes modal
- **Technical Notes**:
  - Use `@testing-library/react` and `@testing-library/user-event`
  - Test file: `DeleteConfirmationModal.test.tsx`

---

## Task 8: Add Unit Tests for Drag-and-Drop

- **Type**: test
- **Priority**: medium
- **Dependencies**: Task 5
- **Estimated Complexity**: L
- **Description**: Write unit tests for drag-and-drop functionality
- **Acceptance Criteria**:
  - [ ] Test valid drop updates parent relationship
  - [ ] Test drop on self is rejected
  - [ ] Test drop on descendant is rejected
  - [ ] Test levels are recalculated after drop
  - [ ] Test keyboard navigation works
- **Technical Notes**:
  - Use `@dnd-kit` testing utilities
  - May need to mock sensors for keyboard tests
  - Test file: `OrgChartEditor.test.tsx`

---

## Task 9: Update OrgChartEditor Documentation

- **Type**: docs
- **Priority**: low
- **Dependencies**: Tasks 3, 5
- **Estimated Complexity**: S
- **Description**: Add inline documentation and update any existing docs
- **Acceptance Criteria**:
  - [ ] JSDoc comments on new functions
  - [ ] README updated if applicable
  - [ ] Accessibility notes documented
- **Technical Notes**:
  - Document keyboard shortcuts for drag-and-drop
  - Note screen reader announcements

---

## Implementation Order

```
Task 1 (S) ─────────────────────────────────────┐
                                                 │
Task 2 (M) ─────────┬──────────────────────────┐│
                    │                          ││
Task 3 (S) ─────────┘                          ││
                                               ││
Task 4 (L) ──────────┬─────────────────────────┤│
                     │                         ││
Task 5 (M) ──────────┘                         ││
                     │                         ││
Task 6 (S) ──────────┘                         ││
                                               ││
Task 7 (M) ────────────────────────────────────┤│
                                               ││
Task 8 (L) ────────────────────────────────────┤│
                                               ││
Task 9 (S) ────────────────────────────────────┴┘
```

**Recommended parallel execution**:
- Start Task 1 and Task 2 in parallel
- Task 3 follows Task 2
- Task 4 follows Task 1
- Tasks 5 and 6 follow Task 4
- Tasks 7 and 8 follow their respective features
- Task 9 is final documentation

**Total Estimated Effort**: 2-3 developer days

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| @dnd-kit incompatibility with React 19 | Low | High | Verified compatibility; fallback to native HTML5 DnD |
| Complex nested drag edge cases | Medium | Medium | Thorough testing of deep hierarchies |
| Accessibility regressions | Medium | High | Manual screen reader testing; WCAG audit |
| Performance with large org charts | Low | Medium | Virtualization can be added later if needed |

---

## Appendix: File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `apps/admin-web/package.json` | Modify | Add @dnd-kit dependencies |
| `apps/admin-web/src/components/settings/DeleteConfirmationModal.tsx` | Create | New modal component |
| `apps/admin-web/src/components/settings/DeleteConfirmationModal.css` | Create | Modal styles |
| `apps/admin-web/src/components/settings/OrgChartEditor.tsx` | Modify | Add DnD, modal integration |
| `apps/admin-web/src/components/settings/OrgChartEditor.css` | Modify | Add drag styles |
| `apps/admin-web/src/components/settings/DeleteConfirmationModal.test.tsx` | Create | Modal tests |
| `apps/admin-web/src/components/settings/OrgChartEditor.test.tsx` | Modify | Add DnD tests |
