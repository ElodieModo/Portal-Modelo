'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import DashboardHeader from '@/components/admin/DashboardHeader';
import AdminEnrollmentModal from '@/components/admin/AdminEnrollmentModal';
import CourseList from '@/components/admin/CourseList';
import EnrollmentStats from '@/components/admin/EnrollmentStats';
import FinancePanel from '@/components/admin/FinancePanel';
import { COURSE_GROUPS, getCourseGroupLabel } from '@/lib/courseCategories';

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'courses' | 'students' | 'enrollments' | 'finance'>('overview');

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,196,0,0.12),_transparent_24%),radial-gradient(circle_at_right,_rgba(0,122,63,0.08),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f5f8fb_100%)]">
      <DashboardHeader admin={admin} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[#dfe7ef] pb-1 sm:gap-4">
          {[
            ['overview', '📊 Overview'],
            ['courses', '📅 Classes'],
            ['students', '👤 Students'],
            ['enrollments', '👥 Enrollments'],
            ['finance', '💷 Finance'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value as 'overview' | 'courses' | 'students' | 'enrollments' | 'finance')}
              className={`shrink-0 px-3 py-2 text-sm font-bold sm:px-4 ${
                tab === value
                  ? 'border-b-2 border-[#007a3f] text-[#007a3f]'
                  : 'text-[#526174] hover:text-[#061b36]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <EnrollmentStats />}
        {tab === 'courses' && <CourseList />}
        {tab === 'students' && (
          <div className="overflow-hidden rounded-2xl border border-[#e7dfd5] bg-white/85 p-4 shadow-sm sm:p-6">
            <h2 className="mb-1 text-xl font-black text-[#061b36]">Registered Students</h2>
            <p className="mb-4 text-sm text-[#64716c]">Everyone who has created an account.</p>
            <StudentList />
          </div>
        )}
        {tab === 'enrollments' && (
          <div className="overflow-hidden rounded-2xl border border-[#e7dfd5] bg-white/85 p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-xl font-black text-[#061b36]">All Enrollments</h2>
            <EnrollmentList />
          </div>
        )}
        {tab === 'finance' && <FinancePanel />}
      </div>
    </div>
  );
}

function StudentList() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', age: '' });
  const [enrollmentStudent, setEnrollmentStudent] = useState<any>(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState('');

  const getCreatedByLabel = (value?: string | null) => {
    if (!value) return 'Unknown';
    if (value === 'SELF_REGISTRATION') return 'Student self-registration';
    if (value === 'ADMIN_MANUAL_CREATION') return 'Admin created';
    return value;
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await apiClient.getAllStudents();
        if (!response.error && Array.isArray(response.data)) {
          setStudents(response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <p className="text-sm text-[#64716c]">Loading students...</p>;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    const response = await apiClient.createStudent({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      age: formData.age === '' ? undefined : Number(formData.age),
    });

    if (response.error) {
      setFormError(response.error);
    } else if (response.data) {
      setStudents((current) => [...current, response.data].sort((a, b) => a.firstName.localeCompare(b.firstName)));
      setFormData({ firstName: '', lastName: '', email: '', phone: '', age: '' });
      setFormOpen(false);
    }
    setSaving(false);
  };

  const handleEnrollmentSuccess = async () => {
    setEnrollmentStudent(null);
    setEnrollmentSuccess('Inscription au cours créée.');
    const response = await apiClient.getAllStudents();
    if (!response.error && Array.isArray(response.data)) {
      setStudents(response.data);
    }
  };

  return (
    <div>
      {enrollmentSuccess && (
        <p role="status" className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {enrollmentSuccess}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => { setFormOpen((open) => !open); setFormError(''); }}
          className="rounded-md bg-[#007a3f] px-4 py-2 text-sm font-bold text-white hover:bg-[#006332]"
        >
          {formOpen ? 'Cancel' : 'Add student'}
        </button>
      </div>
      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-[#e7dfd5] bg-[#fffdf9] p-4 sm:grid-cols-2">
          {formError && <p role="alert" className="sm:col-span-2 text-sm text-red-700">{formError}</p>}
          <label className="text-sm font-semibold text-[#061b36]">
            First name *
            <input required value={formData.firstName} onChange={(event) => setFormData({ ...formData, firstName: event.target.value })} className="mt-1 w-full rounded border border-[#d9d2c8] px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-semibold text-[#061b36]">
            Last name *
            <input required value={formData.lastName} onChange={(event) => setFormData({ ...formData, lastName: event.target.value })} className="mt-1 w-full rounded border border-[#d9d2c8] px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-semibold text-[#061b36]">
            Email *
            <input required type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="mt-1 w-full rounded border border-[#d9d2c8] px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-semibold text-[#061b36]">
            Phone
            <input type="tel" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="mt-1 w-full rounded border border-[#d9d2c8] px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-semibold text-[#061b36]">
            Age
            <input type="number" min="0" max="120" step="1" value={formData.age} onChange={(event) => setFormData({ ...formData, age: event.target.value })} className="mt-1 w-full rounded border border-[#d9d2c8] px-3 py-2 font-normal" />
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="rounded-md bg-[#007a3f] px-4 py-2 text-sm font-bold text-white hover:bg-[#006332] disabled:opacity-60">
              {saving ? 'Adding...' : 'Create student'}
            </button>
          </div>
        </form>
      )}
      {students.length === 0 ? (
        <p className="text-sm text-[#64716c]">No registered students yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-[#e7dfd5] bg-[#f9f5ee]">
              <tr>
                <th className="px-4 py-2 text-left font-bold text-[#061b36]">Name</th>
                <th className="px-4 py-2 text-left font-bold text-[#061b36]">Email</th>
                <th className="px-4 py-2 text-left font-bold text-[#061b36]">Phone</th>
                <th className="px-4 py-2 text-left font-bold text-[#061b36]">Created by</th>
                <th className="px-4 py-2 text-left font-bold text-[#061b36]">Account created</th>
                <th className="px-4 py-2 text-left font-bold text-[#061b36]">Courses</th>
                <th className="px-4 py-2 text-right font-bold text-[#061b36]">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-[#f0e9e1] hover:bg-[#fffaf2]">
                  <td className="px-4 py-2 font-medium text-[#17231f]">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-4 py-2 text-[#4d5d59]">{student.email}</td>
                  <td className="px-4 py-2 text-[#4d5d59]">{student.phone || 'Not provided'}</td>
                  <td className="px-4 py-2 text-[#4d5d59]">{getCreatedByLabel(student.createdBy)}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-[#4d5d59]">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-[#4d5d59]">{student.enrollments?.length || 0}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => { setEnrollmentSuccess(''); setEnrollmentStudent(student); }}
                      className="rounded px-3 py-1 text-sm font-semibold text-[#007a3f] hover:bg-green-50"
                    >
                      Inscrire
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {enrollmentStudent && (
        <AdminEnrollmentModal
          student={enrollmentStudent}
          onClose={() => setEnrollmentStudent(null)}
          onSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
}

function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');

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

  const availableDates = Array.from(new Set(
    enrollments.map((enrollment) => new Date(enrollment.enrollmentDate).toISOString().slice(0, 10))
  )).sort();
  const visibleEnrollments = dateFilter === 'all'
    ? enrollments
    : enrollments.filter((enrollment) => (
      new Date(enrollment.enrollmentDate).toISOString().slice(0, 10) === dateFilter
    ));
  const participantCount = visibleEnrollments.reduce(
    (total, enrollment) => total + (enrollment.participants?.length || 0),
    0
  );
  const groupedEnrollments = COURSE_GROUPS.map((group) => ({
    group,
    enrollments: visibleEnrollments
      .filter((enrollment) => getCourseGroupLabel(enrollment.course) === group)
      .sort((first, second) => (
        new Date(first.enrollmentDate).getTime() - new Date(second.enrollmentDate).getTime()
      )),
  }));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <label htmlFor="enrollment-date-filter" className="mb-1 block text-sm font-semibold text-[#061b36]">
            Course date
          </label>
          <select
            id="enrollment-date-filter"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="min-w-52 rounded border border-[#d9d2c8] bg-white px-3 py-2 text-sm text-[#17231f]"
          >
            <option value="all">All dates</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(`${date}T12:00:00`).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-[#64716c]">
          {visibleEnrollments.length} enrollment{visibleEnrollments.length === 1 ? '' : 's'}
          {' · '}{participantCount} participant{participantCount === 1 ? '' : 's'}
        </p>
      </div>
      {visibleEnrollments.length === 0 ? (
        <p className="text-sm text-[#64716c]">No enrollments for this date.</p>
      ) : (
        <div className="overflow-x-auto">
          {groupedEnrollments.map(({ group, enrollments: categoryEnrollments }) => (
        <section key={group} className="mb-8 last:mb-0">
          <h3 className="mb-3 text-lg font-black text-[#061b36]">{group}</h3>
          {categoryEnrollments.length === 0 ? (
            <p className="text-sm text-[#64716c]">No enrollments in this category.</p>
          ) : (
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-[#e7dfd5] bg-[#f9f5ee]">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-[#061b36]">Student</th>
                  <th className="px-4 py-2 text-left font-bold text-[#061b36]">Email</th>
                  <th className="px-4 py-2 text-left font-bold text-[#061b36]">Course</th>
                  <th className="px-4 py-2 text-left font-bold text-[#061b36]">Course date</th>
                  <th className="px-4 py-2 text-left font-bold text-[#061b36]">Participants</th>
                  <th className="px-4 py-2 text-left font-bold text-[#061b36]">Status</th>
                  <th className="px-4 py-2 text-left font-bold text-[#061b36]">Enrolled</th>
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
      )}
    </div>
  );
}
