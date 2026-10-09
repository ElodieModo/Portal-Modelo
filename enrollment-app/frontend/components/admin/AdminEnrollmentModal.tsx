'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  age?: number | null;
  enrollments?: { courseId: string; enrollmentDate: string; status: string }[];
}

interface CourseSession {
  key: string;
  courseId: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
}

const getDateKey = (date: string) => date.slice(0, 10);

export default function AdminEnrollmentModal({
  student,
  onClose,
  onSuccess,
}: {
  student: Student;
  onClose: () => void;
  onSuccess: (enrollment: any) => void;
}) {
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [age, setAge] = useState(student.age == null ? '' : String(student.age));
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSessions = async () => {
      const response = await apiClient.getAllCourses();
      if (response.error || !Array.isArray(response.data)) {
        setError(response.error || 'Failed to load courses');
        setLoadingCourses(false);
        return;
      }

      const activeEnrollments = new Set(
        (student.enrollments || [])
          .filter((enrollment) => enrollment.status === 'ACTIVE')
          .map((enrollment) => `${enrollment.courseId}-${getDateKey(enrollment.enrollmentDate)}`)
      );
      const availableSessions = response.data.flatMap((course: any) => {
        const dates: string[] = course.date ? [course.date] : (course.sessionDates || []);
        return dates
          .map((date) => getDateKey(date))
          .filter((date) => !activeEnrollments.has(`${course.id}-${date}`))
          .map((date) => ({
            key: `${course.id}-${date}`,
            courseId: course.id,
            courseName: course.name,
            date,
            startTime: course.startTime,
            endTime: course.endTime,
          }));
      }).sort((first: CourseSession, second: CourseSession) => (
        first.date.localeCompare(second.date) || first.courseName.localeCompare(second.courseName)
      ));

      setSessions(availableSessions);
      setSelectedSession(availableSessions[0]?.key || '');
      setLoadingCourses(false);
    };

    loadSessions();
  }, [student]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const session = sessions.find((item) => item.key === selectedSession);
    const parsedAge = Number(age);
    if (!session) {
      setError('Choose an available course date.');
      return;
    }
    if (age === '' || !Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      setError('Enter a valid age between 0 and 120.');
      return;
    }

    setSaving(true);
    const response = await apiClient.createAdminEnrollment({
      studentId: student.id,
      courseId: session.courseId,
      enrollmentDate: session.date,
      age: parsedAge,
    });
    setSaving(false);

    if (response.error) {
      setError(response.error);
    } else {
      onSuccess(response.enrollment);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-enrollment-title"
        className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl sm:p-6"
      >
        <h2 id="admin-enrollment-title" className="text-xl font-bold text-[#061b36]">
          Inscrire {student.firstName} {student.lastName}
        </h2>
        <p className="mt-1 text-sm text-[#64716c]">Choisissez une séance disponible et confirmez l’âge.</p>

        {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {loadingCourses ? (
          <p className="py-6 text-sm text-[#64716c]">Chargement des cours…</p>
        ) : sessions.length === 0 ? (
          <p className="py-6 text-sm text-[#64716c]">Aucune date disponible pour cet élève.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold text-[#061b36]">
              Cours et date
              <select
                value={selectedSession}
                onChange={(event) => setSelectedSession(event.target.value)}
                className="mt-1 w-full rounded border border-[#d9d2c8] bg-white px-3 py-2 font-normal"
              >
                {sessions.map((session) => (
                  <option key={session.key} value={session.key}>
                    {session.courseName} · {new Date(`${session.date}T12:00:00`).toLocaleDateString()} · {session.startTime}–{session.endTime}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-[#061b36]">
              Âge du participant
              <input
                type="number"
                min="0"
                max="120"
                step="1"
                required
                value={age}
                onChange={(event) => setAge(event.target.value)}
                className="mt-1 w-full rounded border border-[#d9d2c8] px-3 py-2 font-normal"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded px-4 py-2 text-sm font-semibold text-[#526174] hover:bg-gray-100">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="rounded bg-[#007a3f] px-4 py-2 text-sm font-bold text-white hover:bg-[#006332] disabled:opacity-60">
                {saving ? 'Inscription…' : 'Inscrire'}
              </button>
            </div>
          </form>
        )}

        {!loadingCourses && sessions.length === 0 && (
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="rounded px-4 py-2 text-sm font-semibold text-[#526174] hover:bg-gray-100">
              Fermer
            </button>
          </div>
        )}
      </section>
    </div>
  );
}