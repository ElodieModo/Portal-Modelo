import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, adminOnly } from '../middleware/auth';
import { emailService } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();
const CHILD_AGE_LIMIT = 14;

/**
 * Get enrollment statistics
 */
router.get('/stats', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const totalCourses = await prisma.course.count();
    const totalStudents = await prisma.student.count();
    const totalEnrollments = await prisma.enrollment.count();
    const activeEnrollments = await prisma.enrollment.count({
      where: { status: 'ACTIVE' }
    });

    // Calculate total sessions (dates)
    const allCourses = await prisma.course.findMany({
      select: { date: true, sessionDates: true }
    });
    const totalSessions = allCourses.reduce((sum, course) => {
      const dates = course.date ? 1 : (course.sessionDates?.length || 0);
      return sum + (dates > 0 ? dates : 1); // Count at least 1 if no specific date
    }, 0);

    const courseStats = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        type: true,
        dayOfWeek: true,
        date: true,
        sessionDates: true,
        maxStudents: true,
        enrollments: {
          select: {
            id: true,
            status: true,
            numberOfPeople: true,
            enrollmentDate: true,
            student: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    const coursesWithStats = courseStats.map(course => {
      const activeEnrollments = course.enrollments.filter(e => e.status === 'ACTIVE');
      const totalEnrolledPeople = activeEnrollments.reduce((sum, e) => sum + e.numberOfPeople, 0);
      
      return {
        ...course,
        enrolled: activeEnrollments.length,
        enrolledPeople: totalEnrolledPeople,
        available: course.maxStudents - totalEnrolledPeople
      };
    });

    res.json({
      totalCourses,
      totalSessions,
      totalStudents,
      totalEnrollments,
      activeEnrollments,
      courses: coursesWithStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * Get all enrollments with details
 */
router.get('/enrollments', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            age: true
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            level: true,
            type: true,
            dayOfWeek: true,
            date: true,
            startTime: true,
            endTime: true
          }
        },
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            age: true
          }
        }
      },
      orderBy: [
        { course: { name: 'asc' } },
        { enrolledAt: 'desc' }
      ]
    });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

/**
 * Get active enrollments with the amount expected for finance tracking
 */
router.get('/finance', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { status: 'ACTIVE' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        course: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            pricePerHour: true,
            childPricePerHour: true
          }
        },
        participants: { select: { id: true, firstName: true, lastName: true, age: true } }
      },
      orderBy: [{ enrollmentDate: 'asc' }, { enrolledAt: 'asc' }]
    });

    const financeEnrollments = enrollments.map(enrollment => {
      const durationHours = emailService.calculateCourseDuration(
        `${enrollment.course.startTime} - ${enrollment.course.endTime}`
      );
      const pricing = enrollment.isFreeTrial || enrollment.paymentWaived
        ? { total: '0.00' }
        : emailService.computePricing(enrollment.participants, durationHours, {
            adult: enrollment.course.pricePerHour,
            child: enrollment.course.childPricePerHour,
            childAgeLimit: CHILD_AGE_LIMIT
          });

      return {
        id: enrollment.id,
        enrollmentDate: enrollment.enrollmentDate,
        enrolledAt: enrollment.enrolledAt,
        paymentReceived: enrollment.paymentReceived,
        isFreeTrial: enrollment.isFreeTrial,
        paymentWaived: enrollment.paymentWaived,
        student: enrollment.student,
        course: enrollment.course,
        participants: enrollment.participants,
        expectedAmount: pricing.total === 'TBD' ? 0 : Number(pricing.total)
      };
    });

    res.json(financeEnrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch finance data' });
  }
});

router.get('/finance/expenses', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

router.post('/finance/expenses', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { category, description, amount, date } = req.body;
    const parsedAmount = typeof amount === 'number' ? amount : Number(amount);

    if (!['ROOM', 'EQUIPMENT', 'MISCELLANEOUS'].includes(category)) {
      return res.status(400).json({ error: 'Invalid expense category' });
    }
    if (typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Expense description is required' });
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Expense amount must be greater than zero' });
    }

    const expenseDate = date ? new Date(date) : new Date();
    if (Number.isNaN(expenseDate.getTime())) {
      return res.status(400).json({ error: 'Invalid expense date' });
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        description: description.trim(),
        amount: parsedAmount,
        date: expenseDate
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

router.delete('/finance/expenses/:expenseId', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.expenseId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

/**
 * Mark an enrollment payment as received or pending
 */
router.put('/finance/:enrollmentId/payment', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { received } = req.body;
    if (typeof received !== 'boolean') {
      return res.status(400).json({ error: 'Payment status must be a boolean' });
    }

    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.enrollmentId },
      data: { paymentReceived: received },
      select: { id: true, paymentReceived: true }
    });

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

/**
 * Mark an enrollment as free or payable
 */
router.put('/finance/:enrollmentId/free', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { free } = req.body;
    if (typeof free !== 'boolean') {
      return res.status(400).json({ error: 'Free status must be a boolean' });
    }

    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.enrollmentId },
      data: { paymentWaived: free },
      select: { id: true, paymentWaived: true }
    });

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update free status' });
  }
});

/**
 * Get enrollments for a specific course
 */
router.get('/enrollments/course/:courseId', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: req.params.courseId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            age: true
          }
        },
        course: true
      },
      orderBy: { enrolledAt: 'desc' }
    });

    const course = await prisma.course.findUnique({
      where: { id: req.params.courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      course,
      enrollments,
      total: enrollments.length,
      available: course.maxStudents - enrollments.filter(e => e.status === 'ACTIVE').length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course enrollments' });
  }
});

/**
 * Cancel an enrollment (admin - no time restriction)
 */
router.delete('/enrollments/:enrollmentId', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.enrollmentId },
      data: { status: 'CANCELLED' },
      include: {
        student: true,
        course: true
      }
    });

    res.json({
      message: 'Enrollment cancelled by admin',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel enrollment' });
  }
});

/**
 * Get all students with their enrollments
 */
router.get('/students', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthDate: true,
        age: true,
        verified: true,
        createdBy: true,
        createdAt: true,
        enrollments: {
          include: {
            course: true
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

module.exports = router;
