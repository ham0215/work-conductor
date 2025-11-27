import { useState } from 'react'
import type { TenantFormData } from '../types/tenant'
import './TenantForm.css'

interface TenantFormProps {
  initialData?: TenantFormData
  onSubmit: (data: TenantFormData) => Promise<void>
  onCancel: () => void
  submitLabel: string
  isSubmitting?: boolean
}

interface FormErrors {
  name?: string
  slug?: string
  plan?: string
}

const PLANS = ['Starter', 'Professional', 'Enterprise']

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function validateForm(data: TenantFormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.name.trim()) {
    errors.name = 'Name is required'
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (data.name.length > 100) {
    errors.name = 'Name must be less than 100 characters'
  }

  if (!data.slug.trim()) {
    errors.slug = 'Slug is required'
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
  } else if (data.slug.length < 2) {
    errors.slug = 'Slug must be at least 2 characters'
  } else if (data.slug.length > 50) {
    errors.slug = 'Slug must be less than 50 characters'
  }

  if (!data.plan) {
    errors.plan = 'Plan is required'
  }

  return errors
}

export function TenantForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting = false,
}: TenantFormProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    plan: initialData?.plan ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'slug') {
      setSlugManuallyEdited(true)
      setFormData((prev) => ({
        ...prev,
        slug: value,
      }))
    } else if (name === 'name') {
      // Auto-generate slug from name if slug hasn't been manually edited
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: slugManuallyEdited ? prev.slug : generateSlug(value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Validate on blur
    const validationErrors = validateForm(formData)
    if (validationErrors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name as keyof FormErrors],
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm(formData)
    setErrors(validationErrors)
    setTouched({ name: true, slug: true, plan: true })

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    await onSubmit(formData)
  }

  const showError = (field: keyof FormErrors) => touched[field] && errors[field]

  return (
    <form className="tenant-form" onSubmit={handleSubmit}>
      <div className="form-card">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Tenant Name<span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${showError('name') ? 'error' : ''}`}
            placeholder="Enter tenant name"
            disabled={isSubmitting}
          />
          {showError('name') && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="slug" className="form-label">
            Slug<span className="required">*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${showError('slug') ? 'error' : ''}`}
            placeholder="tenant-slug"
            disabled={isSubmitting}
          />
          <div className="form-hint">
            URL-friendly identifier. Auto-generated from name if not manually edited.
          </div>
          {showError('slug') && <div className="form-error">{errors.slug}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="plan" className="form-label">
            Plan<span className="required">*</span>
          </label>
          <select
            id="plan"
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-select ${showError('plan') ? 'error' : ''}`}
            disabled={isSubmitting}
          >
            <option value="">Select a plan</option>
            {PLANS.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
          {showError('plan') && <div className="form-error">{errors.plan}</div>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
