# Work Conductor - Product Requirements Document (PRD)

## Product Overview

**Work Conductor** is a next-generation productivity application designed to replace traditional chat-based work tools. By integrating AI-powered communication, task management, and time tracking into a unified experience, it aims to maximize focused work time while maintaining seamless team collaboration.

### Vision

Transform how knowledge workers interact with their tools by shifting from passive chat monitoring to proactive, AI-assisted work orchestration.

### Target Platform

- **Primary Application**: macOS Desktop App (built with Tauri)
- **Admin Console**: Web Application

---

## Core Features

### 1. AI-Powered Communication Hub

Replace traditional chat tools with an intelligent communication layer.

#### Key Capabilities

- **Tweet-style Work Updates**: Post work updates similar to social media, allowing natural sharing of progress
- **AI-Interpreted Notifications**: AI analyzes content and automatically determines notification recipients without explicit tagging
- **Content-based Message Grouping**: Messages are automatically organized by topic/project, with manual override option
- **Seamless AI Chat**: Converse with AI assistants in the same interface as posting updates
- **Subscription-based Content View**: Replace manual channel checking with curated content streams
- **Card-stacked Window System**: Multiple windows displayed as stacked cards for efficient workspace management

### 2. Task Management

A streamlined todo system integrated with the communication layer.

#### Features

- **Status Management**: Three-state workflow (Todo, In Progress, Done)
- **Task Data Fields**:
  - Task title (required)
  - Description (multi-line text)
  - Due date (optional)
  - Labels (custom labels can be created per tenant)
- **List View**: Tasks sorted by due date with filtering options

### 3. Time Tracking

Intelligent time tracking integrated with calendar and organizational data.

#### Features

- **Attendance Recording**: Start and end of work day tracking
- **Calendar Integration**: Google Calendar integration (primary)
- **Smart Time Classification**: Time not scheduled in calendar is classified as "main work" time
- **Work Assignment Tracking**:
  - Master data management for work assignments
  - 30-minute increment time allocation
  - Organization chart linkage

---

## Technical Architecture

### Application Stack

| Component | Technology |
|-----------|------------|
| Desktop App | Tauri (Rust + Web Frontend) |
| Admin Web App | Web Application (SPA) |
| Backend | GCP-based serverless architecture |
| Infrastructure as Code | Terraform |

### Multi-tenancy

- Full multi-tenant architecture supporting organization isolation
- Tenant-level configuration for labels, work assignments, and organization charts

### Authentication

- **Primary Method**: Google OAuth 2.0 (Google Login)
- Supports organizational Google Workspace accounts

### AI Integration

Users provide their own API keys for AI features:

| Provider | Support Status |
|----------|---------------|
| OpenAI | Supported |
| Anthropic Claude | Supported |
| Google Gemini | Supported |

API keys are stored securely and encrypted per-user.

---

## Infrastructure (GCP)

### MVP Architecture (Cost-Optimized)

Designed to minimize infrastructure costs during the MVP phase while maintaining scalability path.

#### Core Services

| Service | GCP Component | Notes |
|---------|--------------|-------|
| Authentication | Firebase Authentication | Free tier for Google Sign-in |
| Database | Firestore | Free tier: 1GB storage, 50K reads/day |
| Backend API | Cloud Run | Pay-per-use, scale to zero |
| Static Hosting | Cloud Storage + CDN | Minimal cost for static assets |
| File Storage | Cloud Storage | Standard tier |

#### Infrastructure as Code

All infrastructure managed via Terraform:
- Environment separation (dev, staging, prod)
- Version-controlled configuration
- Automated deployment pipelines

---

## MVP Scope

### Phase 1: Foundation

1. **Authentication**
   - Google OAuth login
   - Multi-tenant user management

2. **Basic Task Management**
   - Create, edit, delete tasks
   - Status transitions
   - Due date and label management
   - List view with sorting

3. **Time Tracking Basics**
   - Manual attendance recording
   - Google Calendar sync
   - Basic time categorization

### Phase 2: Communication Layer

1. **Update Posting**
   - Tweet-style updates
   - Manual notification targeting

2. **AI Chat Integration**
   - Basic AI conversation (using user's API keys)
   - Context-aware responses

### Phase 3: Intelligence

1. **AI-Powered Features**
   - Automatic notification routing
   - Content-based message grouping
   - Smart time classification

---

## Non-Functional Requirements

### Performance

- Desktop app startup: < 3 seconds
- API response time: < 500ms (p95)
- Real-time sync latency: < 2 seconds

### Security

- End-to-end encryption for sensitive data
- API keys encrypted at rest
- SOC 2 compliance path
- GDPR considerations for EU users

### Scalability

- Support 1000+ users per tenant
- Horizontal scaling via GCP

### Availability

- 99.5% uptime SLA (MVP phase)
- 99.9% uptime SLA (production)

---

## Success Metrics

### Primary KPIs

| Metric | Target (MVP) |
|--------|-------------|
| Daily Active Users (DAU) | 100+ |
| Time spent in app vs. chat tools | 60%+ |
| Task completion rate | 70%+ |
| User retention (30-day) | 40%+ |

### Secondary Metrics

- AI feature adoption rate
- Average session duration
- Time tracking accuracy

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| User API key management complexity | Medium | Clear onboarding flow, secure storage |
| Chat tool habit transition | High | Gradual migration tools, integration bridges |
| Multi-tenant data isolation | Critical | Strict Firestore security rules, audit logging |
| GCP free tier limits | Medium | Usage monitoring, graceful degradation |

---

## Timeline Considerations

This PRD does not include specific timelines. Implementation should be broken into phases as outlined in the MVP Scope section, with each phase validated before proceeding to the next.

---

## Appendix

### Glossary

- **Tenant**: An organization using Work Conductor
- **Main Work Time**: Time not allocated to calendar events
- **Work Assignment**: Categorized work items linked to organization structure

### References

- [Tauri Documentation](https://tauri.app/)
- [GCP Free Tier](https://cloud.google.com/free)
- [Firebase Pricing](https://firebase.google.com/pricing)
