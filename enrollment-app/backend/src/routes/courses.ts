import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, adminOnly } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all courses
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        enrollments: true
      },
      orderBy: [
        { type: 'asc' },
        { dayOfWeek: 'asc' },
        { date: 'desc' }
      ]
    });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get special/exceptional courses only
router.get('/special/upcoming', async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const specialCourses = await prisma.course.findMany({
      where: {
        type: { in: ['SPECIAL', 'WORKSHOP'] },
        date: {
          gte: today
        }
      },
      include: {
        enrollments: true
      },
      orderBy: { date: 'asc' }
    });
    
    res.json(specialCourses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch special courses' });
  }
});

// Get regular/recurring courses only
router.get('/regular', async (req: AuthRequest, res: Response) => {
  try {
    const regularCourses = await prisma.course.findMany({
      where: {
        type: 'REGULAR'
      },
      include: {
        enrollments: true
      },
      orderBy: { dayOfWeek: 'asc' }
    });
    
    res.json(regularCourses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch regular courses' });
  }
});

// Get course by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        enrollments: {
          include: {
            student: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course (admin only)
router.post('/', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, 
      description, 
      category,
      level, 
      type,           // "REGULAR" or "SPECIAL" or "WORKSHOP"
      dayOfWeek,      // For regular courses
      startTime, 
      endTime, 
      date,           // For special courses
      sessionDates,   // Explicit list of dates this course actually runs (optional, for irregular schedules)
      location,
      maxStudents 
    } = req.body;

    // Validation: REGULAR courses need dayOfWeek, SPECIAL courses need date
    if (type === 'REGULAR' && !dayOfWeek) {
      return res.status(400).json({ error: 'Regular courses must have a dayOfWeek' });
    }
    if (type === 'SPECIAL' && !date) {
      return res.status(400).json({ error: 'Special courses must have a specific date' });
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        category: category || 'General',
        level,
        type: type || 'REGULAR',
        dayOfWeek: type === 'SPECIAL' ? null : dayOfWeek,
        startTime,
        endTime,
        date: date ? new Date(date) : null,
        sessionDates: Array.isArray(sessionDates) ? sessionDates.map((d: string) => new Date(d)) : [],
        location,
        maxStudents: maxStudents || 20
      }
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course (admin only)
router.put('/:id', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionDates, date, ...rest } = req.body;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(date !== undefined ? { date: date ? new Date(date) : null } : {}),
        ...(sessionDates !== undefined
          ? { sessionDates: Array.isArray(sessionDates) ? sessionDates.map((d: string) => new Date(d)) : [] }
          : {})
      }
    });

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course (admin only)
router.delete('/:id', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    // Check if course has active enrollments
    const enrollments = await prisma.enrollment.count({
      where: {
        courseId: req.params.id,
        status: 'ACTIVE'
      }
    });

    if (enrollments > 0) {
      return res.status(400).json({ 
        error: `Cannot delete course with ${enrollments} active enrollment(s). Cancel enrollments first.` 
      });
    }

    await prisma.course.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
