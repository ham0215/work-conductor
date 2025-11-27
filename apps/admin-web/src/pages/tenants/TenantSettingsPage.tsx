import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Tenant, CustomLabel, WorkCategory, OrgNode } from '../../types/tenant'
import { CustomLabelEditor } from '../../components/settings/CustomLabelEditor'
import { WorkCategoryEditor } from '../../components/settings/WorkCategoryEditor'
import { OrgChartEditor } from '../../components/settings/OrgChartEditor'
import '../../components/PageHeader.css'
import './TenantSettingsPage.css'

type SettingsTab = 'labels' | 'categories' | 'orgchart'

// Mock data - will be replaced with API calls
const mockTenant: Tenant = {
  id: '1',
  name: 'Acme Corporation',
  slug: 'acme-corp',
  status: 'active',
  plan: 'Professional',
  userCount: 45,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-11-20T14:22:00Z',
}

const mockLabels: CustomLabel[] = [
  { id: '1', name: 'Urgent', color: '#dc3545', description: 'High priority tasks' },
  { id: '2', name: 'In Progress', color: '#ffc107', description: 'Currently being worked on' },
  { id: '3', name: 'Review', color: '#17a2b8', description: 'Needs review' },
  { id: '4', name: 'Done', color: '#28a745', description: 'Completed tasks' },
]

const mockCategories: WorkCategory[] = [
  {
    id: '1',
    name: 'Development',
    description: 'Software development tasks',
    color: '#6f42c1',
    isActive: true,
  },
  { id: '2', name: 'Design', description: 'UI/UX design work', color: '#e83e8c', isActive: true },
  { id: '3', name: 'Meeting', description: 'Meetings and calls', color: '#20c997', isActive: true },
  {
    id: '4',
    name: 'Research',
    description: 'Research and learning',
    color: '#fd7e14',
    isActive: false,
  },
]

const mockOrgChart: OrgNode[] = [
  {
    id: '1',
    name: 'John Smith',
    title: 'CEO',
    parentId: null,
    children: [
      {
        id: '2',
        name: 'Jane Doe',
        title: 'CTO',
        parentId: '1',
        children: [
          { id: '4', name: 'Bob Wilson', title: 'Lead Developer', parentId: '2' },
          { id: '5', name: 'Alice Brown', title: 'Senior Developer', parentId: '2' },
        ],
      },
      {
        id: '3',
        name: 'Mike Johnson',
        title: 'CFO',
        parentId: '1',
        children: [{ id: '6', name: 'Sarah Davis', title: 'Accountant', parentId: '3' }],
      },
    ],
  },
]

export function TenantSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [labels, setLabels] = useState<CustomLabel[]>([])
  const [categories, setCategories] = useState<WorkCategory[]>([])
  const [orgChart, setOrgChart] = useState<OrgNode[]>([])
  const [activeTab, setActiveTab] = useState<SettingsTab>('labels')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      if (id === '1' || id === 'acme-corp') {
        setTenant(mockTenant)
        setLabels(mockLabels)
        setCategories(mockCategories)
        setOrgChart(mockOrgChart)
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleLabelsChange = (newLabels: CustomLabel[]) => {
    setLabels(newLabels)
  }

  const handleCategoriesChange = (newCategories: WorkCategory[]) => {
    setCategories(newCategories)
  }

  const handleOrgChartChange = (newOrgChart: OrgNode[]) => {
    setOrgChart(newOrgChart)
  }

  if (loading) {
    return (
      <div className="tenant-settings loading">
        <div className="loading-spinner" />
        <p>Loading settings...</p>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="tenant-settings not-found">
        <h2>Tenant Not Found</h2>
        <p>The tenant you are looking for does not exist.</p>
        <Link to="/tenants/list" className="btn btn-primary">
          Back to Tenant List
        </Link>
      </div>
    )
  }

  return (
    <div className="tenant-settings">
      <div className="page-header">
        <div className="header-with-breadcrumb">
          <Link to="/tenants/list" className="breadcrumb-link">
            Tenants
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{tenant.name}</span>
        </div>
        <h2>Tenant Settings</h2>
        <p className="page-description">Manage settings for {tenant.name}</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'labels' ? 'active' : ''}`}
          onClick={() => setActiveTab('labels')}
        >
          Custom Labels
        </button>
        <button
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Work Categories
        </button>
        <button
          className={`tab-button ${activeTab === 'orgchart' ? 'active' : ''}`}
          onClick={() => setActiveTab('orgchart')}
        >
          Organization Chart
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'labels' && (
          <CustomLabelEditor labels={labels} onChange={handleLabelsChange} />
        )}
        {activeTab === 'categories' && (
          <WorkCategoryEditor categories={categories} onChange={handleCategoriesChange} />
        )}
        {activeTab === 'orgchart' && (
          <OrgChartEditor nodes={orgChart} onChange={handleOrgChartChange} />
        )}
      </div>
    </div>
  )
}
