import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, adminOnly, authenticate } from '../middleware/auth';

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

router.post('/manual', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, date, studentName, age, amount, notes } = req.body;

    if (!courseId || !date || !studentName || !studentName.trim()) {
      return res.status(400).json({ error: 'Course, date and student name are required.' });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ error: 'A valid payment amount is required.' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const manualAttendance = await prisma.manualAttendance.create({
      data: {
        courseId,
        date: new Date(date),
        studentName: studentName.trim(),
        age: age === undefined || age === null || age === '' ? null : Number(age),
        amount: parsedAmount,
        notes: notes?.trim() || null
      },
      include: {
        course: true
      }
    });

    res.status(201).json(manualAttendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record manual attendance' });
  }
});

router.put('/manual/:attendanceId', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, date, studentName, age, amount, notes } = req.body;

    if (!courseId || !date || !studentName || !studentName.trim()) {
      return res.status(400).json({ error: 'Course, date and student name are required.' });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ error: 'A valid payment amount is required.' });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'A valid date is required.' });
    }

    const parsedAge = age === undefined || age === null || age === '' ? null : Number(age);
    if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 120)) {
      return res.status(400).json({ error: 'Age must be between 0 and 120.' });
    }

    const attendance = await prisma.manualAttendance.update({
      where: { id: req.params.attendanceId },
      data: {
        courseId,
        date: parsedDate,
        studentName: studentName.trim(),
        age: parsedAge,
        amount: parsedAmount,
        notes: notes?.trim() || null
      },
      include: { course: true }
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update manual attendance' });
  }
});

router.delete('/manual/:attendanceId', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.manualAttendance.delete({ where: { id: req.params.attendanceId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete manual attendance' });
  }
});

router.get('/manual', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.manualAttendance.findMany({
      include: {
        course: true
      },
      orderBy: { date: 'desc' }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manual attendance' });
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
