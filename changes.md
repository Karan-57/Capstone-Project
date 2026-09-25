# Changelog & Design Deviations (changes.md)

This document tracks all modifications, architectural updates, and schema deviations made during development compared to the initial project blueprint.

---

## 1. Schema & Database Deviations

### 1.1 Model Names & Reference Standardizations (Lowercase)
* **Initial Blueprint:** Mixed casings were used across references (`'Project'`, `'User'`, `'Application'`).
* **Change:** Standardized all Mongoose model registration and reference strings to strictly lowercase (`'user'`, `'project'`, `'session'`, `'otp'`, `'application'`, `'tokenBlacklist'`).
* **Rationale:** Eliminates Mongoose populate mismatches and case-sensitivity errors across environments.

### 1.2 Project Status Enum Expansion (`assigned` stage added)
* **Initial Blueprint:** Project statuses were: `['open', 'in_progress', 'completed', 'cancelled']`.
* **Change:** Added intermediate stage `'assigned'` to the enum:
  ```js
  enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled']
  ```
* **Rationale:** When a creator accepts an editor's application, work does not instantly start. Both parties enter an intermediate negotiation/pre-production stage (`assigned`). Only after mutual agreement does it advance to `in_progress`.

### 1.3 Role-Specific Metrics / Reputation Subdocuments (Put On Hold)
* **Initial Plan:** Considered injecting nested subdocuments (`creatorProfile` and `editorProfile`) with granular rating metrics (e.g. `behavior`, `responseTime`, `boundaryRespect`).
* **Change:** Put on hold by explicit user decision. Basic `rating` and `role` are used for now.

### 1.4 Dedicated Portfolio Model & Decoupling from UserModel
* **Initial Blueprint:** Simple embedded `portfolio` array, `skills`, `software`, and `experience` directly inside `user.model.js`.
* **Change:** 
  - Extracted all editor-specific fields (`skills`, `software`, `experience`, `experienceUnit`, `portfolioItems`, `specialization`, `socialLinks`, `hourlyRate`, `availability`) completely into [`portfolio.model.js`](file:///C:/Users/Karan/Documents/capstone-project/backend/src/model/portfolio.model.js) with indexing on `editor`, `skills`, and `software`.
  - Removed duplicate `portfolio` array, `skills`, `software`, and `experience` fields from [`user.model.js`](file:///C:/Users/Karan/Documents/capstone-project/backend/src/model/user.model.js).
  - Cleaned up user controllers (`PATCH /api/users/me` and `GET /api/users/search`) to reflect the clean user profile schema.
* **Rationale:** Establishes clean single-source-of-truth separation between base user identity/auth and editor portfolio/professional showcases.

### 1.5 Decoupling `rating` from `user.model.js` (Exclusive to `review.model.js`)
* **Initial Blueprint:** Both `user.model.js` and `review.model.js` maintained a `rating` field, introducing duplicate and potentially conflicting state.
* **Change:** Removed the duplicate `rating` field and its index from [`user.model.js`](file:///C:/Users/Karan/Documents/capstone-project/backend/src/model/user.model.js). Ratings and role-specific feedback metrics (`speed`, `quality`, `behaviour`, `responseTime`, `boundaryRespect`) are now exclusively defined and managed within [`review.model.js`](file:///C:/Users/Karan/Documents/capstone-project/backend/src/model/review.model.js).
* **Rationale:** Establishes a single source of truth for review scores and metrics within dedicated review records rather than mutating user records with duplicate fields.

---

## 2. Route & Architecture Adjustments

### 2.1 Image Upload Architecture (ImageKit with Base64 Buffer)
* **Initial Blueprint:** Unspecified or disk-based uploads.
* **Change:** Implemented Multer `memoryStorage` limited to `5MB` and types `image/jpeg`, `image/png`, `image/webp`. Image files are converted to `base64` before pushing to ImageKit destination `/Capstone-storage/profile-pictures`.
* **Change:** Dedicated endpoint `PATCH /api/users/me/profile-image` separated from profile text updates (`PATCH /api/users/me`).

### 2.2 Creator Public Projects Route Consolidation
* **Initial Blueprint:** Route was initially placed in `users.routes.js`.
* **Change:** Consolidated under `projects.routes.js` as `GET /api/projects/creator/:creatorId` to keep project querying cohesive under the `/api/projects` resource.

### 2.3 Editor Application Workflow & Disband Mechanism
* **Initial Blueprint:** Direct application acceptance leading directly into in-progress work.
* **Changes Added:**
  1. `POST /api/application/:projectId/apply` (or `/api/projects/:projectId/apply`): Editors can apply with `proposal`, `bidAmount`, `estimatedDeliveryDays`. Prevents duplicate applications.
  2. `GET /api/application/my`: Cross-project query for editors with pagination and populated project/creator info.
  3. `GET /api/application/:applicationId`: Detail view restricted to applicant editor or project creator.
  4. `PATCH /api/application/:applicationId`: Editors can edit proposal/bid/delivery while still `pending`.
  5. `DELETE /api/application/:applicationId`: Editors can withdraw applications (soft status `'withdrawn'`), blocked if already accepted.
  6. `POST /api/application/:applicationId/accept`: Moves application to `accepted` and project to `assigned`.
  7. `POST /api/creator/projects/:projectId/disband`: If negotiations break down during the `assigned` stage, creator can disband the chosen editor, which reverts the project back to `open`, unassigns the editor, and marks their application as `rejected`.

### 2.4 Dedicated Portfolio Endpoints (`/api/portfolio`)
* **Endpoints Added:**
  - `GET /api/portfolio/my`: Editor views their own portfolio.
  - `POST /api/portfolio`: Editor creates/uploads a portfolio (1-to-1).
  - `PATCH /api/portfolio`: Updates portfolio fields directly using authenticated `req.user.id`.
  - `DELETE /api/portfolio`: Deletes portfolio directly using authenticated `req.user.id`.
  - `GET /api/portfolio/:editorId`: Public view of an editor's portfolio (respects `isPublic`).

### 2.5 Explicit Route Param Naming Standardization
* **Initial Blueprint:** Many routes used generic `:id` across different resources.
* **Change:** Standardized all route parameter names across backend routes to be explicit:
  - Users: `:userId`
  - Projects: `:projectId`
  - Applications: `:applicationId`
  - Portfolios: `:editorId` for public lookup; personal endpoints (`GET /my`, `PATCH /`, `DELETE /`) use authenticated `req.user.id` directly without requiring route ID params.
  - Workspaces: `:workspaceId`
  - Revisions: `:revisionId`
* **Rationale:** Prevents parameter collision, ambiguous controller handler logic, and improves client readability.

### 2.6 Workspace Progress Tracking (`/api/workspace`)
* **Endpoints Added:**
  - `GET /api/workspace/:workspaceId/progress`: Fetches all progress updates and current workspace status for participants (creator or assigned editor).
  - `PATCH /api/workspace/:workspaceId/progress`: Allows the assigned editor to submit incremental progress updates. Supports predefined milestone selection (`footage_organized` [15%], `rough_cut` [35%], `broll_and_graphics` [55%], `sound_and_music` [75%], `color_and_polish` [90%], `review_ready` [100%]) with auto-calculated percentages, or fine-tuned custom percentages (0-100), syncing directly with workspace status (`active`, `in_review`, `completed`).

### 2.7 Workspace Revision Management (`/api/workspace`)
* **Endpoints Added:**
  - `POST /api/workspace/:workspaceId/revision`: Allows creator or editor to file revision requests with descriptions and optional file references, transitioning workspace to `in_review`.
  - `GET /api/workspace/:workspaceId/revision`: Retrieves revision requests for a workspace with populated requester and file details, with optional `?status=` filtering.
  - `PATCH /api/workspace/:revisionId/revision`: Allows workspace participants to update revision status (`pending`, `in_progress`, `resolved`) and descriptions, setting `resolvedAt` timestamp automatically upon resolution.

### 2.8 Workspace Final Video Deliveries (`/api/workspace`)
* **Model Created:** `backend/src/model/delivery.model.js` (`delivery`) tracking `workspaceId`, `editorId`, `fileId`, `videoUrl`, `title`, `notes`, `version`, and review status.
* **Endpoints Added:**
  - `POST /api/workspace/:workspaceId/deliver`: Allows the assigned editor to deliver final cuts / video URLs. Auto-increments delivery version, shifts workspace status to `in_review`, and records a `review_ready` (100%) progress milestone.
  - `GET /api/workspace/:workspaceId/deliveries`: Allows workspace participants (creator or editor) to view all submitted cut versions with populated editor and file details sorted newest first.

### 2.9 Bidirectional Project Reviews (`/api/users`)
* **Endpoints Added:**
  - `POST /api/users/:projectId/reviewEditor`: Allows the project creator to review the assigned editor with overall `rating` (1–5), optional `reviewText`, and mandatory metrics out of 10 (`speed`, `quality`, `behaviour`, `responseTime`).
  - `POST /api/users/:projectId/reviewCreator`: Allows the assigned editor to review the creator with overall `rating` (1–5), optional `reviewText`, and mandatory metrics out of 10 (`behaviour`, `responseTime`, `boundaryRespect`).
* **Access Control:** Restricted strictly to the creator and editor who actively worked together on that specific project.

---



## 3. Session & Authentication Adjustments

### 3.1 Identifier-Based Login
* **Initial Blueprint:** Traditional email-only login.
* **Change:** Extended to accept either `email` or `username` via an `identifier` field in `POST /api/auth/login`.

### 3.2 Auto-Login Upon Registration
* **Initial Blueprint:** Separate registration and login requests.
* **Change:** Registration automatically creates a session and returns auth tokens + refresh cookie immediately.
