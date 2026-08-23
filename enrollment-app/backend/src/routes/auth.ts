import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface StudentAuthRequest extends AuthRequest {
  student?: {
    id: string;
    email: string;
  };
}

/**
 * Register a new student
 */
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, birthDate, age } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existing = await prisma.student.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await prisma.student.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        age,
        verified: true // In production, you might require email verification
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: student.id, email: student.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const emailDeliveryStatus = await emailService.sendStudentWelcomeEmail(
      student.email,
      `${student.firstName} ${student.lastName}`
    );

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      emailDeliveryStatus,
      student: {
        id: student.id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register student' });
  }
});

/**
 * Login student
 */
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student.id, email: student.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      student: {
        id: student.id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * Get current student profile
 */
router.get('/me', async (req: StudentAuthRequest, res: Response) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const student = await prisma.student.findUnique({
      where: { id: decoded.id },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            course: true,
            participants: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      id: student.id,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      birthDate: student.birthDate,
      age: student.age,
      enrollments: student.enrollments
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * Update student profile
 */
router.put('/profile', async (req: StudentAuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { firstName, lastName, phone, age } = req.body;

    const student = await prisma.student.update({
      where: { id: decoded.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        age: age || undefined
      }
    });

    res.json({
      message: 'Profile updated successfully',
      student: {
        id: student.id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
