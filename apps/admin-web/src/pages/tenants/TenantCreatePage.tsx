import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TenantForm } from '../../components/TenantForm'
import type { TenantFormData } from '../../types/tenant'
import '../../components/PageHeader.css'

export function TenantCreatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: TenantFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Creating tenant:', data)
      // In a real app, this would be an API call
      navigate('/tenants/list')
    } catch (error) {
      console.error('Failed to create tenant:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/tenants/list')
  }

  return (
    <div className="tenant-create-page">
      <div className="page-header">
        <h2>Create Tenant</h2>
        <p className="page-description">Add a new tenant organization</p>
      </div>

      <TenantForm onSubmit={handleSubmit} onCancel={handleCancel} submitLabel="Create Tenant" isSubmitting={isSubmitting} />
    </div>
  )
}
