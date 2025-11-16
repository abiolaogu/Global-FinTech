terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }

  backend "gcs" {
    bucket = "atlasx-terraform-state"
    prefix = "production/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# GKE Cluster
resource "google_container_cluster" "atlasx_cluster" {
  name     = "atlasx-${var.environment}"
  location = var.region

  # We can't create a cluster with no node pool, so we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  # Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Release channel for automatic updates
  release_channel {
    channel = "STABLE"
  }

  # Logging and monitoring
  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS"]
    managed_prometheus {
      enabled = true
    }
  }

  # Network policy
  network_policy {
    enabled = true
  }

  # Binary authorization
  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }

  # Maintenance window
  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }

  # Addons
  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    network_policy_config {
      disabled = false
    }
  }
}

# Primary node pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-pool"
  location   = var.region
  cluster    = google_container_cluster.atlasx_cluster.name
  node_count = var.min_node_count

  autoscaling {
    min_node_count = var.min_node_count
    max_node_count = var.max_node_count
  }

  node_config {
    preemptible  = false
    machine_type = "n2-standard-4"

    disk_size_gb = 100
    disk_type    = "pd-standard"

    # Google recommends custom service accounts with minimal permissions
    service_account = google_service_account.gke_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      env     = var.environment
      project = "atlasx"
    }

    tags = ["atlasx", var.environment]

    metadata = {
      disable-legacy-endpoints = "true"
    }

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}

# VPC
resource "google_compute_network" "vpc" {
  name                    = "atlasx-vpc-${var.environment}"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "atlasx-subnet-${var.environment}"
  ip_cidr_range = "10.10.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc.name

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.20.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.30.0.0/16"
  }
}

# Cloud SQL PostgreSQL instance
resource "google_sql_database_instance" "postgres" {
  name             = "atlasx-postgres-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-custom-4-16384" # 4 vCPU, 16GB RAM
    availability_type = "REGIONAL"          # High availability
    disk_type         = "PD_SSD"
    disk_size         = 100
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    database_flags {
      name  = "max_connections"
      value = "200"
    }

    database_flags {
      name  = "shared_buffers"
      value = "4194304" # 4GB in 8KB pages
    }

    maintenance_window {
      day          = 7 # Sunday
      hour         = 3
      update_track = "stable"
    }
  }

  deletion_protection = true
}

resource "google_sql_database" "atlasx_db" {
  name     = "atlasx"
  instance = google_sql_database_instance.postgres.name
}

# Cloud Memorystore for Redis
resource "google_redis_instance" "redis" {
  name           = "atlasx-redis-${var.environment}"
  tier           = "STANDARD_HA"
  memory_size_gb = 5

  location_id             = "${var.region}-a"
  alternative_location_id = "${var.region}-b"

  redis_version     = "REDIS_7_0"
  display_name      = "AtlasX Redis ${var.environment}"
  reserved_ip_range = "10.40.0.0/29"

  authorized_network = google_compute_network.vpc.id

  redis_configs = {
    maxmemory-policy = "allkeys-lru"
  }

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 3
        minutes = 0
      }
    }
  }
}

# Service account for GKE nodes
resource "google_service_account" "gke_sa" {
  account_id   = "gke-atlasx-${var.environment}"
  display_name = "Service Account for GKE nodes"
}

# IAM bindings
resource "google_project_iam_member" "gke_sa_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer",
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.gke_sa.email}"
}

# Outputs
output "cluster_endpoint" {
  value       = google_container_cluster.atlasx_cluster.endpoint
  description = "GKE cluster endpoint"
  sensitive   = true
}

output "cluster_ca_certificate" {
  value       = google_container_cluster.atlasx_cluster.master_auth[0].cluster_ca_certificate
  description = "GKE cluster CA certificate"
  sensitive   = true
}

output "postgres_connection_name" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "PostgreSQL connection name"
}

output "redis_host" {
  value       = google_redis_instance.redis.host
  description = "Redis host"
}
