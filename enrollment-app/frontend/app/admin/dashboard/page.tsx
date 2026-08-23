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
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(226,161,59,0.12),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#f2efe9_100%)]">
        <div className="text-center">
          <div className="mb-4 text-4xl">🥁</div>
          <p className="text-sm font-medium text-[#64716c]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(226,161,59,0.12),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#f2efe9_100%)]">
      <DashboardHeader admin={admin} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[#dedbd2] pb-1 sm:gap-4">
          {[
            ['overview', '📊 Overview'],
            ['courses', '📅 Courses'],
            ['enrollments', '👥 Enrollments'],
            ['finance', '💷 Finance'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value as 'overview' | 'courses' | 'enrollments' | 'finance')}
              className={`shrink-0 px-3 py-2 text-sm font-bold sm:px-4 ${
                tab === value
                  ? 'border-b-2 border-[#c85b3d] text-[#c85b3d]'
                  : 'text-[#4d5d59] hover:text-[#153f35]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <EnrollmentStats />}
        {tab === 'courses' && <CourseList />}
        {tab === 'enrollments' && (
          <div className="overflow-hidden rounded-2xl border border-[#e7dfd5] bg-white/85 p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-xl font-black text-[#153f35]">All Enrollments</h2>
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

  if (loading) return <p className="text-sm text-[#64716c]">Loading enrollments...</p>;

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
          <h3 className="mb-3 text-lg font-black text-[#153f35]">{group}</h3>
          {categoryEnrollments.length === 0 ? (
            <p className="text-sm text-[#64716c]">No enrollments in this category.</p>
          ) : (
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-[#e7dfd5] bg-[#f9f5ee]">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-[#153f35]">Student</th>
                  <th className="px-4 py-2 text-left font-bold text-[#153f35]">Email</th>
                  <th className="px-4 py-2 text-left font-bold text-[#153f35]">Course</th>
                  <th className="px-4 py-2 text-left font-bold text-[#153f35]">Course date</th>
                  <th className="px-4 py-2 text-left font-bold text-[#153f35]">Participants</th>
                  <th className="px-4 py-2 text-left font-bold text-[#153f35]">Status</th>
                  <th className="px-4 py-2 text-left font-bold text-[#153f35]">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {categoryEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-[#f0e9e1] hover:bg-[#fffaf2]">
                    <td className="px-4 py-2 text-[#17231f]">
                      {enrollment.student.firstName} {enrollment.student.lastName}
                    </td>
                    <td className="px-4 py-2 text-[#4d5d59]">{enrollment.student.email}</td>
                    <td className="px-4 py-2 text-[#17231f]">{enrollment.course.name}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-[#4d5d59]">
                      <div>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</div>
                      <div className="text-xs text-[#64716c]">
                        {enrollment.course.startTime} - {enrollment.course.endTime}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[#4d5d59]">
                      {Array.isArray(enrollment.participants) && enrollment.participants.length > 0 ? (
                        <ul className="space-y-1">
                          {enrollment.participants.map((participant: any) => (
                            <li key={participant.id} className="text-xs">
                              {participant.firstName} {participant.lastName} ({participant.age} yrs)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-[#64716c]">No participants</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${
                          enrollment.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[#4d5d59]">
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
