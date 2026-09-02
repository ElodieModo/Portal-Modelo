import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'efe8c89a1b25b9645c6508fea160fc4cac3d2d4b6f303a3e5dafd25bff952004d4e614f8fbb3a4c9dfbc34fbaea13071f27c77c6e2cd6ba4dcb5cfaaf77ee31b';
const CHILD_AGE_LIMIT = 14; // £6/session rate applies to participants this age or younger

// Get all enrollments
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: true,
        course: true,
        participants: true
      }
    });
    
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Create enrollment (authenticated students only)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, enrollmentDate, numberOfPeople = 1, participants } = req.body;

    // Validate numberOfPeople
    if (numberOfPeople < 1 || numberOfPeople > 6) {
      return res.status(400).json({ error: 'Number of people must be between 1 and 6' });
    }

    // Validate participants list (name + age required for each person)
    if (!Array.isArray(participants) || participants.length !== numberOfPeople) {
      return res.status(400).json({ error: `Please provide first name, last name and age for all ${numberOfPeople} participant(s)` });
    }

    for (const participant of participants) {
      const { firstName, lastName, age } = participant;
      if (!firstName?.trim() || !lastName?.trim() || age === undefined || age === null) {
        return res.status(400).json({ error: 'Each participant needs a first name, last name and age' });
      }
      if (typeof age !== 'number' || age < 0 || age > 120) {
        return res.status(400).json({ error: 'Participant age must be a valid number' });
      }
    }

    // Get student ID from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let studentId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      studentId = decoded.id;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check course capacity (count total numberOfPeople)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { enrollments: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const requestedDate = enrollmentDate ? new Date(enrollmentDate) : null;
    if (!requestedDate || Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({ error: 'Please choose a course date.' });
    }
    requestedDate.setHours(0, 0, 0, 0);
    const availableDates = course.date
      ? [course.date]
      : course.sessionDates;
    const isAvailableDate = availableDates.some(date => {
      const availableDate = new Date(date);
      availableDate.setHours(0, 0, 0, 0);
      return availableDate.getTime() === requestedDate.getTime();
    });
    if (!isAvailableDate) {
      return res.status(400).json({ error: 'This date is not available for the selected course.' });
    }

    const existing = await prisma.enrollment.findFirst({
      where: { studentId, courseId, enrollmentDate: requestedDate }
    });
    if (existing?.status === 'ACTIVE') {
      return res.status(400).json({ error: 'You are already enrolled for this date.' });
    }

    const priorEnrollmentCount = await prisma.enrollment.count({
      where: {
        studentId,
        status: { not: 'CANCELLED' }
      }
    });
    const isFreeTrial = priorEnrollmentCount === 0;

    const dateEnrollments = course.enrollments.filter(enrollment => {
      const existingDate = new Date(enrollment.enrollmentDate);
      existingDate.setHours(0, 0, 0, 0);
      return existingDate.getTime() === requestedDate.getTime() && enrollment.status === 'ACTIVE';
    });

    // Calculate total people already enrolled
    const totalEnrolled = dateEnrollments.reduce((sum, e) => sum + e.numberOfPeople, 0);
    
    if (totalEnrolled + numberOfPeople > course.maxStudents) {
      const availableSpots = course.maxStudents - totalEnrolled;
      return res.status(400).json({ 
        error: `Course capacity exceeded. Only ${availableSpots} spot(s) available, but ${numberOfPeople} person(s) requested.` 
      });
    }

    // Create enrollment along with its participants
    const enrollment = existing
      ? await prisma.enrollment.update({
          where: { id: existing.id },
          data: {
            status: 'ACTIVE',
            numberOfPeople,
            isFreeTrial,
            participants: {
              deleteMany: {},
              create: participants.map((p: { firstName: string; lastName: string; age: number }) => ({
                firstName: p.firstName.trim(),
                lastName: p.lastName.trim(),
                age: p.age
              }))
            }
          },
          include: {
            student: true,
            course: true,
            participants: true
          }
        })
      : await prisma.enrollment.create({
          data: {
            studentId,
            courseId,
            enrollmentDate: requestedDate,
            numberOfPeople,
            isFreeTrial,
            participants: {
              create: participants.map((p: { firstName: string; lastName: string; age: number }) => ({
                firstName: p.firstName.trim(),
                lastName: p.lastName.trim(),
                age: p.age
              }))
            }
          },
          include: {
            student: true,
            course: true,
            participants: true
          }
        });

    // Format course date and time for email
    const courseDate = course.date ? course.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : course.dayOfWeek;

    const courseTime = `${course.startTime} - ${course.endTime}`;
    const rates = { adult: course.pricePerHour, child: course.childPricePerHour, childAgeLimit: CHILD_AGE_LIMIT };
    const durationHours = emailService.calculateCourseDuration(courseTime);
    const pricing = isFreeTrial
      ? { lines: enrollment.participants.map((p: { firstName: string; lastName: string }) => ({ label: `${p.firstName} ${p.lastName}`, price: '0.00' })), total: '0.00' }
      : emailService.computePricing(enrollment.participants, durationHours, rates);

    // Send confirmation email to student with price info
    const studentEmailResult = await emailService.sendStudentEnrollmentConfirmation(
      student.email,
      `${student.firstName} ${student.lastName}`,
      course.name,
      courseDate || null,
      courseTime,
      rates,
      numberOfPeople,
      enrollment.participants,
      isFreeTrial
    );

    // Send notification to instructor with price info
    let instructorEmailResult: { success: boolean; message?: string; error?: string; messageId?: string } | null = null;
    const config = await prisma.config.findFirst();
    const instructorEmail = config?.instructorEmail || process.env.INSTRUCTOR_EMAIL;
    if (instructorEmail) {
      instructorEmailResult = await emailService.sendInstructorNotification(
        instructorEmail,
        `${student.firstName} ${student.lastName}`,
        student.email,
        course.name,
        courseDate || null,
        courseTime,
        rates,
        numberOfPeople,
        enrollment.participants,
        isFreeTrial
      );
    }

    const emailDeliveryStatus = {
      student: studentEmailResult,
      instructor: instructorEmailResult
    };

    const hasEmailIssue = !studentEmailResult.success || (instructorEmail && instructorEmailResult && !instructorEmailResult.success);

    res.status(201).json({
      message: hasEmailIssue
        ? 'Enrollment created successfully, but one or more emails could not be delivered.'
        : 'Enrollment successful. Confirmation email sent.',
      enrollment,
      pricing,
      emailDeliveryStatus
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(400).json({ error: 'You are already enrolled for this date.' });
    }
    res.status(500).json({ error: 'Failed to create enrollment' });
  }
});

// Cancel enrollment (student can only cancel 24h before course)
router.put('/:enrollmentId/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let studentId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      studentId = decoded.id;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: req.params.enrollmentId },
      include: {
        course: true,
        student: true
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Verify it's the student's own enrollment
    if (enrollment.studentId !== studentId) {
      return res.status(403).json({ error: 'You can only cancel your own enrollment' });
    }

    // Check if already cancelled
    if (enrollment.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Enrollment is already cancelled' });
    }

    // Calculate course datetime
    const now = new Date();
    let courseDateTime: Date;
    const [courseHours, courseMinutes] = enrollment.course.startTime.split(':').map(Number);

    if (enrollment.course.date) {
      // Special course with specific date
      courseDateTime = new Date(enrollment.course.date);
      courseDateTime.setHours(courseHours, courseMinutes, 0, 0);
    } else if (enrollment.course.sessionDates && enrollment.course.sessionDates.length > 0) {
      // Explicit list of session dates (irregular schedule) - use the next upcoming one
      const upcoming = enrollment.course.sessionDates
        .map((d: Date) => {
          const dt = new Date(d);
          dt.setHours(courseHours, courseMinutes, 0, 0);
          return dt;
        })
        .filter((dt: Date) => dt.getTime() >= now.getTime())
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());

      courseDateTime = upcoming[0] || new Date(enrollment.course.sessionDates[0]);
    } else {
      // Regular recurring course - calculate next occurrence
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const courseDay = days.indexOf(enrollment.course.dayOfWeek || 'Sunday');
      const todayDay = now.getDay();

      courseDateTime = new Date(now);
      if (courseDay > todayDay) {
        courseDateTime.setDate(now.getDate() + (courseDay - todayDay));
      } else if (courseDay < todayDay) {
        courseDateTime.setDate(now.getDate() + (7 - todayDay + courseDay));
      }

      courseDateTime.setHours(courseHours, courseMinutes, 0, 0);
    }

    // Check if cancellation is within 24 hours
    const hoursUntilCourse = (courseDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCourse < 24) {
      return res.status(400).json({
        error: `Cancellation is not permitted within 24 hours of the course. Course starts in ${Math.round(hoursUntilCourse)} hours.`,
        hoursUntilCourse: Math.round(hoursUntilCourse)
      });
    }

    // Cancel enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: req.params.enrollmentId },
      data: { status: 'CANCELLED' },
      include: {
        student: true,
        course: true
      }
    });

    const courseDate = enrollment.enrollmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const courseTime = `${enrollment.course.startTime} - ${enrollment.course.endTime}`;
    const studentEmailResult = await emailService.sendStudentCancellationConfirmation(
      enrollment.student.email,
      `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      enrollment.course.name,
      courseDate,
      courseTime
    );

    const config = await prisma.config.findFirst();
    const instructorEmail = config?.instructorEmail || process.env.INSTRUCTOR_EMAIL;
    const instructorEmailResult = instructorEmail
      ? await emailService.sendInstructorCancellationNotification(
          instructorEmail,
          `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          enrollment.student.email,
          enrollment.course.name,
          courseDate,
          courseTime,
          enrollment.numberOfPeople
        )
      : null;

    res.json({
      message: 'Enrollment cancelled successfully',
      enrollment: updatedEnrollment,
      emailDeliveryStatus: {
        student: studentEmailResult,
        instructor: instructorEmailResult
      }
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel enrollment' });
  }
});

module.exports = router;
