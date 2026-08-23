'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import EnrollmentModal from '@/components/student/EnrollmentModal';
import StudentHeader from '@/components/student/StudentHeader';
import { COURSE_GROUPS, CourseGroup, getCourseGroupLabel, groupCoursesByCategory } from '@/lib/courseCategories';

interface Course {
  id: string;
  name: string;
  description?: string;
  level: string;
  type: string;
  dayOfWeek?: string;
  date?: string;
  sessionDates?: string[];
  startTime: string;
  endTime: string;
  pricePerHour: number;
  childPricePerHour: number;
  maxStudents: number;
  location?: string;
  category?: string;
  enrollmentDate: string;
}

export default function StudentCoursesPage() {
  const router = useRouter();
  const [student, setStudent] = useState<{ firstName: string; lastName: string } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [bookedCourseDates, setBookedCourseDates] = useState<Set<string>>(new Set());
  const [activeGroup, setActiveGroup] = useState<'All' | CourseGroup>('All');

  const getCourseDateKey = (courseId: string, enrollmentDate: string) => (
    `${courseId}-${new Date(enrollmentDate).toISOString().slice(0, 10)}`
  );

  const loadCourses = useCallback(async () => {
    setLoading(true);
    const [coursesResponse, profileResponse] = await Promise.all([
      apiClient.getAllCourses(),
      apiClient.getStudentProfile(),
    ]);

    if (!coursesResponse.error) {
      const availableCourses = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
      const datedCourses = availableCourses.flatMap((course: Course) => {
        const dates = course.date ? [course.date] : (course.sessionDates || []);
        return dates.map((enrollmentDate) => ({ ...course, enrollmentDate }));
      });

      const uniqueDates = new Set<string>();
      setCourses(datedCourses.filter((course: Course) => {
        const dateKey = new Date(course.enrollmentDate).toISOString().slice(0, 10);
        if (uniqueDates.has(dateKey)) return false;
        uniqueDates.add(dateKey);
        return true;
      }));
    }

    if (!profileResponse.error) {
      const profile = profileResponse.data as {
        firstName: string;
        lastName: string;
        enrollments?: { status: string; courseId: string; enrollmentDate: string }[];
      };
      setStudent({ firstName: profile.firstName, lastName: profile.lastName });
      setBookedCourseDates(new Set(
        profile.enrollments
          ?.filter((enrollment) => enrollment.status === 'ACTIVE')
          .map((enrollment) => getCourseDateKey(enrollment.courseId, enrollment.enrollmentDate))
          || []
      ));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleBookingSuccess = (totalPrice?: string) => {
    if (selectedCourse) {
      setBookedCourseDates((current) => new Set([
        ...current,
        getCourseDateKey(selectedCourse.id, selectedCourse.enrollmentDate),
      ]));
    }
    setSelectedCourse(null);
    setSuccessMessage(
      totalPrice
        ? `Booking confirmed! Total price: £${totalPrice}. Check your email for details.`
        : 'Booking confirmed! Check your email for details.'
    );
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const groupedCourses = groupCoursesByCategory(
    courses,
    (course) => ({
      category: course.category,
      type: course.type,
      level: course.level,
      name: course.name,
    }),
    (course) => course.enrollmentDate
  );

  const visibleGroups = activeGroup === 'All'
    ? groupedCourses
    : groupedCourses.filter(({ group }) => group === activeGroup);

  const handleLogout = () => {
    apiClient.clearToken();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,196,0,0.12),_transparent_30%),radial-gradient(circle_at_left,_rgba(0,122,63,0.08),_transparent_24%),linear-gradient(180deg,_#ffffff_0%,_#f5f8fb_100%)]">
      {student && <StudentHeader student={student} onLogout={handleLogout} />}

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-5 sm:mb-6">
          <div>
            <p className="eyebrow mb-2">Classes</p>
            <h1 className="text-3xl font-black text-[#061b36] sm:text-4xl">Available Classes</h1>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {successMessage}
          </div>
        )}

        <div className="mb-6 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            <button
              type="button"
              onClick={() => setActiveGroup('All')}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                activeGroup === 'All'
                  ? 'border-[#007a3f] bg-[#007a3f] text-white shadow-md shadow-[#007a3f]/20'
                  : 'border-[#d9e1ea] bg-white text-[#061b36] hover:bg-[#f0faf4]'
              }`}
            >
              All
            </button>
            {COURSE_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setActiveGroup(group)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  activeGroup === group
                    ? 'border-[#007a3f] bg-[#007a3f] text-white shadow-md shadow-[#007a3f]/20'
                    : 'border-[#d9e1ea] bg-white text-[#061b36] hover:bg-[#f0faf4]'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#e7dfd5] bg-white/80 p-6 text-center text-sm font-medium text-[#64716c] shadow-sm">
            Loading classes...
          </div>
        ) : (
          <div className="space-y-6">
            {visibleGroups.map(({ group, items }) => (
              <div key={group} className="space-y-4">
                <h2 className="border-b border-[#d9e1ea] pb-2 text-xl font-black text-[#061b36]">{group}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((course) => {
                    const isBooked = bookedCourseDates.has(getCourseDateKey(course.id, course.enrollmentDate));

                    return (
                      <article key={course.id} className="flex h-full flex-col rounded-2xl border border-[#d9e1ea] bg-white/90 p-4 shadow-sm shadow-[#061b36]/5 sm:p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h3 className="text-lg font-black text-[#061b36]">{course.name}</h3>
                          <span className="rounded-full bg-[#fff9df] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8a6800]">
                            {getCourseGroupLabel(course)}
                          </span>
                        </div>

                        {course.description && (
                          <p className="mb-3 text-sm leading-6 text-[#526174]">{course.description}</p>
                        )}

                        <div className="space-y-2 text-sm text-[#0c2b4d]">
                          <p>📅 {new Date(course.enrollmentDate).toLocaleDateString('en-GB')}</p>
                          <p>⏰ {course.startTime} - {course.endTime}</p>
                          <p>💷 £{course.pricePerHour}/hour (adult) · £{course.childPricePerHour}/hour (14 & under)</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedCourse(course)}
                          disabled={isBooked}
                          className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-black transition ${
                            isBooked
                              ? 'cursor-not-allowed bg-[#dbe7e4] text-[#153f35]'
                              : 'bg-[#007a3f] text-white shadow-md shadow-[#007a3f]/20 hover:bg-[#005f32]'
                          }`}
                        >
                          {isBooked ? 'Already booked' : 'Book this class'}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="rounded-2xl border border-[#e7dfd5] bg-white/80 p-6 text-center text-[#64716c] shadow-sm">
                No classes available right now.
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCourse && (
        <EnrollmentModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

