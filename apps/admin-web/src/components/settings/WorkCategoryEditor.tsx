import { useState, useRef } from 'react'
import type { WorkCategory } from '../../types/tenant'
import './WorkCategoryEditor.css'

interface WorkCategoryEditorProps {
  categories: WorkCategory[]
  onChange: (categories: WorkCategory[]) => void
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

export function WorkCategoryEditor({ categories, onChange }: WorkCategoryEditorProps) {
  const idCounterRef = useRef(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<WorkCategory>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState<Partial<WorkCategory>>({
    name: '',
    color: PRESET_COLORS[0],
    description: '',
    isActive: true,
  })

  const handleEdit = (category: WorkCategory) => {
    setEditingId(category.id)
    setEditForm({ ...category })
    setIsAdding(false)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name?.trim()) return
    const updated = categories.map((c) => (c.id === editingId ? { ...c, ...editForm } : c))
    onChange(updated)
    setEditingId(null)
    setEditForm({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = (id: string) => {
    onChange(categories.filter((c) => c.id !== id))
  }

  const handleToggleActive = (id: string) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    onChange(updated)
  }

  const handleStartAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setNewCategory({ name: '', color: PRESET_COLORS[0], description: '', isActive: true })
  }

  const handleAddCategory = () => {
    if (!newCategory.name?.trim()) return
    idCounterRef.current += 1
    const id = `category-new-${idCounterRef.current}`
    onChange([
      ...categories,
      {
        id,
        name: newCategory.name,
        color: newCategory.color!,
        description: newCategory.description,
        isActive: newCategory.isActive ?? true,
      },
    ])
    setIsAdding(false)
    setNewCategory({ name: '', color: PRESET_COLORS[0], description: '', isActive: true })
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewCategory({ name: '', color: PRESET_COLORS[0], description: '', isActive: true })
  }

  return (
    <div className="work-category-editor">
      <div className="editor-header">
        <h3>Work Categories</h3>
        <p className="editor-description">
          Define categories to classify work and track time allocation.
        </p>
      </div>

      <div className="categories-list">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-item ${!category.isActive ? 'inactive' : ''}`}
          >
            {editingId === category.id ? (
              <div className="category-edit-form">
                <div className="form-row">
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Category name"
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
              <div className="category-display">
                <div className="category-info">
                  <span className="category-color" style={{ backgroundColor: category.color }} />
                  <div className="category-details">
                    <span className="category-name">{category.name}</span>
                    {category.description && (
                      <span className="category-description">{category.description}</span>
                    )}
                  </div>
                  {!category.isActive && <span className="inactive-badge">Inactive</span>}
                </div>
                <div className="category-actions">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleToggleActive(category.id)}
                    title={category.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleEdit(category)}
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-danger"
                    onClick={() => handleDelete(category.id)}
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && !isAdding && (
          <div className="empty-state">
            <p>No work categories yet. Create your first category to start tracking time.</p>
          </div>
        )}
      </div>

      {isAdding ? (
        <div className="add-category-form">
          <div className="form-row">
            <input
              type="text"
              value={newCategory.name || ''}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Category name"
              className="form-input"
              autoFocus
            />
            <input
              type="text"
              value={newCategory.description || ''}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              placeholder="Description (optional)"
              className="form-input description-input"
            />
          </div>
          <div className="color-picker">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-option ${newCategory.color === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewCategory({ ...newCategory, color })}
              />
            ))}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCategory}>
              Add Category
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleCancelAdd}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-secondary add-button" onClick={handleStartAdd}>
          + Add Category
        </button>
      )}
    </div>
  )
}
