# Phase 1: Foundation Tasks

## Authentication

### Google OAuth Setup

- [ ] Create GCP project for Work Conductor
- [ ] Enable Google OAuth 2.0 API in GCP console
- [ ] Configure OAuth consent screen
- [ ] Generate OAuth client credentials
- [ ] Set up Firebase Authentication project
- [ ] Enable Google sign-in provider in Firebase
- [ ] Configure authorized domains in Firebase

### Authentication Implementation

- [ ] Create authentication service module in backend API
- [ ] Implement Google OAuth token verification endpoint
- [ ] Implement user session management
- [ ] Create JWT token generation for authenticated users
- [ ] Implement token refresh mechanism
- [ ] Add logout endpoint
- [ ] Create authentication middleware for protected routes

### Multi-tenant User Management

- [ ] Design tenant data model in Firestore
- [ ] Design user data model with tenant association
- [ ] Create tenant registration endpoint
- [ ] Create user invitation endpoint
- [ ] Implement user-tenant relationship management
- [ ] Add tenant isolation security rules in Firestore
- [ ] Create tenant admin role assignment logic

## Task Management

### Task Data Model

- [ ] Design task document schema in Firestore
- [ ] Define task status enum (Todo, In Progress, Done)
- [ ] Design label data model
- [ ] Create Firestore indexes for task queries

### Task CRUD Operations

- [ ] Implement create task endpoint
- [ ] Implement get task by ID endpoint
- [ ] Implement update task endpoint
- [ ] Implement delete task endpoint
- [ ] Implement list tasks endpoint with pagination

### Task Status Management

- [ ] Implement status transition validation logic
- [ ] Create status update endpoint
- [ ] Add status change timestamp tracking

### Due Date Management

- [ ] Add due date field to task model
- [ ] Implement due date validation
- [ ] Create overdue task query

### Label Management

- [ ] Create label CRUD endpoints
- [ ] Implement label assignment to tasks
- [ ] Add tenant-scoped label management
- [ ] Create label filtering for task list

### Task List View

- [ ] Implement task sorting by due date
- [ ] Implement task sorting by status
- [ ] Implement task sorting by creation date
- [ ] Add task filtering by status
- [ ] Add task filtering by labels
- [ ] Implement task search by title

## Time Tracking

### Attendance Recording

- [ ] Design attendance record data model
- [ ] Create clock-in endpoint
- [ ] Create clock-out endpoint
- [ ] Implement attendance history query
- [ ] Add attendance validation (prevent duplicate clock-in)

### Google Calendar Integration

- [ ] Enable Google Calendar API in GCP
- [ ] Implement Calendar API authentication
- [ ] Create calendar events fetch endpoint
- [ ] Implement calendar sync scheduling
- [ ] Store synced events in Firestore

### Time Categorization

- [ ] Design time category data model
- [ ] Implement automatic "main work" time calculation
- [ ] Create time category assignment logic
- [ ] Build daily time summary calculation
