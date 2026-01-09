# Authentication & CRUD Endpoints

This document describes all the authentication and CRUD endpoints available in the ChatForge backend.

## Base URL
All endpoints are prefixed with `/api/auth`

---

## Authentication Endpoints

### 1. Register
**POST** `/api/auth/register`

Create a new user account and organization.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Company"
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Min 8 chars, must contain uppercase, lowercase, and number/special char
- First Name: 2-50 chars
- Last Name: 2-50 chars
- Organization Name: 2-100 chars

**Response (201):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "uuid"
}
```

---

### 2. Login
**POST** `/api/auth/login`

Authenticate and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  }
}
```

---

### 3. Refresh Token
**POST** `/api/auth/refresh`

Get a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response (200):**
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

---

### 4. Logout
**POST** `/api/auth/logout`

Revoke the current refresh token.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 5. Forgot Password
**POST** `/api/auth/forgot-password`

Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If the email exists, a reset link has been sent."
}
```

---

### 6. Reset Password
**POST** `/api/auth/reset-password`

Reset password using a token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Validation Rules:**
- Password: Min 8 chars, must contain uppercase, lowercase, and number/special char

**Response (200):**
```json
{
  "message": "Password reset successful. Please log in with your new password."
}
```

---

### 7. Verify Email
**POST** `/api/auth/verify-email`

Verify email address using token from email.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

### 8. Resend Verification Email
**POST** `/api/auth/resend-verification`

Request a new verification email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification email sent"
}
```

---

### 9. Get Current User
**GET** `/api/auth/me`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "organizationId": "org-uuid",
  "organization": {
    "id": "org-uuid",
    "name": "My Company"
  }
}
```

---

## User CRUD Endpoints

All user CRUD endpoints require authentication and automatically filter by the authenticated user's organization.

### 10. Get All Users
**GET** `/api/auth/users`

Get all users in your organization.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user1@example.com",
      "firstName": "User",
      "lastName": "One",
      "role": "admin",
      "isActive": true
    },
    {
      "id": "uuid",
      "email": "user2@example.com",
      "firstName": "User",
      "lastName": "Two",
      "role": "manager",
      "isActive": true
    }
  ]
}
```

---

### 11. Get User by ID
**GET** `/api/auth/users/:id`

Get a specific user by ID (must be in your organization).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "manager",
  "organizationId": "org-uuid",
  "isActive": true
}
```

---

### 12. Update User
**PUT** `/api/auth/users/:id`

Update a user's information (must be in your organization).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "manager",
  "isActive": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "firstName": "Updated",
  "lastName": "Name",
  "role": "manager",
  "organizationId": "org-uuid",
  "updatedAt": "2026-01-09T10:30:00Z"
}
```

---

### 13. Delete User
**DELETE** `/api/auth/users/:id`

Delete a user from your organization.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (204):**
```
No Content
```

---

## Organization CRUD Endpoints

All organization endpoints operate on the authenticated user's organization.

### 14. Get My Organization
**GET** `/api/auth/organization`

Get your organization's details.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "id": "org-uuid",
  "name": "My Company",
  "logoUrl": null,
  "brandingConfig": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#8B5CF6"
  },
  "plan": "starter",
  "isActive": true,
  "userCount": 5
}
```

---

### 15. Update Organization
**PUT** `/api/auth/organization`

Update your organization's details.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "logoUrl": "https://example.com/logo.png",
  "brandingConfig": {
    "primaryColor": "#FF5733",
    "secondaryColor": "#C70039"
  }
}
```

**Response (200):**
```json
{
  "id": "org-uuid",
  "name": "Updated Company Name",
  "logoUrl": "https://example.com/logo.png",
  "brandingConfig": {
    "primaryColor": "#FF5733",
    "secondaryColor": "#C70039"
  },
  "updatedAt": "2026-01-09T10:30:00Z"
}
```

---

### 16. Delete Organization
**DELETE** `/api/auth/organization`

Delete your organization (and all associated users).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (204):**
```
No Content
```

⚠️ **Warning:** This action is irreversible and will delete all users, widgets, and data associated with the organization.

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Resource already exists",
  "error": "Conflict"
}
```

---

## Authentication Flow

1. **Register**: User creates account with `POST /api/auth/register`
2. **Verify Email**: User clicks link in email, frontend calls `POST /api/auth/verify-email`
3. **Login**: User logs in with `POST /api/auth/login`, receives access + refresh tokens
4. **Authenticated Requests**: Include `Authorization: Bearer <access-token>` header
5. **Token Refresh**: When access token expires, use `POST /api/auth/refresh` with refresh token
6. **Logout**: Call `POST /api/auth/logout` to revoke refresh token

---

## Implementation Status

✅ **Completed:**
- All endpoint routes defined
- Request/Response DTOs with validation
- Controller methods
- Service method stubs (ready for implementation)

⏳ **To Do (Backend Implementation):**
- Database integration (TypeORM repositories)
- JWT token generation and validation
- Password hashing with bcrypt
- Email service integration
- Role-based access control guards
- Multi-tenant data isolation

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Org"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Get Current User (with token)
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get All Users
```bash
curl -X GET http://localhost:3001/api/auth/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Next Steps

1. **Add environment variables** to `backend/.env` (see plan file)
2. **Implement database layer** when ready to connect to PostgreSQL
3. **Test endpoints** using Postman, cURL, or your frontend
4. **Customize responses** based on your specific business requirements
