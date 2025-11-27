import { useState, useRef } from 'react'
import type { CustomLabel } from '../../types/tenant'
import './CustomLabelEditor.css'

interface CustomLabelEditorProps {
  labels: CustomLabel[]
  onChange: (labels: CustomLabel[]) => void
}

const PRESET_COLORS = [
  '#dc3545',
  '#fd7e14',
  '#ffc107',
  '#28a745',
  '#20c997',
  '#17a2b8',
  '#0d6efd',
  '#6f42c1',
  '#e83e8c',
  '#6c757d',
]

export function CustomLabelEditor({ labels, onChange }: CustomLabelEditorProps) {
  const idCounterRef = useRef(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<CustomLabel>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newLabel, setNewLabel] = useState<Partial<CustomLabel>>({
    name: '',
    color: PRESET_COLORS[0],
    description: '',
  })

  const handleEdit = (label: CustomLabel) => {
    setEditingId(label.id)
    setEditForm({ ...label })
    setIsAdding(false)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name?.trim()) return
    const updated = labels.map((l) => (l.id === editingId ? { ...l, ...editForm } : l))
    onChange(updated)
    setEditingId(null)
    setEditForm({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = (id: string) => {
    onChange(labels.filter((l) => l.id !== id))
  }

  const handleStartAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setNewLabel({ name: '', color: PRESET_COLORS[0], description: '' })
  }

  const handleAddLabel = () => {
    if (!newLabel.name?.trim()) return
    idCounterRef.current += 1
    const id = `label-new-${idCounterRef.current}`
    onChange([
      ...labels,
      { id, name: newLabel.name, color: newLabel.color!, description: newLabel.description },
    ])
    setIsAdding(false)
    setNewLabel({ name: '', color: PRESET_COLORS[0], description: '' })
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewLabel({ name: '', color: PRESET_COLORS[0], description: '' })
  }

  return (
    <div className="custom-label-editor">
      <div className="editor-header">
        <h3>Custom Labels</h3>
        <p className="editor-description">
          Create and manage labels for organizing tasks and workflows.
        </p>
      </div>

      <div className="labels-list">
        {labels.map((label) => (
          <div key={label.id} className="label-item">
            {editingId === label.id ? (
              <div className="label-edit-form">
                <div className="form-row">
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Label name"
                    className="form-input"
                  />
                  <input
                    type="text"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="form-input description-input"
                  />
                </div>
                <div className="color-picker">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${editForm.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditForm({ ...editForm, color })}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleSaveEdit}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="label-display">
                <div className="label-info">
                  <span className="label-badge" style={{ backgroundColor: label.color }}>
                    {label.name}
                  </span>
                  {label.description && (
                    <span className="label-description">{label.description}</span>
                  )}
                </div>
                <div className="label-actions">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleEdit(label)}
                    title="Edit"
                    aria-label={`Edit label ${label.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-danger"
                    onClick={() => handleDelete(label.id)}
                    title="Delete"
                    aria-label={`Delete label ${label.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {labels.length === 0 && !isAdding && (
          <div className="empty-state">
            <p>No custom labels yet. Create your first label to get started.</p>
          </div>
        )}
      </div>

      {isAdding ? (
        <div className="add-label-form">
          <div className="form-row">
            <input
              type="text"
              value={newLabel.name || ''}
              onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
              placeholder="Label name"
              className="form-input"
              autoFocus
            />
            <input
              type="text"
              value={newLabel.description || ''}
              onChange={(e) => setNewLabel({ ...newLabel, description: e.target.value })}
              placeholder="Description (optional)"
              className="form-input description-input"
            />
          </div>
          <div className="color-picker">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-option ${newLabel.color === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewLabel({ ...newLabel, color })}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-sm btn-primary" onClick={handleAddLabel}>
              Add Label
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleCancelAdd}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-secondary add-button" onClick={handleStartAdd}>
          + Add Label
        </button>
      )}
    </div>
  )
}
