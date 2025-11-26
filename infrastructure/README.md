# Infrastructure

This directory contains the Infrastructure as Code (IaC) configuration for Work Conductor.

## Directory Structure

```
infrastructure/
├── terraform/
│   └── modules/
│       └── admin-web/     # Admin Web hosting module (Cloud Storage + CDN)
└── environments/
    └── dev/               # Development environment configuration
```

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- GCP Project with billing enabled

## Modules

### admin-web

Static hosting infrastructure for the Admin Web application using:
- **Cloud Storage**: Bucket for hosting static files
- **Cloud CDN**: Content delivery with caching
- **Load Balancer**: HTTP(S) load balancing

## Getting Started

### 1. Authenticate with GCP

```bash
gcloud auth application-default login
```

### 2. Initialize Terraform

```bash
cd environments/dev
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project settings
terraform init
```

### 3. Plan and Apply

```bash
terraform plan
terraform apply
```

## Environment-Specific Configuration

Each environment (dev, staging, prod) has its own directory under `environments/`.
Copy `terraform.tfvars.example` to `terraform.tfvars` and configure appropriately.

### Required Variables

| Variable | Description |
|----------|-------------|
| `project_id` | GCP Project ID |
| `region` | GCP Region (default: asia-northeast1) |

## CI/CD Integration

The infrastructure supports automated deployments via GitHub Actions:
- Workload Identity Federation for secure authentication
- Service account with minimal required permissions

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity Provider resource name |
| `GCP_SERVICE_ACCOUNT` | Service account email for deployments |

### Required GitHub Variables

| Variable | Description |
|----------|-------------|
| `GCS_BUCKET_NAME` | Cloud Storage bucket name for the environment |
| `VITE_API_BASE_URL` | Backend API URL |
