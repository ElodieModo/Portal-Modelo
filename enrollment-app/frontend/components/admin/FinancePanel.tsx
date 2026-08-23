'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';

interface FinanceEnrollment {
  id: string;
  enrollmentDate: string;
  paymentReceived: boolean;
  isFreeTrial: boolean;
  paymentWaived: boolean;
  expectedAmount: number;
  student: { firstName: string; lastName: string };
  course: { name: string; startTime: string; endTime: string };
  participants: { id: string; firstName: string; lastName: string }[];
}

const formatAmount = (amount: number) => `£${amount.toFixed(2)}`;

export default function FinancePanel() {
  const [enrollments, setEnrollments] = useState<FinanceEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFinance = async () => {
      const response = await apiClient.getFinanceEnrollments();
      if (!response.error && Array.isArray(response.data)) {
        setEnrollments(response.data);
      } else {
        setError(response.error || 'Failed to load finance data');
      }
      setLoading(false);
    };

    loadFinance();
  }, []);

  const totals = useMemo(() => {
    const expected = enrollments.reduce((sum, enrollment) => sum + enrollment.expectedAmount, 0);
    const received = enrollments
      .filter((enrollment) => enrollment.paymentReceived)
      .reduce((sum, enrollment) => sum + enrollment.expectedAmount, 0);
    return { expected, received, outstanding: expected - received };
  }, [enrollments]);

  const groupedEnrollments = useMemo(() => {
    const groups = new Map<string, FinanceEnrollment[]>();
    enrollments.forEach((enrollment) => {
      const dateKey = new Date(enrollment.enrollmentDate).toISOString().slice(0, 10);
      groups.set(dateKey, [...(groups.get(dateKey) || []), enrollment]);
    });
    return Array.from(groups.entries());
  }, [enrollments]);

  const togglePayment = async (enrollment: FinanceEnrollment) => {
    const received = !enrollment.paymentReceived;
    setEnrollments((current) => current.map((item) => (
      item.id === enrollment.id ? { ...item, paymentReceived: received } : item
    )));

    const response = await apiClient.updatePaymentStatus(enrollment.id, received);
    if (response.error) {
      setEnrollments((current) => current.map((item) => (
        item.id === enrollment.id ? { ...item, paymentReceived: !received } : item
      )));
      setError(response.error);
    }
  };

  const toggleFree = async (enrollment: FinanceEnrollment) => {
    const free = !enrollment.paymentWaived;
    setEnrollments((current) => current.map((item) => (
      item.id === enrollment.id
        ? { ...item, paymentWaived: free, expectedAmount: free ? 0 : item.expectedAmount }
        : item
    )));

    const response = await apiClient.updateFreeStatus(enrollment.id, free);
    const refreshed = await apiClient.getFinanceEnrollments();
    if (!refreshed.error && Array.isArray(refreshed.data)) {
      setEnrollments(refreshed.data);
    }
    if (response.error) {
      setError(response.error);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading finance data...</p>;
  if (error && enrollments.length === 0) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Expected</p>
          <p className="text-3xl font-bold text-amber-600">{formatAmount(totals.expected)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Received</p>
          <p className="text-3xl font-bold text-green-600">{formatAmount(totals.received)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-3xl font-bold text-red-600">{formatAmount(totals.outstanding)}</p>
        </div>
      </div>

      {groupedEnrollments.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-gray-600">No active enrollments.</div>
      ) : (
        groupedEnrollments.map(([dateKey, dateEnrollments]) => {
          const dateExpected = dateEnrollments.reduce((sum, enrollment) => sum + enrollment.expectedAmount, 0);
          const dateReceived = dateEnrollments
            .filter((enrollment) => enrollment.paymentReceived)
            .reduce((sum, enrollment) => sum + enrollment.expectedAmount, 0);

          return (
            <section key={dateKey} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b flex flex-wrap justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-800">
                  {new Date(`${dateKey}T12:00:00`).toLocaleDateString()}
                </h2>
                <p className="text-sm text-gray-600">
                  {formatAmount(dateReceived)} received / {formatAmount(dateExpected)} expected
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">Student</th>
                      <th className="px-6 py-3 text-left">Course</th>
                      <th className="px-6 py-3 text-left">Participants</th>
                      <th className="px-6 py-3 text-left">Expected</th>
                      <th className="px-6 py-3 text-left">Free</th>
                      <th className="px-6 py-3 text-left">Payment received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="border-b last:border-b-0">
                        <td className="px-6 py-3">
                          {enrollment.student.firstName} {enrollment.student.lastName}
                        </td>
                        <td className="px-6 py-3">
                          <div>{enrollment.course.name}</div>
                          <div className="text-xs text-gray-500">
                            {enrollment.course.startTime} - {enrollment.course.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-3">{enrollment.participants.length}</td>
                        <td className="px-6 py-3 font-semibold">
                          {enrollment.isFreeTrial || enrollment.paymentWaived
                            ? (enrollment.isFreeTrial ? 'Free trial' : 'Free')
                            : formatAmount(enrollment.expectedAmount)}
                        </td>
                        <td className="px-6 py-3">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enrollment.paymentWaived}
                              onChange={() => toggleFree(enrollment)}
                              className="h-4 w-4 accent-blue-600"
                            />
                            <span>{enrollment.paymentWaived ? 'Free' : 'Charge'}</span>
                          </label>
                        </td>
                        <td className="px-6 py-3">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enrollment.paymentReceived}
                              onChange={() => togglePayment(enrollment)}
                              disabled={enrollment.paymentWaived || enrollment.isFreeTrial}
                              className="h-4 w-4 accent-green-600"
                            />
                            <span>
                              {enrollment.paymentWaived || enrollment.isFreeTrial
                                ? 'Not required'
                                : enrollment.paymentReceived ? 'Received' : 'Pending'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}