'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import DashboardHeader from '@/components/admin/DashboardHeader';
import CourseList from '@/components/admin/CourseList';
import EnrollmentStats from '@/components/admin/EnrollmentStats';
import FinancePanel from '@/components/admin/FinancePanel';
import { COURSE_GROUPS, getCourseGroupLabel } from '@/lib/courseCategories';

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'courses' | 'enrollments' | 'finance'>('overview');

   useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await apiClient.getAdminProfile();

        if (response.error) {
          router.push('/admin/login');
          return;
        }

        setAdmin(response.data);
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🥁</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader admin={admin} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2 font-semibold ${
              tab === 'overview'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setTab('courses')}
            className={`px-4 py-2 font-semibold ${
              tab === 'courses'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📅 Courses
          </button>
          <button
            onClick={() => setTab('enrollments')}
            className={`px-4 py-2 font-semibold ${
              tab === 'enrollments'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Enrollments
          </button>
          <button
            onClick={() => setTab('finance')}
            className={`px-4 py-2 font-semibold ${
              tab === 'finance'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💷 Finance
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'overview' && <EnrollmentStats />}
        {tab === 'courses' && <CourseList />}
        {tab === 'enrollments' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">All Enrollments</h2>
            <EnrollmentList />
          </div>
        )}
        {tab === 'finance' && <FinancePanel />}
      </div>
    </div>
  );
}

function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        const fetchEnrollments = async () => {
      try {
        const response = await apiClient.getAllEnrollments();

        if (!response.error && Array.isArray(response.data)) {
          setEnrollments(response.data);
        } else {
          setEnrollments([]);
        }
        } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  if (loading) return <p>Loading enrollments...</p>;

  const groupedEnrollments = COURSE_GROUPS.map((group) => ({
    group,
    enrollments: enrollments
      .filter((enrollment) => getCourseGroupLabel(enrollment.course) === group)
      .sort((first, second) => (
        new Date(first.enrollmentDate).getTime() - new Date(second.enrollmentDate).getTime()
      )),
  }));

  return (
    <div className="overflow-x-auto">
      {groupedEnrollments.map(({ group, enrollments: categoryEnrollments }) => (
        <section key={group} className="mb-8 last:mb-0">
          <h3 className="text-lg font-bold text-amber-800 mb-3">{group}</h3>
          {categoryEnrollments.length === 0 ? (
            <p className="text-sm text-gray-500">No enrollments in this category.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Course</th>
                  <th className="px-4 py-2 text-left">Course date</th>
                  <th className="px-4 py-2 text-left">Participants</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {categoryEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">
                {enrollment.student.firstName} {enrollment.student.lastName}
              </td>
              <td className="px-4 py-2">{enrollment.student.email}</td>
              <td className="px-4 py-2">{enrollment.course.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <div>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">
                  {enrollment.course.startTime} - {enrollment.course.endTime}
                </div>
              </td>
              <td className="px-4 py-2">
                {Array.isArray(enrollment.participants) && enrollment.participants.length > 0 ? (
                  <ul className="space-y-1">
                    {enrollment.participants.map((participant: any) => (
                      <li key={participant.id} className="text-xs text-gray-700">
                        {participant.firstName} {participant.lastName} ({participant.age} yrs)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-gray-500">No participants</span>
                )}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    enrollment.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {enrollment.status}
                </span>
              </td>
              <td className="px-4 py-2">
                {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </div>
  );
}
