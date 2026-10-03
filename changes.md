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

### 1.5 Aggregated Metrics & Ratings in `user.model.js` (Computed from `review.model.js`)
* **Initial Blueprint:** Both `user.model.js` and `review.model.js` maintained individual static rating fields, leading to ambiguity.
* **Change:** Individual review scores and granular feedback metrics are recorded and owned exclusively within [`review.model.js`](file:///C:/Users/Karan/Documents/capstone-project/backend/src/model/review.model.js). Aggregated average fields (`rating`, `responseTime`, `behaviour`, `speed`, `quality`, `boundaryRespect`, `boundary`, and `totalReviews`) are stored on [`user.model.js`](file:///C:/Users/Karan/Documents/capstone-project/backend/src/model/user.model.js). These are recomputed on-the-fly and atomically updated when reviews are submitted via `/reviewEditor` and `/reviewCreator`.
* **Rationale:** Provides high-performance profile and rating queries without requiring aggregation across all review documents on every user profile visit, while keeping raw historical reviews as the ground truth.

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
  - Deliveries: `:deliveryId`
  - Notifications: `:notificationId`
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
  - `POST /api/users/:projectId/reviewEditor`: Allows the project creator to review the assigned editor with overall `rating` (1–5), optional `reviewText`, and mandatory metrics out of 10 (`speed`, `quality`, `behaviour`, `responseTime`). Automatically recalculates and updates the editor's aggregated averages on `userModel`.
  - `POST /api/users/:projectId/reviewCreator`: Allows the assigned editor to review the creator with overall `rating` (1–5), optional `reviewText`, and mandatory metrics out of 10 (`behaviour`, `responseTime`, `boundaryRespect`). Automatically recalculates and updates the creator's aggregated averages on `userModel`.
* **Access Control:** Restricted strictly to the creator and editor who actively worked together on that specific project.

### 2.10 User Reviews & Aggregated Ratings Querying (`/api/users`)
* **Endpoints Added:**
  - `GET /api/users/:userId/get-review`: Returns all reviews received by the user with pagination (`limit: 10`), sorting newest first. Response fields dynamically adapt based on role (editors receive `speed`, `quality`, `behaviour`, `responseTime`; creators receive `behaviour`, `responseTime`, `boundaryRespect`).
  - `GET /api/users/:userId/ratings`: Returns only the user's aggregated averages directly from `userModel` according to their role (`editor`: `rating`, `speed`, `quality`, `behaviour`, `responseTime`; `creator`: `rating`, `behaviour`, `responseTime`, `boundaryRespect`).

### 2.11 System Notification Architecture (`/api/notifications`)
* **Model Created/Standardized:** [`notification.model.js`](file:///C:/Users/Karan/Documents/capstone-project/backend/src/model/notification.model.js) with `recipient`, `type` (controlled enum types including `NEW_APPLICATION`, `APPLICATION_ACCEPTED`, `APPLICATION_REJECTED`, `PROJECT_STATUS_UPDATED`, `FILES_UPLOADED`, `FILE_DELETED`, `FINAL_SUBMISSION`, `REVISION_REQUESTED`, `REVISION_SUBMITTED`, `PROJECT_APPROVED`, `PROJECT_CANCELLED`, `DEADLINE_UPDATED`, `REQUIREMENTS_UPDATED`, `NEW_REVIEW`), `title`, `message`, `project`, `relatedUser`, `isRead`. Indexed by `{ recipient: 1, isRead: 1 }` and `{ recipient: 1, createdAt: -1 }`.
* **Service:** [`notification.service.js`](file:///C:/Users/Karan/Documents/capstone-project/backend/src/services/notification.service.js) providing `createNotification` which saves to MongoDB first and then emits real-time events via Socket.io room-targeting (`system-notification`), strictly decoupled from chat messaging.
* **Notification Rules Enforced:**
  1. MongoDB persistence first, Socket.io real-time delivery second.
  2. Targeted exclusively to affected users (never broadcasts to the entire workspace or to the user triggering the action).
  3. No duplicate notifications (e.g. unified proposal + bid on application submission).
  4. Fully populated metadata (`project`, `relatedUser`) for immediate client navigation.
* **Endpoints:**
  - `GET /api/notifications`: Retrieves authenticated user's notifications with pagination and optional `?unreadOnly=true`.
  - `PATCH /api/notifications/:notificationId/read`: Marks an individual notification as read (supports fallback `:id`).
  - `PATCH /api/notifications/read-all`: Marks all unread notifications for user as read.
  - `DELETE /api/notifications/:notificationId`: Deletes a user's notification (supports fallback `:id`).
* **Controller Triggers Integrated:**
  - `NEW_APPLICATION`: On editor proposal/bid submission (`POST /api/application/:projectId/apply` and `/api/projects/:projectId/applications`).
  - `APPLICATION_ACCEPTED`: On application acceptance (`POST /api/application/:applicationId/accept`).
  - `APPLICATION_REJECTED`: On application rejection (`POST /api/application/:applicationId/reject`).
  - `PROJECT_STATUS_UPDATED`: On milestone / progress updates (`PATCH /api/workspace/:workspaceId/progress`).
  - `FILES_UPLOADED`: On workspace file upload (`POST /api/workspace/:workspaceId/files`).
  - `FILE_DELETED`: On workspace file deletion (`DELETE /api/workspace/:workspaceId/files/:fileId`).
  - `FINAL_SUBMISSION`: On final cut delivery (`POST /api/workspace/:workspaceId/deliver`).
  - `REVISION_REQUESTED`: On revision request (`POST /api/workspace/:deliveryId/revision`).
  - `REVISION_SUBMITTED`: On revision resolution (`PATCH /api/workspace/:revisionId/revision`).
  - `PROJECT_APPROVED`: On delivery approval (`POST /api/workspace/:deliveryId/approve`).
  - `PROJECT_CANCELLED`: On project cancellation or disbandment (`PATCH /api/creator/projects/:projectId/cancel` and `/api/projects/:projectId/close`).
  - `DEADLINE_UPDATED`: On project deadline change after editor assignment (`PATCH /api/creator/projects/:projectId` and `/api/projects/:projectId`).
  - `REQUIREMENTS_UPDATED`: On project requirements change after editor assignment (`PATCH /api/creator/projects/:projectId` and `/api/projects/:projectId`).
  - `NEW_REVIEW`: On review submission for editor or creator (`POST /api/users/:projectId/reviewEditor`, `POST /api/users/:projectId/reviewCreator`, and `/api/projects/:projectId/reviews`).

---



## 3. Session & Authentication Adjustments

### 3.1 Identifier-Based Login
* **Initial Blueprint:** Traditional email-only login.
* **Change:** Extended to accept either `email` or `username` via an `identifier` field in `POST /api/auth/login`.

### 3.2 Auto-Login Upon Registration
* **Initial Blueprint:** Separate registration and login requests.
* **Change:** Registration automatically creates a session and returns auth tokens + refresh cookie immediately.
