# Work Conductor

A next-generation productivity application designed to replace traditional chat-based work tools. By integrating AI-powered communication, task management, and time tracking into a unified experience, it aims to maximize focused work time while maintaining seamless team collaboration.

## Vision

Transform how knowledge workers interact with their tools by shifting from passive chat monitoring to proactive, AI-assisted work orchestration.

## Core Features

- **AI-Powered Communication Hub**: Tweet-style work updates with AI-interpreted notifications
- **Task Management**: Streamlined todo system with status workflow
- **Time Tracking**: Intelligent tracking integrated with calendar and organizational data

## Technology Stack

| Component | Technology | Language/Framework |
|-----------|------------|-------------------|
| Desktop App | Tauri | Rust + TypeScript (React) |
| Admin Web App | SPA | TypeScript (React) |
| Backend API | Cloud Run | Go |
| Infrastructure | GCP | Terraform |

## Directory Structure

```
work-conductor/
├── apps/                    # Application packages
│   ├── desktop/             # Tauri desktop application (macOS)
│   └── admin-web/           # Admin web application (React SPA)
├── packages/                # Shared packages
│   ├── api/                 # Backend API service (Go)
│   └── shared/              # Shared types and utilities
├── infrastructure/          # Infrastructure configuration
│   ├── terraform/           # Terraform modules
│   └── environments/        # Environment-specific configurations
├── docs/                    # Documentation
│   ├── init/                # Initial brainstorming documents
│   └── requirements/        # Product requirements
└── .github/                 # GitHub configurations
```

## Getting Started

### Prerequisites

- Node.js (managed via mise)
- Rust (for Tauri desktop app)
- Go (for backend API)
- Terraform (for infrastructure)

### Development

Documentation for development setup will be added as the project progresses.

## Documentation

- [Product Requirements Document (PRD)](docs/requirements/PRD.md)

## License

TBD
