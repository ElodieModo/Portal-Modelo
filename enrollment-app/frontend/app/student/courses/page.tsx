'use client';

import { useEffect, useState } from 'react';
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

  const loadCourses = async () => {
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
  };

  useEffect(() => {
    loadCourses();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50">
      {student && <StudentHeader student={student} onLogout={handleLogout} />}
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">Available Classes</h1>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveGroup('All')}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
              activeGroup === 'All'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
            }`}
          >
            All
          </button>
          {COURSE_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setActiveGroup(group)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                activeGroup === group
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-600">Loading classes...</p>
        ) : (
          <div className="space-y-6">
            {visibleGroups.map(({ group, items }) => (
              <div key={group} className="space-y-4">
                <h2 className="text-xl font-bold text-amber-800 border-b border-amber-200 pb-2">{group}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((course) => (
                    <div key={course.id} className="bg-white rounded-lg shadow p-5">
                      {(() => {
                        const isBooked = bookedCourseDates.has(getCourseDateKey(course.id, course.enrollmentDate));

                        return (
                          <>
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-lg font-bold text-gray-800">{course.name}</h2>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-800">
                          {getCourseGroupLabel(course)}
                        </span>
                      </div>
                      {course.description && <p className="text-gray-600 text-sm mb-2">{course.description}</p>}
                      <p className="text-gray-700 text-sm">
                        📅 {new Date(course.enrollmentDate).toLocaleDateString('en-GB')} · ⏰ {course.startTime} - {course.endTime}
                      </p>
                      <p className="text-gray-700 text-sm">💷 £{course.pricePerHour}/hour (adult) · £{course.childPricePerHour}/hour (14 & under)</p>
                      <button
                        onClick={() => setSelectedCourse(course)}
                        disabled={isBooked}
                        className={`mt-4 w-full text-white font-bold py-2 rounded-lg transition disabled:cursor-not-allowed ${
                          isBooked
                            ? 'bg-blue-600 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        {isBooked ? 'Already booked' : 'Book this class'}
                      </button>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
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

