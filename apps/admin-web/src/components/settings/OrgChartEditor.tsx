import { useState, useRef } from 'react'
import type { OrgNode } from '../../types/tenant'
import './OrgChartEditor.css'

interface OrgChartEditorProps {
  nodes: OrgNode[]
  onChange: (nodes: OrgNode[]) => void
}

interface FlatNode extends Omit<OrgNode, 'children'> {
  level: number
}

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
      }
    }
  })

  return roots
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

  const flatNodes = flattenNodes(nodes)

  const handleEdit = (node: FlatNode) => {
    setEditingId(node.id)
    setEditForm({ name: node.name, title: node.title })
    setIsAdding(false)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name.trim() || !editForm.title.trim()) return
    const updated = flatNodes.map((n) =>
      n.id === editingId ? { ...n, name: editForm.name, title: editForm.title } : n
    )
    onChange(buildTree(updated))
    setEditingId(null)
    setEditForm({ name: '', title: '' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', title: '' })
  }

  const handleDelete = (id: string) => {
    const toDelete = new Set<string>()
    const collectChildren = (nodeId: string) => {
      toDelete.add(nodeId)
      flatNodes.filter((n) => n.parentId === nodeId).forEach((child) => collectChildren(child.id))
    }
    collectChildren(id)

    const updated = flatNodes.filter((n) => !toDelete.has(n.id))
    onChange(buildTree(updated))
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
    const updated: FlatNode[] = [
      ...flatNodes,
      { id, name: newNode.name, title: newNode.title, parentId: newNode.parentId, level: 0 },
    ]
    onChange(buildTree(updated))
    setIsAdding(false)
    setNewNode({ name: '', title: '', parentId: null })
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewNode({ name: '', title: '', parentId: null })
  }

  const renderNode = (node: FlatNode) => {
    const isEditing = editingId === node.id

    return (
      <div key={node.id} className="org-node" style={{ marginLeft: `${node.level * 2}rem` }}>
        {isEditing ? (
          <div className="node-edit-form">
            <div className="form-row">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Name"
                className="form-input"
              />
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Title"
                className="form-input"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-sm btn-primary" onClick={handleSaveEdit}>
                Save
              </button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="node-display">
            <div className="node-info">
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
                onClick={() => handleStartAdd(node.id)}
                title="Add subordinate"
              >
                + Add
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => handleEdit(node)}
                title="Edit"
              >
                Edit
              </button>
              <button
                type="button"
                className="btn-icon btn-danger"
                onClick={() => handleDelete(node.id)}
                title="Delete"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="org-chart-editor">
      <div className="editor-header">
        <h3>Organization Chart</h3>
        <p className="editor-description">
          Define your organization structure and reporting relationships.
        </p>
      </div>

      <div className="org-tree">
        {flatNodes.map(renderNode)}

        {flatNodes.length === 0 && !isAdding && (
          <div className="empty-state">
            <p>No organization chart yet. Add your first team member to get started.</p>
          </div>
        )}
      </div>

      {isAdding ? (
        <div className="add-node-form">
          <div className="form-row">
            <input
              type="text"
              value={newNode.name}
              onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
              placeholder="Name"
              className="form-input"
              autoFocus
            />
            <input
              type="text"
              value={newNode.title}
              onChange={(e) => setNewNode({ ...newNode, title: e.target.value })}
              placeholder="Title / Position"
              className="form-input"
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
    </div>
  )
}
