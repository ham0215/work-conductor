output "bucket_name" {
  description = "Name of the Cloud Storage bucket"
  value       = google_storage_bucket.admin_web.name
}

output "bucket_url" {
  description = "URL of the Cloud Storage bucket"
  value       = google_storage_bucket.admin_web.url
}

output "cdn_ip_address" {
  description = "External IP address for the CDN"
  value       = google_compute_global_address.admin_web.address
}

output "http_url" {
  description = "HTTP URL for the Admin Web application"
  value       = "http://${google_compute_global_address.admin_web.address}"
}

output "backend_bucket_id" {
  description = "ID of the backend bucket"
  value       = google_compute_backend_bucket.admin_web.id
}
