# Capoeira Enrollment Application

A modern web application for managing student registrations and class scheduling for capoeira courses.

## Features

- 📅 **Course Scheduling**: Sunday (children & family), Thursday (beginner & intermediate adults)
- 👥 **Student Accounts**: Secure registration and login
- 📝 **Course Enrollment**: Enroll in one or multiple courses
- 📧 **Email Notifications**: Automatic confirmation emails to students and instructor
- 🎛️ **Admin Dashboard**: Manage courses, view enrollments, monitor capacity
- 📊 **Class Roster**: View class attendance and manage enrollments
- 🌍 **Multi-language Support**: English (primary), Portuguese-ready
- ♿ **Accessible Design**: WCAG 2.1 compliant
- 📱 **Mobile Responsive**: Works on all devices
- 🔐 **Secure**: JWT authentication, bcrypt password hashing

## User Roles

### Student
- Register an account
- View available courses
- Enroll in courses
- Receive enrollment confirmations via email
- Track their enrolled courses

### Administrator
- Login to secure dashboard
- Create, edit, and delete courses
- View all enrollments
- Monitor course capacity
- Cancel student enrollments if needed
- View student information

## System Architecture

```
enrollment-app/
├── frontend/                   # Next.js 14 React application
│   ├── app/                   # App router (pages)
│   ├── components/admin       # Admin dashboard components
│   ├── components/student     # Student-facing components
│   ├── lib/api.ts            # API client
│   └── public/                # Static assets
│
├── backend/                   # Node.js/Express API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   │   ├── auth.ts       # Student authentication
│   │   │   ├── admin.ts      # Admin authentication
│   │   │   ├── courses.ts    # Course management
│   │   │   ├── enrollments.ts # Enrollment management
│   │   │   ├── dashboard.ts  # Admin dashboard data
│   │   │   └── ...
│   │   ├── middleware/       # Express middleware
│   │   ├── services/         # Business logic
│   │   │   └── emailService.ts # Email notifications
│   │   └── server.ts         # Entry point
│   │
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── package.json
│
└── docs/
    ├── GETTING_STARTED.md    # Installation guide
    ├── ADMIN_DASHBOARD.md    # Admin features
    └── AUTHENTICATION.md     # API & auth guide
```

## Project Structure

```
enrollment-app/
├── frontend/              # Next.js web application
│   ├── app/              # App router & pages
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and helpers
│   ├── public/           # Static assets
│   └── package.json
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Database models (Prisma)
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── server.ts     # Entry point
│   ├── prisma/           # Database schema
│   └── package.json
└── docs/                 # Documentation
```

## Quick Start

### For First-Time Setup

See [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md) for complete installation and configuration instructions.

### Quick Run

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin/login

## Course Schedule & Pricing

### Regular Recurring Classes

**Sunday Classes (Children & Family)**
- **Time**: 10:30 AM - 11:30 AM (1 hour)
- **Target**: Ages 5-14 (children), families welcome
- **Level**: Beginner
- **Price**: £8 (1 hour × £8/hour)
- **Capacity**: 20 students per class

**Thursday Classes (Adults)**
- **Beginner**: 6:30 PM - 7:30 PM (1 hour), £8, 20 students
- **Intermediate**: 6:30 PM - 7:30 PM (1 hour), £8, 20 students

### Special & Exceptional Courses

The application also supports:
- **Workshops**: Specialized topics (e.g., berimbau techniques, rhythms, history)
- **Special Events**: One-time classes, master classes, roda events
- **Seasonal Courses**: Intensive training, holiday programs

Special courses can be scheduled on any day/time and display prominently in the enrollment interface.

### 💷 Payment & 24h Cancellation Policy

- **Pricing**: £8 per hour (all courses)
- **Payment**: Due on the day of the course (cash or bank transfer) - no online payment
- **Cancellation**: Free cancellation up to 24 hours before class - no penalty

See [docs/PRICING_CANCELLATION.md](./docs/PRICING_CANCELLATION.md) for complete details.

## Documentation

### For Administrators
- [Admin Dashboard Guide](./docs/ADMIN_DASHBOARD.md) - Manage courses, view enrollments
- [Getting Started](./docs/GETTING_STARTED.md) - Installation and initial setup

### For Students
- [Student Guide](./docs/AUTHENTICATION.md) - Register, login, enroll in courses

### For Developers
- [API Documentation](./docs/AUTHENTICATION.md) - Complete API reference
- [Architecture](./README.md) - Project structure and technology stack

## Development

```bash
# Run all services with Docker
docker-compose up

# Or run individually
npm run dev:backend
npm run dev:frontend
```

## Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for production deployment instructions.

## Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - See LICENSE file

---

For more information, see the [Portal-Modelo](../) main project documentation.
