import { useState, useRef, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { OrgNode } from '../../types/tenant'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import './OrgChartEditor.css'

interface OrgChartEditorProps {
  nodes: OrgNode[]
  onChange: (nodes: OrgNode[]) => void
}

interface FlatNode extends Omit<OrgNode, 'children'> {
  level: number
}

// Maximum input length for security (SEC-M2)
const MAX_NAME_LENGTH = 100
const MAX_TITLE_LENGTH = 100

function flattenNodes(nodes: OrgNode[], level = 0): FlatNode[] {
  return nodes.flatMap((node) => {
    const flat: FlatNode = {
      id: node.id,
      name: node.name,
      title: node.title,
      parentId: node.parentId,
      level,
    }
    return [flat, ...(node.children ? flattenNodes(node.children, level + 1) : [])]
  })
}

function buildTree(flatNodes: FlatNode[]): OrgNode[] {
  const nodeMap = new Map<string, OrgNode>()
  flatNodes.forEach((n) => {
    nodeMap.set(n.id, { id: n.id, name: n.name, title: n.title, parentId: n.parentId })
  })

  const roots: OrgNode[] = []
  flatNodes.forEach((n) => {
    const node = nodeMap.get(n.id)!
    if (n.parentId === null) {
      roots.push(node)
    } else {
      const parent = nodeMap.get(n.parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(node)
      } else {
        // Orphaned node: treat as root to prevent data loss
        roots.push(node)
      }
    }
  })

  return roots
}

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    disabled: isEditing,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${node.level * 2}rem`,
  }

  return (
    <div ref={setNodeRef} style={style} className={`org-node ${isDragging ? 'is-dragging' : ''}`}>
      {isEditing ? (
        <div className="node-edit-form">
          <div className="form-row">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
              placeholder="Name"
              className="form-input"
              maxLength={MAX_NAME_LENGTH}
            />
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => onEditFormChange({ ...editForm, title: e.target.value })}
              placeholder="Title"
              className="form-input"
              maxLength={MAX_TITLE_LENGTH}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-sm btn-primary" onClick={onSaveEdit}>
              Save
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={onCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
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
            <button
              type="button"
              className="btn-icon"
              onClick={onAddSubordinate}
              title="Add subordinate"
              aria-label={`Add subordinate to ${node.name}`}
            >
              + Add
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={onEdit}
              title="Edit"
              aria-label={`Edit ${node.name}`}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn-icon btn-danger"
              onClick={onDelete}
              title="Delete"
              aria-label={`Delete ${node.name}`}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function OrgChartEditor({ nodes, onChange }: OrgChartEditorProps) {
  const idCounterRef = useRef(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; title: string }>({ name: '', title: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newNode, setNewNode] = useState<{ name: string; title: string; parentId: string | null }>({
    name: '',
    title: '',
    parentId: null,
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    node: FlatNode
    childCount: number
  } | null>(null)

  const flatNodes = useMemo(() => flattenNodes(nodes), [nodes])

  // Drag-and-drop sensors with accessibility support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts to prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  /**
   * Checks if nodeId has ancestorId as an ancestor in the tree.
   * Used to prevent dropping a node onto its own descendant (circular reference).
   * @param nodeId - The node to check
   * @param ancestorId - The potential ancestor
   * @param depth - Current recursion depth (max 100 for safety - SEC-L1)
   */
  const hasAncestor = (nodeId: string, ancestorId: string, depth = 0): boolean => {
    if (depth > 100) return true // Assume has ancestor to be safe
    const node = flatNodes.find((n) => n.id === nodeId)
    if (!node || !node.parentId) return false
    if (node.parentId === ancestorId) return true
    return hasAncestor(node.parentId, ancestorId, depth + 1)
  }

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

    // SEC-M1: Validate target node exists
    if (!flatNodes.some((n) => n.id === overNodeId)) return

    // Prevent dropping on descendant (would create circular reference)
    if (hasAncestor(overNodeId, activeNodeId)) return

    // Update parent relationship
    const updated = flatNodes.map((n) =>
      n.id === activeNodeId ? { ...n, parentId: overNodeId } : n
    )

    // Recalculate levels after parent change
    // SEC-L1: Added depth limit to prevent infinite loop from circular references
    const recalculateLevels = (nodeList: FlatNode[]): FlatNode[] => {
      const nodeMap = new Map(nodeList.map((n) => [n.id, n]))
      const maxDepth = 100
      return nodeList.map((n) => {
        let level = 0
        let current = n
        const visited = new Set<string>()
        while (current.parentId && level < maxDepth) {
          if (visited.has(current.id)) break // Circular reference detected
          visited.add(current.id)
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

  const handleEdit = (node: FlatNode) => {
    setEditingId(node.id)
    setEditForm({ name: node.name, title: node.title })
    setIsAdding(false)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name.trim() || !editForm.title.trim()) return
    const updated = flatNodes.map((n) =>
      n.id === editingId ? { ...n, name: editForm.name.trim(), title: editForm.title.trim() } : n
    )
    onChange(buildTree(updated))
    setEditingId(null)
    setEditForm({ name: '', title: '' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', title: '' })
  }

  const handleDeleteRequest = (id: string) => {
    const node = flatNodes.find((n) => n.id === id)
    if (!node) return

    // Count descendants
    let childCount = 0
    const countChildren = (nodeId: string) => {
      flatNodes
        .filter((n) => n.parentId === nodeId)
        .forEach((child) => {
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

  const handleStartAdd = (parentId: string | null = null) => {
    setIsAdding(true)
    setEditingId(null)
    setNewNode({ name: '', title: '', parentId })
  }

  const handleAddNode = () => {
    if (!newNode.name.trim() || !newNode.title.trim()) return
    idCounterRef.current += 1
    const id = `node-new-${idCounterRef.current}`
    let newLevel = 0
    if (newNode.parentId) {
      const parentNode = flatNodes.find((n) => n.id === newNode.parentId)
      if (parentNode) newLevel = parentNode.level + 1
    }
    const updated: FlatNode[] = [
      ...flatNodes,
      {
        id,
        name: newNode.name.trim(),
        title: newNode.title.trim(),
        parentId: newNode.parentId,
        level: newLevel,
      },
    ]
    onChange(buildTree(updated))
    setIsAdding(false)
    setNewNode({ name: '', title: '', parentId: null })
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewNode({ name: '', title: '', parentId: null })
  }

  const activeNode = activeId ? flatNodes.find((n) => n.id === activeId) : null

  return (
    <div className="org-chart-editor">
      <div className="editor-header">
        <h3>Organization Chart</h3>
        <p className="editor-description">
          Define your organization structure and reporting relationships. Drag nodes to reposition
          them.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={flatNodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          <div className="org-tree">
            {flatNodes.map((node) => (
              <DraggableOrgNode
                key={node.id}
                node={node}
                isEditing={editingId === node.id}
                editForm={editForm}
                onEdit={() => handleEdit(node)}
                onDelete={() => handleDeleteRequest(node.id)}
                onAddSubordinate={() => handleStartAdd(node.id)}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditFormChange={setEditForm}
              />
            ))}

            {flatNodes.length === 0 && !isAdding && (
              <div className="empty-state">
                <p>No organization chart yet. Add your first team member to get started.</p>
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeNode ? (
            <div className="org-node drag-overlay">
              <div className="node-display">
                <div className="node-info">
                  <div className="node-details">
                    <span className="node-name">{activeNode.name}</span>
                    <span className="node-title">{activeNode.title}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isAdding ? (
        <div className="add-node-form">
          <div className="form-row">
            <input
              type="text"
              value={newNode.name}
              onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
              placeholder="Name"
              className="form-input"
              maxLength={MAX_NAME_LENGTH}
              autoFocus
            />
            <input
              type="text"
              value={newNode.title}
              onChange={(e) => setNewNode({ ...newNode, title: e.target.value })}
              placeholder="Title / Position"
              className="form-input"
              maxLength={MAX_TITLE_LENGTH}
            />
          </div>
          <div className="form-row">
            <select
              value={newNode.parentId || ''}
              onChange={(e) => setNewNode({ ...newNode, parentId: e.target.value || null })}
              className="form-select"
            >
              <option value="">No manager (top level)</option>
              {flatNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} - {n.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-sm btn-primary" onClick={handleAddNode}>
              Add Member
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleCancelAdd}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-secondary add-button"
          onClick={() => handleStartAdd(null)}
        >
          + Add Member
        </button>
      )}

      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        nodeName={deleteTarget?.node.name ?? ''}
        nodeTitle={deleteTarget?.node.title ?? ''}
        childCount={deleteTarget?.childCount ?? 0}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
