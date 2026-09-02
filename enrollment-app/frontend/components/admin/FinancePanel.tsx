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

interface Expense {
  id: string;
  category: 'ROOM' | 'EQUIPMENT' | 'MISCELLANEOUS';
  description: string;
  amount: number;
  date: string;
}

interface ManualAttendance {
  id: string;
  courseId: string;
  date: string;
  studentName: string;
  age?: number | null;
  amount: number;
  notes?: string | null;
  course?: { name: string; startTime: string; endTime: string };
}

const formatAmount = (amount: number) => `£${amount.toFixed(2)}`;

export default function FinancePanel() {
  const [enrollments, setEnrollments] = useState<FinanceEnrollment[]>([]);
  const [manualAttendances, setManualAttendances] = useState<ManualAttendance[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseForm, setExpenseForm] = useState({
    category: 'ROOM' as Expense['category'],
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(true);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [editingManualId, setEditingManualId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const [manualForm, setManualForm] = useState({
    courseId: '',
    date: new Date().toISOString().slice(0, 10),
    studentName: '',
    age: '',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    const loadFinance = async () => {
      const [enrollmentResponse, expenseResponse, courseResponse, manualResponse] = await Promise.all([
        apiClient.getFinanceEnrollments(),
        apiClient.getExpenses(),
        apiClient.getAllCourses(),
        apiClient.getManualAttendance(),
      ]);
      if (!enrollmentResponse.error && Array.isArray(enrollmentResponse.data)) {
        setEnrollments(enrollmentResponse.data);
      } else {
        setError(enrollmentResponse.error || 'Failed to load finance data');
      }
      if (!expenseResponse.error && Array.isArray(expenseResponse.data)) {
        setExpenses(expenseResponse.data);
      } else {
        setError(expenseResponse.error || 'Failed to load expenses');
      }
      if (!courseResponse.error && Array.isArray(courseResponse.data)) {
        setCourses(courseResponse.data);
      }
      if (!manualResponse.error && Array.isArray(manualResponse.data)) {
        setManualAttendances(manualResponse.data);
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
    const manualReceived = manualAttendances.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    return { expected, received, manualReceived, actualReceived: received + manualReceived, outstanding: expected - received };
  }, [enrollments, manualAttendances]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totals.actualReceived - totalExpenses;

  const handleExpenseSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setExpenseSaving(true);
    setError('');
    const response = await apiClient.createExpense({
      ...expenseForm,
      amount: Number(expenseForm.amount),
    });
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setExpenses((current) => [response.data as Expense, ...current]);
      setExpenseForm((current) => ({ ...current, description: '', amount: '' }));
    }
    setExpenseSaving(false);
  };

  const handleExpenseDelete = async (expense: Expense) => {
    if (!confirm(`Delete expense "${expense.description}"?`)) return;
    const response = await apiClient.deleteExpense(expense.id);
    if (response.error) {
      setError(response.error);
    } else {
      setExpenses((current) => current.filter((item) => item.id !== expense.id));
    }
  };

  const handleManualAttendanceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setManualSaving(true);
    setError('');

    const payload = {
      courseId: manualForm.courseId,
      date: manualForm.date,
      studentName: manualForm.studentName,
      age: manualForm.age === '' ? null : Number(manualForm.age),
      amount: Number(manualForm.amount),
      notes: manualForm.notes || undefined,
    };

    const response = editingManualId
      ? await apiClient.updateManualAttendance(editingManualId, payload)
      : await apiClient.recordManualAttendance(payload);
    if (response.error) {
      setError(response.error);
    } else {
      if (response.data) {
        setManualAttendances((current) => editingManualId
          ? current.map((record) => record.id === editingManualId ? response.data as ManualAttendance : record)
          : [response.data as ManualAttendance, ...current]);
      }
      setEditingManualId(null);
      setManualForm({
        courseId: manualForm.courseId,
        date: manualForm.date,
        studentName: '',
        age: '',
        amount: '',
        notes: '',
      });
    }
    setManualSaving(false);
  };

  const handleManualEdit = (record: ManualAttendance) => {
    setEditingManualId(record.id);
    setManualForm({
      courseId: record.courseId,
      date: record.date.slice(0, 10),
      studentName: record.studentName,
      age: record.age === null || record.age === undefined ? '' : String(record.age),
      amount: String(record.amount),
      notes: record.notes || '',
    });
    setError('');
  };

  const handleManualDelete = async (record: ManualAttendance) => {
    if (!confirm(`Delete walk-in payment for "${record.studentName}"?`)) return;
    const response = await apiClient.deleteManualAttendance(record.id);
    if (response.error) {
      setError(response.error);
      return;
    }
    setManualAttendances((current) => current.filter((item) => item.id !== record.id));
    if (editingManualId === record.id) {
      setEditingManualId(null);
      setManualForm((current) => ({ ...current, studentName: '', age: '', amount: '', notes: '' }));
    }
  };

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Expected</p>
          <p className="mt-2 text-3xl font-black text-amber-700">{formatAmount(totals.expected)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Received</p>
          <p className="mt-2 text-3xl font-black text-emerald-700">{formatAmount(totals.received)}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">Walk-ins</p>
          <p className="mt-2 text-3xl font-black text-sky-700">{formatAmount(totals.manualReceived)}</p>
        </div>
        <div className={`rounded-2xl border p-5 shadow-sm ${balance >= 0 ? 'border-teal-200 bg-gradient-to-br from-teal-50 to-white' : 'border-red-200 bg-gradient-to-br from-red-50 to-white'}`}>
          <p className={`text-xs font-bold uppercase tracking-[0.14em] ${balance >= 0 ? 'text-teal-700' : 'text-red-700'}`}>Balance</p>
          <p className={`mt-2 text-3xl font-black ${balance >= 0 ? 'text-teal-700' : 'text-red-700'}`}>{formatAmount(balance)}</p>
        </div>
      </div>

      <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${activeTab === 'payments' ? 'bg-[#061b36] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
        >
          Class payments
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${activeTab === 'expenses' ? 'bg-[#061b36] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
        >
          Association expenses
        </button>
      </div>

      {activeTab === 'payments' && (
        <div className="space-y-7">
          <div className="flex flex-col gap-3 border-b border-[#dfe7ef] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#007a3f]">Payment ledger</p>
              <h2 className="mt-1 text-2xl font-black text-[#061b36]">Class payments</h2>
              <p className="mt-1 text-sm text-[#526174]">Track registered students and record walk-in payments in one place.</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
              <span className="font-bold">Outstanding</span>{' '}{formatAmount(totals.outstanding)}
            </div>
          </div>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <form onSubmit={handleManualAttendanceSubmit} className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-sky-100 pb-4">
              <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-sky-800">Walk-in</span>
              <h3 className="mt-3 text-xl font-black text-[#061b36]">{editingManualId ? 'Edit walk-in payment' : 'Add a walk-in payment'}</h3>
              <p className="mt-1 text-sm leading-6 text-[#526174]">Record a present student who came without registration and the amount collected.</p>
            </div>

            <div>
              <label htmlFor="manual-course" className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
              <select
                id="manual-course"
                required
                value={manualForm.courseId}
                onChange={(event) => setManualForm((current) => ({ ...current, courseId: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="manual-date" className="block text-sm font-semibold text-gray-700 mb-1">Course date</label>
                <input
                  id="manual-date"
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={(event) => setManualForm((current) => ({ ...current, date: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div>
                <label htmlFor="manual-amount" className="block text-sm font-semibold text-gray-700 mb-1">Amount collected (£)</label>
                <input
                  id="manual-amount"
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={manualForm.amount}
                  onChange={(event) => setManualForm((current) => ({ ...current, amount: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)] gap-3">
              <div>
                <label htmlFor="manual-student-name" className="block text-sm font-semibold text-gray-700 mb-1">Student name</label>
                <input
                  id="manual-student-name"
                  type="text"
                  required
                  value={manualForm.studentName}
                  onChange={(event) => setManualForm((current) => ({ ...current, studentName: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder="e.g. Nadia Smith"
                />
              </div>
              <div>
                <label htmlFor="manual-age" className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input
                  id="manual-age"
                  type="number"
                  min="0"
                  max="120"
                  value={manualForm.age}
                  onChange={(event) => setManualForm((current) => ({ ...current, age: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="manual-notes" className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
              <textarea
                id="manual-notes"
                value={manualForm.notes}
                onChange={(event) => setManualForm((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="Optional note"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={manualSaving} className="flex-1 rounded-xl bg-[#007a3f] px-4 py-3 font-bold text-white shadow-sm transition hover:bg-[#005f32] disabled:cursor-not-allowed disabled:opacity-60">
                {manualSaving ? 'Saving...' : editingManualId ? 'Save changes' : 'Add walk-in payment'}
              </button>
              {editingManualId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingManualId(null);
                    setManualForm((current) => ({ ...current, studentName: '', age: '', amount: '', notes: '' }));
                  }}
                  className="rounded-xl border border-gray-300 px-4 py-3 font-bold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <section className="overflow-hidden rounded-2xl border border-[#dfe7ef] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8eef4] bg-[#f7fafc] px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-black text-[#061b36]">Walk-in payments</h3>
                <p className="mt-0.5 text-xs text-[#526174]">Unregistered students recorded at the door</p>
              </div>
              <p className="rounded-full bg-sky-100 px-3 py-1 text-sm font-black text-sky-800">{formatAmount(totals.manualReceived)}</p>
            </div>
            {manualAttendances.length === 0 ? (
              <p className="p-6 text-gray-600">No manual present students recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="bg-[#f7fafc] px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#526174]">Student</th>
                      <th className="bg-[#f7fafc] px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#526174]">Course</th>
                      <th className="bg-[#f7fafc] px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#526174]">Date</th>
                      <th className="bg-[#f7fafc] px-6 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#526174]">Amount</th>
                      <th className="bg-[#f7fafc] px-6 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#526174]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualAttendances.map((record) => (
                      <tr key={record.id} className="border-b border-[#edf1f5] transition last:border-b-0 hover:bg-sky-50/50">
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-800">{record.studentName}</div>
                          {record.age !== null && record.age !== undefined && <div className="text-xs text-gray-500">Age {record.age}</div>}
                        </td>
                        <td className="px-6 py-3">{record.course?.name || 'Course'}</td>
                        <td className="px-6 py-3">{new Date(`${record.date.slice(0, 10)}T12:00:00`).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-right font-semibold">{formatAmount(Number(record.amount || 0))}</td>
                        <td className="whitespace-nowrap px-6 py-3 text-right">
                          <button type="button" onClick={() => handleManualEdit(record)} className="mr-3 font-bold text-sky-700 hover:text-sky-900">Edit</button>
                          <button type="button" onClick={() => handleManualDelete(record)} className="font-bold text-red-600 hover:text-red-800">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          </section>
        </div>
      )}

      {activeTab === 'expenses' && <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <form onSubmit={handleExpenseSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add an expense</h2>
            <p className="text-sm text-gray-600 mt-1">Record room hire, equipment or other association costs.</p>
          </div>
          <div>
            <label htmlFor="expense-category" className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              id="expense-category"
              value={expenseForm.category}
              onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value as Expense['category'] }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="ROOM">Room payment</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="MISCELLANEOUS">Miscellaneous</option>
            </select>
          </div>
          <div>
            <label htmlFor="expense-description" className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <input
              id="expense-description"
              required
              value={expenseForm.description}
              onChange={(event) => setExpenseForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. September hall hire"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="expense-amount" className="block text-sm font-semibold text-gray-700 mb-1">Amount (£)</label>
              <input
                id="expense-amount"
                required
                min="0.01"
                step="0.01"
                type="number"
                value={expenseForm.amount}
                onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="expense-date" className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <input
                id="expense-date"
                required
                type="date"
                value={expenseForm.date}
                onChange={(event) => setExpenseForm((current) => ({ ...current, date: event.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
          <button type="submit" disabled={expenseSaving} className="w-full rounded bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
            {expenseSaving ? 'Saving...' : 'Add expense'}
          </button>
        </form>

        <section className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-gray-50 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">Expenses</h2>
            <p className="font-bold text-red-600">{formatAmount(totalExpenses)}</p>
          </div>
          {expenses.length === 0 ? (
            <p className="p-6 text-gray-600">No expenses recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b last:border-b-0">
                      <td className="px-6 py-3">{new Date(`${expense.date.slice(0, 10)}T12:00:00`).toLocaleDateString()}</td>
                      <td className="px-6 py-3">{expense.category === 'ROOM' ? 'Room payment' : expense.category === 'EQUIPMENT' ? 'Equipment' : 'Miscellaneous'}</td>
                      <td className="px-6 py-3">{expense.description}</td>
                      <td className="px-6 py-3 text-right font-semibold">{formatAmount(expense.amount)}</td>
                      <td className="px-6 py-3 text-right">
                        <button type="button" onClick={() => handleExpenseDelete(expense)} className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>}

      {activeTab === 'payments' && (groupedEnrollments.length === 0 ? (
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
                      <th className="px-6 py-3 text-left">Class</th>
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
      ))}
    </div>
  );
}