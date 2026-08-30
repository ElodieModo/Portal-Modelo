import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all students
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        enrollments: true
      }
    });
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Register new student
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { email, firstName, lastName, phone, birthDate, age, password } = req.body;

    // Check if student already exists
    const existing = await prisma.student.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ error: 'Student already registered' });
    }

    const student = await prisma.student.create({
      data: {
        email,
        password: await bcrypt.hash(password || crypto.randomUUID(), 10),
        firstName,
        lastName,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        age,
        createdBy: 'ADMIN_MANUAL_CREATION'
      }
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register student' });
  }
});

// Get student by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        enrollments: {
          include: {
            course: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

module.exports = router;
