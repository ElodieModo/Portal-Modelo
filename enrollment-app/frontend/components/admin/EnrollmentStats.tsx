'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { COURSE_GROUPS, getCourseGroupLabel } from '@/lib/courseCategories';

const getDateSortValue = (date: string | null) => {
  if (!date) return 0;

  const datePart = date.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return 0;

  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const formatDate = (date: string) => {
  const datePart = date.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : 'Date pending';
};

const todaySortValue = (() => {
  const today = new Date();
  return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
})();

export default function EnrollmentStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'student'>('date');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [studentFilter, setStudentFilter] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      const response = await apiClient.getDashboardStats();
      if (!response.error) {
        setStats(response.data);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const courseDates = (stats?.courses || [])
    .flatMap((course: any) => {
      const dates = course.date ? [course.date] : (course.sessionDates || []);
      return dates.length > 0
        ? dates.map((date: string) => ({ course, date }))
        : [{ course, date: null }];
    })
    .map(({ course, date }: { course: any; date: string | null }) => ({
      course,
      date,
      category: getCourseGroupLabel(course),
    }));

  const sortedCourseDates = useMemo(() => courseDates
    .filter(({ course, category }: { course: any; category: string }) => {
      const matchesCategory = categoryFilter === 'All' || category === categoryFilter;
      const search = studentFilter.trim().toLowerCase();
      const matchesStudent = !search || course.enrollments.some((enrollment: any) => (
        `${enrollment.student?.firstName || ''} ${enrollment.student?.lastName || ''}`
          .toLowerCase()
          .includes(search)
      ));
      return matchesCategory && matchesStudent;
    })
    .sort((first: any, second: any) => {
      if (sortBy === 'category') {
        return first.category.localeCompare(second.category) || first.course.name.localeCompare(second.course.name);
      }

      if (sortBy === 'student') {
        const firstStudent = first.course.enrollments
          .map((enrollment: any) => `${enrollment.student?.firstName || ''} ${enrollment.student?.lastName || ''}`)
          .sort()[0] || '';
        const secondStudent = second.course.enrollments
          .map((enrollment: any) => `${enrollment.student?.firstName || ''} ${enrollment.student?.lastName || ''}`)
          .sort()[0] || '';
        return firstStudent.localeCompare(secondStudent);
      }

      const firstValue = getDateSortValue(first.date);
      const secondValue = getDateSortValue(second.date);
      const firstIsUpcoming = firstValue >= todaySortValue;
      const secondIsUpcoming = secondValue >= todaySortValue;

      if (firstIsUpcoming !== secondIsUpcoming) {
        return firstIsUpcoming ? -1 : 1;
      }

      return firstIsUpcoming
        ? firstValue - secondValue
        : secondValue - firstValue;
    }),
  [courseDates, categoryFilter, sortBy, studentFilter]);

  if (loading) return <p className="text-center text-gray-600">Loading statistics...</p>;

  if (!stats) return <p className="text-center text-red-600">Failed to load statistics</p>;

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-amber-600">{stats.totalCourses}</div>
          <p className="text-gray-600 mt-2">Total Courses</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-orange-600">{stats.totalSessions}</div>
          <p className="text-gray-600 mt-2">Total Sessions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div>
          <p className="text-gray-600 mt-2">Total Students</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">{stats.activeEnrollments}</div>
          <p className="text-gray-600 mt-2">Active Enrollments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-purple-600">{stats.totalEnrollments}</div>
          <p className="text-gray-600 mt-2">Total Enrollments</p>
        </div>
      </div>

      {/* Courses Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label htmlFor="overview-sort" className="block text-sm font-semibold text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="overview-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'date' | 'category' | 'student')}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="date">Date (next first)</option>
              <option value="category">Category</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div>
            <label htmlFor="overview-category" className="block text-sm font-semibold text-gray-700 mb-1">
              Category
            </label>
            <select
              id="overview-category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="All">All categories</option>
              {COURSE_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="overview-student" className="block text-sm font-semibold text-gray-700 mb-1">
              Student
            </label>
            <input
              id="overview-student"
              type="search"
              value={studentFilter}
              onChange={(event) => setStudentFilter(event.target.value)}
              placeholder="Search by name"
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-4">Course Status</h2>
        <div className="space-y-3">
          {sortedCourseDates.map(({ course, date }: { course: any; date: string | null }) => {
            const dateKey = date ? date.slice(0, 10) : null;
            const dateEnrollments = dateKey
              ? course.enrollments.filter((enrollment: any) => (
                enrollment.status === 'ACTIVE' &&
                enrollment.enrollmentDate.slice(0, 10) === dateKey
              ))
              : course.enrollments.filter((enrollment: any) => enrollment.status === 'ACTIVE');
            const enrolledPeople = dateEnrollments.reduce(
              (total: number, enrollment: any) => total + enrollment.numberOfPeople,
              0
            );
            const availableSpots = course.maxStudents - enrolledPeople;

            return (
            <div key={`${course.id}-${dateKey || 'undated'}`} className="border-l-4 border-amber-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{course.name}</p>
                  <p className="text-sm text-gray-600">
                    {date ? `${formatDate(date)} • ` : `${course.dayOfWeek || 'Date pending'} • `}
                    {course.type === 'SPECIAL' ? 'Special Event' : `${course.maxStudents} capacity`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{enrolledPeople}</p>
                  <p className="text-sm text-gray-600">enrolled</p>
                </div>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (enrolledPeople / course.maxStudents) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {availableSpots} spots available
              </p>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
