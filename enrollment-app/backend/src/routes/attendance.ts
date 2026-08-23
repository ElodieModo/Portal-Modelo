import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Record attendance
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { enrollmentId, studentId, date, present, notes } = req.body;

    const attendance = await prisma.attendance.create({
      data: {
        enrollmentId,
        studentId,
        date: new Date(date),
        present,
        notes
      }
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Get attendance records for a student
router.get('/student/:studentId', async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId: req.params.studentId },
      include: {
        enrollment: {
          include: {
            course: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

module.exports = router;
