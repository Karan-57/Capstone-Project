# Backend API Documentation

Base URL: `http://localhost:3000`

---

## 1. Authentication (`/api/auth`)

### 1.1 Register User
* **Method:** `POST`
* **Endpoint:** `/api/auth/register`
* **Access:** Public
* **Body (JSON):**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "creator" // "creator" | "editor"
}
```
* **Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "accessToken": "jwt_access_token_here",
  "user": {
    "id": "64b1f...",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "creator",
    "verified": false
  }
}
```
*(Also sets `refreshToken` HTTP-only cookie)*

---

### 1.2 Login User
* **Method:** `POST`
* **Endpoint:** `/api/auth/login`
* **Access:** Public
* **Body (JSON):** Accepts `identifier` (either email or username), or `email`, or `username`
```json
{
  "identifier": "johndoe",
  "password": "password123"
}
```
* **Response (200 OK):**
```json
{
  "message": "User logged in successfully",
  "accessToken": "jwt_access_token_here",
  "user": {
    "id": "64b1f...",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "creator"
  }
}
```

---

### 1.3 Verify Email (OTP)
* **Method:** `POST`
* **Endpoint:** `/api/auth/verify-email`
* **Access:** Private (`Authorization: Bearer <token>`)
* **Body (JSON):**
```json
{
  "otp": "123456"
}
```
* **Response (200 OK):**
```json
{
  "message": "User verified successfully"
}
```

---

### 1.4 Resend OTP
* **Method:** `GET`
* **Endpoint:** `/api/auth/resend-otp`
* **Access:** Private (`Authorization: Bearer <token>`)
* **Response (200 OK):**
```json
{
  "message": "OTP sent successfully"
}
```

---

### 1.5 Refresh Access Token
* **Method:** `GET`
* **Endpoint:** `/api/auth/refresh-token`
* **Access:** Public (requires `refreshToken` cookie or body)
* **Response (200 OK):**
```json
{
  "message": "Access token refreshed",
  "accessToken": "new_jwt_access_token"
}
```

---

### 1.6 Logout Current Session
* **Method:** `GET`
* **Endpoint:** `/api/auth/logout`
* **Access:** Public (revokes session via cookie/header)
* **Response (200 OK):**
```json
{
  "message": "User logged out successfully"
}
```

---

### 1.7 Logout All Sessions
* **Method:** `GET`
* **Endpoint:** `/api/auth/logout-all`
* **Access:** Public
* **Response (200 OK):**
```json
{
  "message": "User logged out successfully from all sessions"
}
```

---

### 1.8 Forgot Password
* **Method:** `POST`
* **Endpoint:** `/api/auth/forgot-password`
* **Access:** Public
* **Body (JSON):**
```json
{
  "email": "john@example.com"
}
```
* **Response (200 OK):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

---

### 1.9 Reset Password
* **Method:** `POST`
* **Endpoint:** `/api/auth/reset-password`
* **Access:** Public
* **Body (JSON):**
```json
{
  "token": "reset_token_from_email_link",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```
* **Response (200 OK):**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

---

## 2. Users (`/api/users`)

### 2.1 Get Current User Profile
* **Method:** `GET`
* **Endpoint:** `/api/users/me`
* **Access:** Private (`Authorization: Bearer <token>`)
* **Response (200 OK):**
```json
{
  "user": {
    "_id": "64b1f...",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "creator",
    "verified": true,
    "profileImage": "https://ik.imagekit.io/..."
  }
}
```

---

### 2.2 Update Profile (Text Details)
* **Method:** `PATCH`
* **Endpoint:** `/api/users/me`
* **Access:** Private (`Authorization: Bearer <token>`)
* **Body (JSON):** Any combination of allowed fields:
```json
{
  "name": "Johnathan Doe",
  "bio": "Tech YouTuber with 100k subs",
  "location": "New York, USA",
  "skills": ["Premiere Pro", "After Effects"],
  "software": ["DaVinci Resolve"]
}
```
* **Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### 2.3 Upload Profile Image
* **Method:** `PATCH`
* **Endpoint:** `/api/users/me/profile-image`
* **Access:** Private (`Authorization: Bearer <token>`)
* **Body (form-data):**
  - Key: `profileImage` (File: JPEG, PNG, or WebP $\le$ 5MB)
* **Response (200 OK):**
```json
{
  "message": "Profile image updated successfully",
  "profileImage": "https://ik.imagekit.io/.../Capstone-storage/profile-pictures/profile_123.png",
  "user": { ... }
}
```

---

### 2.4 Search Users
* **Method:** `GET`
* **Endpoint:** `/api/users/search?q=john`
* **Access:** Public
* **Response (200 OK):**
```json
{
  "users": [
    {
      "_id": "64b1f...",
      "name": "John Doe",
      "username": "johndoe",
      "profileImage": "https://...",
      "role": "creator",
      "rating": 4.8
    }
  ]
}
```

---

### 2.5 Get User By ID
* **Method:** `GET`
* **Endpoint:** `/api/users/:id`
* **Access:** Public
* **Response (200 OK):**
```json
{
  "user": {
    "_id": "64b1f...",
    "name": "John Doe",
    "username": "johndoe",
    "profileImage": "https://...",
    "role": "creator",
    "bio": "Tech YouTuber",
    "rating": 4.8
  }
}
```

---

## 3. Creator Management (`/api/creator`)

### 3.1 Create Project
* **Method:** `POST`
* **Endpoint:** `/api/creator/projects`
* **Access:** Private (Creator role only)
* **Body (JSON):**
```json
{
  "title": "Weekly Tech Vlog Editing",
  "description": "Need fast cuts, zoom-ins, sound effects, and color grading for 10 min vlog",
  "category": "YouTube Vlog",
  "editingStyle": "Fast-paced, Casey Neistat style",
  "requiredSkills": ["Sound Design", "Color Grading"],
  "requiredSoftware": ["Premiere Pro"],
  "videoDuration": 10,
  "budget": { "min": 100, "max": 200, "currency": "USD" },
  "deadline": "2026-10-01"
}
```
* **Response (201 Created):**
```json
{
  "message": "Project created successfully",
  "project": { ... }
}
```

---

### 3.2 Get My Created Projects
* **Method:** `GET`
* **Endpoint:** `/api/creator/projects?status=open`
* **Access:** Private (Creator role only)
* **Query Params:** `status` (optional: `open`, `in_progress`, `completed`, `cancelled`)
* **Response (200 OK):**
```json
{
  "count": 2,
  "projects": [ ... ]
}
```

---

### 3.3 Update Project
* **Method:** `PATCH`
* **Endpoint:** `/api/creator/projects/:projectId`
* **Access:** Private (Owner Creator only)
* **Body (JSON):** Allowed project fields to edit (`title`, `description`, `budget`, etc.)
* **Response (200 OK):**
```json
{
  "message": "Project updated successfully",
  "project": { ... }
}
```

---

### 3.4 Delete Project
* **Method:** `DELETE`
* **Endpoint:** `/api/creator/projects/:projectId`
* **Access:** Private (Owner Creator only)
* **Response (200 OK):**
```json
{
  "message": "Project deleted successfully"
}
```

---

### 3.5 Cancel Project
* **Method:** `PATCH`
* **Endpoint:** `/api/creator/projects/:projectId/cancel`
* **Access:** Private (Owner Creator only)
* **Response (200 OK):**
```json
{
  "message": "Project cancelled successfully",
  "project": {
    "_id": "64b1...",
    "status": "cancelled"
  }
}
```

---

## 4. Projects Marketplace (`/api/projects`)

### 4.1 Browse All Open Projects (Paginated)
* **Method:** `GET`
* **Endpoint:** `/api/projects?page=1&limit=20&category=Gaming`
* **Access:** Public
* **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 20)
  - `category` (optional filter)
* **Response (200 OK):**
```json
{
  "count": 20,
  "total": 45,
  "page": 1,
  "pages": 3,
  "projects": [ ... ]
}
```

---

### 4.2 Search Open Projects
* **Method:** `GET`
* **Endpoint:** `/api/projects/search?q=vlog&page=1&limit=20`
* **Access:** Public
* **Query Params:**
  - `q` (search query string)
  - `page` (default: 1)
  - `limit` (default: 20)
* **Response (200 OK):**
```json
{
  "count": 5,
  "total": 5,
  "page": 1,
  "pages": 1,
  "projects": [ ... ]
}
```

---

### 4.3 Get Projects by Creator ID (Public)
* **Method:** `GET`
* **Endpoint:** `/api/projects/creator/:creatorId`
* **Access:** Public
* **Response (200 OK):**
```json
{
  "count": 3,
  "projects": [ ... ]
}
```

---

### 4.4 Get Project by ID
* **Method:** `GET`
* **Endpoint:** `/api/projects/:id`
* **Access:** Public
* **Response (200 OK):**
```json
{
  "project": {
    "_id": "64b1...",
    "title": "Weekly Tech Vlog Editing",
    "status": "open",
    "creatorId": {
      "_id": "64b1...",
      "name": "John Doe",
      "username": "johndoe",
      "profileImage": "https://...",
      "rating": 4.9
    }
  }
}
```

---

## 5. Applications (`/api/application` & `/api/projects`)

### 5.1 Apply to a Project
* **Method:** `POST`
* **Endpoints:** 
  - `/api/projects/:id/apply`
  - `/api/application/:id/apply`
* **Access:** Private (Editor only)
* **Headers:** `Authorization: Bearer <accessToken>` (or via cookies)
* **URL Params:** `:id` (Project ID)
* **Body (JSON):**
```json
{
  "proposal": "I have 4 years of experience editing tech vlogs using Premiere Pro and After Effects.",
  "bidAmount": 150,
  "estimatedDeliveryDays": 3
}
```
* **Response (201 Created):**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "64c8...",
    "projectId": "64b1...",
    "editorId": "64a0...",
    "proposal": "I have 4 years of experience editing tech vlogs...",
    "bidAmount": 150,
    "estimatedDeliveryDays": 3,
    "status": "pending",
    "matchScore": 0,
    "matchDetails": {},
    "createdAt": "2026-09-24T12:00:00.000Z",
    "updatedAt": "2026-09-24T12:00:00.000Z"
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Missing fields, invalid bid/delivery numbers, or project not `open`
  - `401 Unauthorized`: Token missing or invalid
  - `403 Forbidden`: User role is not `editor`
  - `404 Not Found`: Project not found
  - `409 Conflict`: Editor has already applied to this project

---

### 5.2 Get Applications for a Project
* **Method:** `GET`
* **Endpoint:** `/api/creator/projects/:projectId/applications`
* **Access:** Private (Creator only - must own the project)
* **Headers:** `Authorization: Bearer <accessToken>` (or via cookies)
* **URL Params:** `:projectId` (Project ID)
* **Query Params:**
  - `status` (optional: `pending`, `accepted`, `rejected`, `withdrawn`)
* **Response (200 OK):**
```json
{
  "count": 2,
  "applications": [
    {
      "_id": "64c8...",
      "projectId": "64b1...",
      "editorId": {
        "_id": "64a0...",
        "name": "Jane Editor",
        "username": "janeeditor",
        "email": "jane@example.com",
        "profileImage": "https://...",
        "bio": "Specialized in travel and tech vlogs",
        "skills": ["Premiere Pro", "After Effects"],
        "rating": 4.8
      },
      "proposal": "I have 4 years of experience editing tech vlogs...",
      "bidAmount": 150,
      "estimatedDeliveryDays": 3,
      "status": "pending",
      "createdAt": "2026-09-24T12:00:00.000Z",
      "updatedAt": "2026-09-24T12:00:00.000Z"
    }
  ]
}
```
* **Error Responses:**
  - `400 Bad Request`: Invalid project ID
  - `401 Unauthorized`: Token missing or invalid
  - `403 Forbidden`: User is not a creator, or does not own this project
  - `404 Not Found`: Project not found

---

### 5.3 Get Editor's Own Applications (All Projects)
* **Method:** `GET`
* **Endpoint:** `/api/application/my`
* **Access:** Private (Editor only)
* **Headers:** `Authorization: Bearer <accessToken>` (or via cookies)
* **Query Params:**
  - `status` (optional: `pending`, `accepted`, `rejected`, `withdrawn`)
  - `page` (default: 1)
  - `limit` (default: 20)
* **Response (200 OK):**
```json
{
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "applications": [
    {
      "_id": "64c8...",
      "projectId": {
        "_id": "64b1...",
        "title": "Weekly Tech Vlog Editing",
        "description": "Looking for video editor...",
        "category": "vlog",
        "status": "open",
        "budget": { "min": 100, "max": 200 },
        "deadline": "2026-10-01T00:00:00.000Z",
        "creatorId": {
          "_id": "64a9...",
          "name": "Creator Name",
          "username": "creatorname",
          "profileImage": "https://...",
          "rating": 4.9
        }
      },
      "editorId": "64a0...",
      "proposal": "I have 4 years of experience editing tech vlogs...",
      "bidAmount": 150,
      "estimatedDeliveryDays": 3,
      "status": "pending",
      "createdAt": "2026-09-24T12:00:00.000Z",
      "updatedAt": "2026-09-24T12:00:00.000Z"
    }
  ]
}
```
* **Error Responses:**
  - `401 Unauthorized`: Token missing or invalid
  - `403 Forbidden`: User role is not `editor`

---

### 5.4 Get Application Details by Application ID
* **Method:** `GET`
* **Endpoint:** `/api/application/:id`
* **Access:** Private (Applicant Editor or Project Creator)
* **Headers:** `Authorization: Bearer <accessToken>` (or via cookies)
* **URL Params:** `:id` (Application ID)
* **Response (200 OK):**
```json
{
  "application": {
    "_id": "64c8...",
    "projectId": {
      "_id": "64b1...",
      "title": "Weekly Tech Vlog Editing",
      "description": "Looking for video editor...",
      "category": "vlog",
      "status": "open",
      "budget": { "min": 100, "max": 200 },
      "deadline": "2026-10-01T00:00:00.000Z",
      "creatorId": {
        "_id": "64a9...",
        "name": "Creator Name",
        "username": "creatorname",
        "profileImage": "https://...",
        "rating": 4.9
      }
    },
    "editorId": {
      "_id": "64a0...",
      "name": "Jane Editor",
      "username": "janeeditor",
      "email": "jane@example.com",
      "profileImage": "https://...",
      "bio": "Specialized in travel and tech vlogs",
      "skills": ["Premiere Pro", "After Effects"],
      "rating": 4.8
    },
    "proposal": "I have 4 years of experience editing tech vlogs...",
    "bidAmount": 150,
    "estimatedDeliveryDays": 3,
    "status": "pending",
    "createdAt": "2026-09-24T12:00:00.000Z",
    "updatedAt": "2026-09-24T12:00:00.000Z"
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Invalid application ID
  - `401 Unauthorized`: Token missing or invalid
  - `403 Forbidden`: User is neither the applicant editor nor the project creator
  - `404 Not Found`: Application not found

---

### 5.5 Update Application (Proposal / Bid / Delivery Days)
* **Method:** `PATCH`
* **Endpoint:** `/api/application/:id`
* **Access:** Private (Editor who submitted the application)
* **Headers:** `Authorization: Bearer <accessToken>` (or via cookies)
* **URL Params:** `:id` (Application ID)
* **Body (JSON):** Any combination of editable fields
```json
{
  "proposal": "Updated proposal text with additional portfolio link",
  "bidAmount": 140,
  "estimatedDeliveryDays": 2
}
```
* **Response (200 OK):**
```json
{
  "message": "Application updated successfully",
  "application": {
    "_id": "64c8...",
    "projectId": "64b1...",
    "editorId": "64a0...",
    "proposal": "Updated proposal text with additional portfolio link",
    "bidAmount": 140,
    "estimatedDeliveryDays": 2,
    "status": "pending",
    "createdAt": "2026-09-24T12:00:00.000Z",
    "updatedAt": "2026-09-24T12:30:00.000Z"
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Invalid application ID, empty proposal, negative/zero numbers, or application is no longer `pending`
  - `401 Unauthorized`: Token missing or invalid
  - `403 Forbidden`: User is not an editor or does not own this application
  - `404 Not Found`: Application not found

---

### 5.6 Withdraw Application
* **Method:** `DELETE`
* **Endpoint:** `/api/application/:id`
* **Access:** Private (Editor who submitted the application)
* **Headers:** `Authorization: Bearer <accessToken>` (or via cookies)
* **URL Params:** `:id` (Application ID)
* **Response (200 OK):**
```json
{
  "message": "Application withdrawn successfully",
  "application": {
    "_id": "64c8...",
    "status": "withdrawn",
    "updatedAt": "2026-09-24T12:35:00.000Z"
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Cannot withdraw if application is already `accepted`
  - `401 Unauthorized`: Token missing or invalid
  - `403 Forbidden`: User is not an editor or does not own this application
  - `404 Not Found`: Application not found



