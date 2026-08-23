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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50">
      {student && <StudentHeader student={student} onLogout={handleLogout} />}
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">My Bookings</h1>

        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : enrollments.length === 0 ? (
          <p className="text-gray-600">You have no bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{enrollment.course.name}</h2>
                    <p className="text-gray-600 text-sm">
                      📅 {new Date(enrollment.enrollmentDate).toLocaleDateString('en-GB')} ·
                      ⏰ {enrollment.course.startTime} - {enrollment.course.endTime}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {enrollment.status}
                  </span>
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  <p className="font-semibold mb-1">Students ({enrollment.numberOfPeople}):</p>
                  <ul className="list-disc list-inside">
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
                    className="mt-4 text-red-600 font-semibold hover:underline"
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
