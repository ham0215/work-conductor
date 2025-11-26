terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure when ready to use remote state
  # backend "gcs" {
  #   bucket = "work-conductor-terraform-state"
  #   prefix = "dev"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "admin_web" {
  source = "../../terraform/modules/admin-web"

  project_id   = var.project_id
  region       = var.region
  environment  = "dev"
  cors_origins = ["*"] # Allow all origins in dev
}

output "admin_web_bucket_name" {
  value = module.admin_web.bucket_name
}

output "admin_web_cdn_ip" {
  value = module.admin_web.cdn_ip_address
}

output "admin_web_url" {
  value = module.admin_web.http_url
}
