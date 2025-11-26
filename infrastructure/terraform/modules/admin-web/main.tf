# Cloud Storage bucket for Admin Web static hosting
resource "google_storage_bucket" "admin_web" {
  name          = "${var.project_id}-admin-web-${var.environment}"
  location      = var.region
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html" # SPA fallback
  }

  cors {
    origin          = var.cors_origins
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["Content-Type", "Cache-Control"]
    max_age_seconds = 3600
  }

  versioning {
    enabled = var.environment == "prod"
  }

  dynamic "lifecycle_rule" {
    for_each = var.environment == "prod" ? [1] : []
    content {
      condition {
        num_newer_versions = 5
      }
      action {
        type = "Delete"
      }
    }
  }

  labels = {
    app         = "admin-web"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Make bucket publicly readable
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.admin_web.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Reserve external IP for load balancer
resource "google_compute_global_address" "admin_web" {
  name = "admin-web-${var.environment}-ip"
}

# Backend bucket for CDN
resource "google_compute_backend_bucket" "admin_web" {
  name        = "admin-web-${var.environment}-backend"
  bucket_name = google_storage_bucket.admin_web.name
  enable_cdn  = true

  cdn_policy {
    cache_mode       = "CACHE_ALL_STATIC"
    default_ttl      = 3600  # 1 hour
    max_ttl          = 86400 # 24 hours
    client_ttl       = 3600  # 1 hour
    negative_caching = true
  }
}

# URL map for routing
resource "google_compute_url_map" "admin_web" {
  name            = "admin-web-${var.environment}-url-map"
  default_service = google_compute_backend_bucket.admin_web.id
}

# HTTP proxy (redirects to HTTPS in production)
resource "google_compute_target_http_proxy" "admin_web" {
  name    = "admin-web-${var.environment}-http-proxy"
  url_map = var.environment == "prod" ? google_compute_url_map.https_redirect[0].id : google_compute_url_map.admin_web.id
}

# HTTPS redirect URL map (production only)
resource "google_compute_url_map" "https_redirect" {
  count = var.environment == "prod" ? 1 : 0
  name  = "admin-web-${var.environment}-https-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

# HTTPS proxy (production only)
resource "google_compute_target_https_proxy" "admin_web" {
  count   = var.environment == "prod" && var.ssl_certificate != null ? 1 : 0
  name    = "admin-web-${var.environment}-https-proxy"
  url_map = google_compute_url_map.admin_web.id

  ssl_certificates = [var.ssl_certificate]
}

# HTTP forwarding rule
resource "google_compute_global_forwarding_rule" "admin_web_http" {
  name       = "admin-web-${var.environment}-http-rule"
  target     = google_compute_target_http_proxy.admin_web.id
  port_range = "80"
  ip_address = google_compute_global_address.admin_web.address
}

# HTTPS forwarding rule (production only)
resource "google_compute_global_forwarding_rule" "admin_web_https" {
  count      = var.environment == "prod" && var.ssl_certificate != null ? 1 : 0
  name       = "admin-web-${var.environment}-https-rule"
  target     = google_compute_target_https_proxy.admin_web[0].id
  port_range = "443"
  ip_address = google_compute_global_address.admin_web.address
}
