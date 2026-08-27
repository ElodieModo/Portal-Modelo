'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { COURSE_GROUPS, CourseGroup, groupCoursesByCategory } from '@/lib/courseCategories';
import CourseForm from './CourseForm';

export default function CourseList() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [activeGroup, setActiveGroup] = useState<'All' | CourseGroup>('All');
  const [enrollmentDetails, setEnrollmentDetails] = useState<any>(null);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const response = await apiClient.getAllCourses();
    if (!response.error) {
     setCourses(Array.isArray(response.data) ? response.data : []);
    }
    setLoading(false);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    const response = await apiClient.deleteCourse(courseId);
    if (!response.error) {
      setCourses(courses.filter(c => c.id !== courseId));
      alert('Class deleted successfully');
    } else {
      alert(`Error: ${response.error}`);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCourse(null);
    fetchCourses();
  };

  const handleViewEnrollments = async (courseId: string) => {
    setEnrollmentsLoading(true);
    setEnrollmentDetails(null);

    const response = await apiClient.getCourseEnrollments(courseId);
    if (!response.error) {
      setEnrollmentDetails(response.data);
    } else {
      alert(`Error: ${response.error}`);
    }

    setEnrollmentsLoading(false);
  };

  if (loading) return <p className="text-center text-gray-600">Loading classes...</p>;

  const groupedCourses = groupCoursesByCategory(
    courses,
    (course: any) => ({
      category: course.category,
      type: course.type,
      level: course.level,
      name: course.name,
    }),
    (course: any) => course.date || course.sessionDates?.[0] || course.dayOfWeek || undefined
  );

  const visibleGroups = activeGroup === 'All'
    ? groupedCourses
    : groupedCourses.filter(({ group }) => group === activeGroup);

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingCourse(null);
            setShowForm(true);
          }}
          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition font-semibold"
        >
          ➕ Add New Class
        </button>
      </div>

      {showForm && (
        <CourseForm
          course={editingCourse}
          onClose={handleFormClose}
        />
      )}

      {enrollmentsLoading && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Loading enrollments...
        </div>
      )}

      {enrollmentDetails && (
        <div className="mb-6 overflow-hidden rounded-lg border border-amber-200 bg-white shadow">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-100 bg-amber-50 p-4">
            <div>
              <h2 className="text-xl font-bold text-amber-900">
                Enrollments: {enrollmentDetails.course.name}
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                {enrollmentDetails.total} enrolled · {enrollmentDetails.available} spots available
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnrollmentDetails(null)}
              className="text-sm font-semibold text-amber-700 hover:text-amber-900"
            >
              Close
            </button>
          </div>

          {enrollmentDetails.enrollments.length === 0 ? (
            <p className="p-4 text-sm text-gray-600">No enrollments for this course yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollmentDetails.enrollments.map((enrollment: any) => (
                    <tr key={enrollment.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-800">
                        {enrollment.student.firstName} {enrollment.student.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{enrollment.student.email}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {enrollment.student.phone || 'Not provided'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          enrollment.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 space-y-6">
          {visibleGroups.map(({ group, items }: { group: string; items: any[] }) => (
            <div key={group} className="space-y-4">
              <h2 className="text-xl font-bold text-amber-800 border-b border-amber-200 pb-2">{group}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.flatMap((course: any) => {
                  const dates = course.date ? [course.date] : (course.sessionDates || []);
                  const entries = dates.length > 0
                    ? dates.map((date: string) => ({ course, date }))
                    : [{ course, date: course.dayOfWeek || 'Date not set' }];

                  return entries.map(({ course: itemCourse, date }: { course: any; date: string }) => (
                    <div key={`${itemCourse.id}-${date}`} className="border rounded-lg p-4 hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{itemCourse.name}</h3>
                          <p className="text-sm text-gray-600">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mr-2 ${
                              itemCourse.type === 'REGULAR' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {itemCourse.type}
                            </span>
                            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                              {itemCourse.category || itemCourse.level}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCourse(itemCourse);
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(itemCourse.id)}
                            className="text-red-600 hover:text-red-800 px-3 py-1 text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 space-y-1 mb-3">
                        <p>📅 <strong>{date === 'Date not set' || itemCourse.type === 'REGULAR' && date === itemCourse.dayOfWeek
                          ? date
                          : new Date(date).toLocaleDateString()}</strong></p>
                        <p>⏰ {itemCourse.startTime} - {itemCourse.endTime}</p>
                        <p>👥 {itemCourse.maxStudents} spots</p>
                      </div>

                      {itemCourse.description && (
                        <p className="text-sm text-gray-600 italic border-t pt-2">{itemCourse.description}</p>
                      )}

                      <div className="mt-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleViewEnrollments(itemCourse.id)}
                          className="text-amber-600 hover:text-amber-800 text-sm font-semibold"
                        >
                          View Enrollments →
                        </button>
                      </div>
                    </div>
                  ));
                })}
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            <p className="text-lg">No classes yet</p>
            <p className="text-sm mt-2">Click &quot;Add New Class&quot; to create your first class</p>
          </div>
        )}
      </div>
    </div>
  );
}
