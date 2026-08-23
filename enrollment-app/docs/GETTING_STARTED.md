# Getting Started Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Backend Setup

### 1. Install Dependencies

```bash
cd enrollment-app/backend
npm install
```

### 2. Configure Database

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/capoeira_enrollment"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Email (SMTP Configuration)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Capoeira Enrollment
INSTRUCTOR_EMAIL=instructor@example.com
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Optional: Seed with test data
npx prisma studio  # GUI to add data manually
```

### 4. Create First Admin User

You can create an admin user directly via API or database:

**Option A: Via API (after starting server)**

```bash
# Start backend server (see step 5)
# Then in another terminal:

curl -X POST http://localhost:5000/api/admin/auth/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "name": "Admin Name"
  }'
```

**Option B: Via Database (direct)**

```bash
npx prisma studio
# Open the 'users' table and add a new record
# Use bcryptjs to hash password first
```

**Option C: Via Node Script**

```bash
node -e "
const bcrypt = require('bcryptjs');
const password = process.argv[1];
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
" "YourPassword123"
```

Then insert into database:
```sql
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'user_' || gen_random_uuid(),
  'admin@example.com',
  'hashed_password_here',
  'Administrator',
  'ADMIN',
  NOW(),
  NOW()
);
```

### 5. Start Backend Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 6. Verify Backend

```bash
curl http://localhost:5000/health
# Response: {"status":"ok"}
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd enrollment-app/frontend
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Capoeira Enrollment
NEXT_PUBLIC_APP_LANGUAGE=en
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will start on `http://localhost:3000`

## First Run Checklist

### Backend
- [ ] Install dependencies
- [ ] Create `.env` file with database credentials
- [ ] Run `npx prisma migrate dev`
- [ ] Create admin user
- [ ] Start backend server
- [ ] Verify `/health` endpoint

### Frontend
- [ ] Install dependencies
- [ ] Create `.env.local` file
- [ ] Start development server

### Admin Setup
- [ ] Navigate to `http://localhost:3000/admin/login`
- [ ] Login with admin credentials
- [ ] View dashboard (should show 0 courses, 0 students)
- [ ] Create your first course

## Create Your First Course

1. **Login to Admin Dashboard**
   - URL: `http://localhost:3000/admin/login`
   - Use your admin credentials

2. **Go to Courses Tab**
   - Click the "📅 Courses" tab

3. **Click "➕ Add New Course"**

4. **Fill in Course Details for Sunday Class:**
   - Name: "Children & Family Class"
   - Level: "CHILDREN"
   - Type: "REGULAR"
   - Day: "Sunday"
   - Start Time: "10:30"
   - End Time: "11:30"
   - Price per Hour: "8"
   - Max Students: 20

5. **Click "Create Course"**

See [DEFAULT_COURSES.md](./DEFAULT_COURSES.md) for all default courses to create.

## Test Student Registration

1. **Navigate to Student Registration**
   - Open `http://localhost:3000` (or create a student page)

2. **Register New Student**
   ```
   Email: student@example.com
   Password: password123
   First Name: João
   Last Name: Silva
   ```

3. **Login as Student**
   - Use the credentials above

4. **Enroll in Course**
   - Click on "Sunday Children & Family Class"
   - Click "Enroll"
   - Check email for confirmation

5. **View Admin Dashboard**
   - Login as admin
   - Check statistics (1 student, 1 enrollment)
   - View course details (1 enrolled, 19 spots available)

## Email Configuration

### Using Gmail

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2FA

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the 16-character password

3. **Update `.env`:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

### Using Other Email Providers

Configure according to your provider's SMTP settings:

| Provider | Host | Port | Secure |
|----------|------|------|--------|
| Gmail | smtp.gmail.com | 587 | false |
| Outlook | smtp.office365.com | 587 | false |
| SendGrid | smtp.sendgrid.net | 587 | false |
| AWS SES | email-smtp.region.amazonaws.com | 587 | false |

## Development Commands

### Backend

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Run linter
npm run lint

# Database management
npx prisma studio           # Open GUI
npx prisma migrate dev      # Create migration
npx prisma db push         # Sync with database
```

### Frontend

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Troubleshooting

### Database Connection Error

```
Error: getaddrinfo ENOTFOUND localhost:5432
```

**Solution:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format is correct
- Verify database exists

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution:**
```bash
# Kill process using port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Email Not Sending

- Check SMTP credentials in `.env`
- Verify Gmail app password (not regular password)
- Check email doesn't have special characters in password
- Look at server logs for error messages

### CORS Error in Frontend

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check both are using same protocol (http/https)
- Verify API_URL in frontend `.env.local` is correct

## Docker Setup (Optional)

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: capoeira_enrollment
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/capoeira_enrollment

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up
```

## Next Steps

- Read [Admin Dashboard Guide](./ADMIN_DASHBOARD.md)
- Read [Student Authentication Guide](./AUTHENTICATION.md)
- Explore the [README](../README.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the relevant documentation
3. Check backend logs: `npm run dev`
4. Check frontend console: Browser DevTools (F12)
