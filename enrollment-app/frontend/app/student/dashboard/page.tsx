'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import StudentHeader from '@/components/student/StudentHeader';

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
}

interface Enrollment {
  id: string;
  enrollmentDate: string;
  status: string;
  numberOfPeople: number;
  participants: Participant[];
  course: {
    name: string;
    dayOfWeek?: string;
    date?: string;
    startTime: string;
    endTime: string;
  };
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<{ firstName: string; lastName: string } | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const response = await apiClient.getStudentProfile();

    if (response.error) {
      router.push('/student/login');
      return;
    }

    const data = response.data as unknown as {
      firstName: string;
      lastName: string;
      enrollments?: Enrollment[];
    };
    setStudent({ firstName: data.firstName, lastName: data.lastName });
    setEnrollments(Array.isArray(data.enrollments) ? data.enrollments : []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleCancel = async (enrollmentId: string) => {
    setError('');
    setMessage('');
    const response = await apiClient.cancelEnrollment(enrollmentId);
    if (response.error) {
      setError(response.error);
    } else {
      setMessage('Enrollment cancelled successfully.');
      loadProfile();
    }
  };

  const handleLogout = () => {
    apiClient.clearToken();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,196,0,0.10),_transparent_28%),radial-gradient(circle_at_left,_rgba(0,122,63,0.08),_transparent_24%),linear-gradient(180deg,_#ffffff_0%,_#f5f8fb_100%)]">
      {student && <StudentHeader student={student} onLogout={handleLogout} />}

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5">
          <p className="eyebrow mb-2">Member area</p>
          <h1 className="text-3xl font-black text-[#061b36] sm:text-4xl">My Bookings</h1>
        </div>

        {message && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {loading ? (
          <div className="rounded-2xl border border-[#dfe7ef] bg-white/80 p-6 text-center text-sm font-medium text-[#526174] shadow-sm">
            Loading...
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-2xl border border-[#dfe7ef] bg-white/80 p-6 text-center text-[#526174] shadow-sm">
            You have no bookings yet.
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-2xl border border-[#dfe7ef] bg-white/90 p-4 shadow-sm shadow-[#061b36]/5 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[#061b36]">{enrollment.course.name}</h2>
                    <p className="mt-1 text-sm text-[#526174]">
                      📅 {new Date(enrollment.enrollmentDate).toLocaleDateString('en-GB')} ·
                      ⏰ {enrollment.course.startTime} - {enrollment.course.endTime}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                      enrollment.status === 'ACTIVE' ? 'bg-[#e9f8ef] text-[#007a3f]' : 'bg-[#eef3f8] text-[#526174]'
                    }`}
                  >
                    {enrollment.status}
                  </span>
                </div>

                <div className="mt-4 text-sm text-[#0c2b4d]">
                  <p className="mb-2 font-bold">Students ({enrollment.numberOfPeople}):</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {enrollment.participants.map((p) => (
                      <li key={p.id}>
                        {p.firstName} {p.lastName} ({p.age} years old)
                      </li>
                    ))}
                  </ul>
                </div>

                {enrollment.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCancel(enrollment.id)}
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
