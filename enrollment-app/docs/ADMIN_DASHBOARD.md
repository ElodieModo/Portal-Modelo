# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a comprehensive management tool for instructors and administrators to:
- Create, edit, and delete courses
- View all enrollments and student information
- Monitor course capacity and enrollment status
- Manage special/exceptional courses and workshops

## Access

### Admin Login

Navigate to: `http://localhost:3000/admin/login`

**Credentials:**
- Email: Your admin email
- Password: Your admin password

To create the first admin user, use this backend endpoint:
```bash
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

## Dashboard Features

### 1. Overview Tab

Displays key statistics:
- **Total Courses**: Number of active courses
- **Total Students**: Number of registered students
- **Active Enrollments**: Students currently enrolled in courses
- **Course Status**: Visual progress bars showing course capacity

### 2. Courses Tab

#### View Courses
- Lists all courses (regular, special, workshops)
- Shows course details:
  - Course name and level
  - Type (REGULAR/SPECIAL/WORKSHOP)
  - Schedule (day/time or specific date)
  - Capacity
  - Description

#### Add New Course

Click **➕ Add New Course** to open the course creation form:

**Regular Course (Recurring):**
```json
{
  "name": "Children & Family Class",
  "description": "Beginner capoeira for children and families (5-14 years old)",
  "level": "CHILDREN",
  "type": "REGULAR",
  "dayOfWeek": "Sunday",
  "startTime": "10:30",
  "endTime": "11:30",
  "maxStudents": 20,
  "pricePerHour": 8,
  "location": "Main Hall"
}
```

**Special Course (One-time event):**
```json
{
  "name": "Master Class - Berimbau Techniques",
  "description": "Learn advanced berimbau rhythms with guest instructor",
  "level": "INTERMEDIATE",
  "type": "SPECIAL",
  "date": "2026-09-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "maxStudents": 15,
  "pricePerHour": 8,
  "location": "Studio A"
}
```

**Key Fields:**
- `name`: Course name (displayed to students)
- `level`: BEGINNER, INTERMEDIATE, ADVANCED, CHILDREN, FAMILY
- `type`: REGULAR (recurring), SPECIAL (one-time), WORKSHOP
- `dayOfWeek`: For regular courses only (Sunday, Monday, etc.)
- `date`: For special courses only (YYYY-MM-DD format)
- `startTime` / `endTime`: 24-hour format (HH:MM)
- `pricePerHour`: Fixed at £8.00 for all courses
- `maxStudents`: Course capacity (usually 15-20)

**Price Calculation:**
Students pay: `(endTime - startTime) × pricePerHour`
- 1 hour course = £8
- 1.5 hour course = £12
- 2 hour course = £16

#### Edit Course
Click **✏️ Edit** on any course card to modify:
- Course name, level, type
- Schedule and capacity
- Description and location

#### Delete Course
Click **🗑️ Delete** to remove a course.

⚠️ **Note**: Courses with active enrollments cannot be deleted. Cancel enrollments first.

### 3. Enrollments Tab

#### View All Enrollments

Table showing:
| Column | Description |
|--------|-------------|
| Student | Student name |
| Email | Student email address |
| Course | Course name |
| Status | ACTIVE or CANCELLED |
| Enrolled | Date of enrollment |

### Course-Specific Enrollments

Click **View Enrollments →** on any course to see:
- All students enrolled in that course
- Available spots remaining
- Enrollment date for each student

### Cancel Enrollment

Click **Cancel** (delete icon) next to an enrollment to:
- Remove a student from a course
- Free up a spot for others
- This does not delete the student account
- No restrictions on admin cancellations

**Note:** Students can self-cancel up to 24 hours before the course. See [PRICING_CANCELLATION.md](./PRICING_CANCELLATION.md) for details.

## API Endpoints (Admin Only)

All admin endpoints require JWT authentication:

```bash
Authorization: Bearer <admin_token>
```

### Authentication

```bash
# Admin Login
POST /api/admin/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}

# Get Admin Profile
GET /api/admin/auth/me

# Create New Admin
POST /api/admin/auth/create
{
  "email": "newadmin@example.com",
  "password": "password",
  "name": "Admin Name"
}
```

### Dashboard & Statistics

```bash
# Get Dashboard Statistics
GET /api/dashboard/stats

# Get All Enrollments
GET /api/dashboard/enrollments

# Get Enrollments for Specific Course
GET /api/dashboard/enrollments/course/:courseId

# Get All Students
GET /api/dashboard/students

# Cancel an Enrollment
DELETE /api/dashboard/enrollments/:enrollmentId
```

### Course Management

```bash
# Get All Courses
GET /api/courses

# Get Regular Courses Only
GET /api/courses/regular

# Get Special/Upcoming Courses
GET /api/courses/special/upcoming

# Get Course Details
GET /api/courses/:id

# Create Course
POST /api/courses
{
  "name": "Course Name",
  "level": "BEGINNER",
  "type": "REGULAR",
  "dayOfWeek": "Sunday",
  "startTime": "10:00",
  "endTime": "11:30",
  "maxStudents": 20
}

# Update Course
PUT /api/courses/:id
{ /* updated fields */ }

# Delete Course
DELETE /api/courses/:id
```

## Course Types Explained

### Regular (Recurring)
- Repeats every week on the same day
- Examples: "Sunday Children's Class", "Thursday Adult Beginner"
- Requires: `dayOfWeek`, `startTime`, `endTime`

### Special (One-time)
- Scheduled for a specific date
- Examples: "Master Class", "Guest Instructor Workshop"
- Requires: `date`, `startTime`, `endTime`

### Workshop
- Similar to special but emphasizes a specific topic
- Examples: "Berimbau Techniques", "Capoeira History Seminar"
- Can be recurring or one-time

## Level Classification

| Level | Target | Description |
|-------|--------|-------------|
| BEGINNER | New students | No prior experience required |
| INTERMEDIATE | Some experience | 6+ months of practice |
| ADVANCED | Experienced | 2+ years of practice |
| CHILDREN | Kids (5-14) | Age-appropriate instruction |
| FAMILY | All ages | Parents and children together |

## Best Practices

1. **Course Naming**: Use clear, descriptive names
   - ✅ "Sunday Children & Family - Beginner"
   - ❌ "Class 1"

2. **Capacity Planning**: Set realistic maximum students
   - Children: 15-20 per class
   - Adults: 15-25 per class
   - Workshops: 10-15 participants

3. **Schedule Consistency**: Keep regular classes at the same time
   - Helps students remember and plan

4. **Detailed Descriptions**: Include:
   - What students will learn
   - Prerequisites (if any)
   - What to bring (water, mat, etc.)

5. **Monitor Enrollment**: Check dashboard regularly
   - Notify when courses are full
   - Track popular course times
   - Plan additional sessions if needed

## Troubleshooting

### Can't Delete a Course?
→ Course has active enrollments. Use Enrollments tab to cancel them first.

### Student Not Appearing in List?
→ Check student registration status. Ensure they created an account before enrolling.

### Admin Token Expired?
→ Log out and log back in to refresh your token.

### Can't Edit Course Details?
→ Verify you have admin permissions and the course exists.

## Next Steps

- [Student Registration Guide](./AUTHENTICATION.md)
- [API Reference](./AUTHENTICATION.md)
- [Backend Setup](../README.md)
