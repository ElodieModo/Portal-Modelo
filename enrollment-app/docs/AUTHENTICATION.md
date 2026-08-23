# Authentication & Enrollment Guide

## Student Registration & Login

### Registration (`POST /api/auth/register`)

Students must create an account before they can enroll in courses.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "+33612345678",
  "birthDate": "2010-05-15",
  "age": 14
}
```

**Response:**
```json
{
  "message": "Student registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "student": {
    "id": "cuid123",
    "email": "student@example.com",
    "firstName": "João",
    "lastName": "Silva"
  }
}
```

### Login (`POST /api/auth/login`)

**Request:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "student": {
    "id": "cuid123",
    "email": "student@example.com",
    "firstName": "João",
    "lastName": "Silva"
  }
}
```

### Get Profile (`GET /api/auth/me`)

Requires authentication header: `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "cuid123",
  "email": "student@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "+33612345678",
  "birthDate": "2010-05-15",
  "age": 14,
  "enrollments": [
    {
      "id": "enrollment-id",
      "courseId": "course-id",
      "status": "ACTIVE",
      "course": {
        "name": "Children & Family Class",
        "dayOfWeek": "Sunday",
        "startTime": "10:00",
        "endTime": "11:30"
      }
    }
  ]
}
```

## Course Enrollment

### Enroll in Course (`POST /api/enrollments`)

Students can enroll in one or multiple courses.

**Request:**
```json
{
  "courseId": "course-id-123"
}
```

**Authorization:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Enrollment successful. Confirmation email sent.",
  "enrollment": {
    "id": "enrollment-id",
    "studentId": "student-id",
    "courseId": "course-id",
    "status": "ACTIVE",
    "enrolledAt": "2026-08-22T10:30:00Z",
    "student": { ... },
    "course": { ... }
  }
}
```

### Cancel Enrollment (`PUT /api/enrollments/:enrollmentId/cancel`)

Students can cancel their enrollment up to **24 hours before the course**.

**Authorization:** `Authorization: Bearer <token>`

**Response (Success):**
```json
{
  "message": "Enrollment cancelled successfully",
  "enrollment": {
    "id": "enrollment-id",
    "status": "CANCELLED"
  }
}
```

**Response (Error - Within 24 hours):**
```json
{
  "error": "Cancellation is not permitted within 24 hours of the course. Course starts in 12 hours.",
  "hoursUntilCourse": 12
}
```

### Cancellation Policy

- ✅ **Can cancel**: Up to 24 hours before course start time
- ❌ **Cannot cancel**: Within 24 hours of course (must contact instructor)
- 🆓 **Free**: No penalty for cancellation
- 💰 **No charge**: If cancelled in advance, you are not charged

**Example:**
- Course: Thursday 6:30 PM
- Cancellation deadline: Wednesday 6:30 PM
- Contact instructor if cancelling after deadline

## Email Notifications

### Student Enrollment Confirmation

When a student enrolls in a course, they automatically receive a confirmation email with:
- Course name
- Course date/time
- Personal greeting

### Instructor Notification

When a student enrolls, the instructor receives a notification email with:
- Student name and email
- Course name
- Date/time of enrollment

**Configuration:**
Set `INSTRUCTOR_EMAIL` in `.env` to receive notifications.

## Email Service Setup

### Using Gmail

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Set in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Using Other SMTP Services

Configure according to your email provider's SMTP settings in `.env`.

## Security Features

- Passwords are hashed using bcryptjs (10 rounds)
- JWT tokens expire after 7 days
- Student authentication required for enrollments
- CORS configured to frontend URL only
- Input validation on all endpoints

## Error Handling

Common errors:

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Email already registered | Use a different email |
| 400 | Missing required fields | Ensure all fields are provided |
| 401 | Invalid email or password | Check credentials |
| 401 | No token provided | Include Authorization header |
| 400 | Student already enrolled | Student is already in that course |
| 400 | Course is full | Wait for cancellation or choose another course |

## Frontend Integration

```javascript
// Register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@example.com',
    password: 'password',
    firstName: 'João',
    lastName: 'Silva'
  })
});
const { token } = await response.json();
localStorage.setItem('token', token);

// Enroll in course
const enrollResponse = await fetch('/api/enrollments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({ courseId: 'course-id' })
});
```
