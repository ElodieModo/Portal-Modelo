'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface Course {
  id: string;
  name: string;
  pricePerHour: number;
  childPricePerHour: number;
  startTime: string;
  endTime: string;
  enrollmentDate: string;
}

const CHILD_AGE_LIMIT = 14;

interface Participant {
  firstName: string;
  lastName: string;
  age: string; // kept as string while typing, converted to number on submit
}

const MAX_PEOPLE = 6;

const emptyParticipant: Participant = { firstName: '', lastName: '', age: '' };

export default function EnrollmentModal({
  course,
  onClose,
  onSuccess,
}: {
  course: Course;
  onClose: () => void;
  onSuccess: (totalPrice?: string) => void;
}) {
  const [participants, setParticipants] = useState<Participant[]>([{ ...emptyParticipant }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateParticipantCount = (count: number) => {
    const next = [...participants];
    while (next.length < count) next.push({ ...emptyParticipant });
    while (next.length > count) next.pop();
    setParticipants(next);
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const next = [...participants];
    next[index] = { ...next[index], [field]: value };
    setParticipants(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    for (const p of participants) {
      if (!p.firstName.trim() || !p.lastName.trim() || p.age === '') {
        setError('Please fill in first name, last name and age for every student.');
        return;
      }
      const age = Number(p.age);
      if (Number.isNaN(age) || age < 0 || age > 120) {
        setError('Please enter a valid age for every student.');
        return;
      }
    }

    setLoading(true);
    const response = await apiClient.enrollInCourse(
      course.id,
      course.enrollmentDate,
      participants.map((p) => ({ firstName: p.firstName.trim(), lastName: p.lastName.trim(), age: Number(p.age) }))
    );
    setLoading(false);

    if (response.error) {
      setError(response.error);
    } else {
      onSuccess(response.pricing?.total);
    }
  };

  const totalPrice = participants
    .reduce((sum, p) => {
      const age = Number(p.age);
      const rate = !Number.isNaN(age) && age <= CHILD_AGE_LIMIT ? course.childPricePerHour : course.pricePerHour;
      return sum + rate;
    }, 0)
    .toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Book a class: {course.name}</h2>
          <p className="text-xs font-semibold text-green-700 bg-green-50 rounded px-2 py-1 inline-block mb-2">
            🎉 First-time students: your first class is free!
          </p>
          <p className="text-gray-600 text-sm mb-4">
            Date: {new Date(course.enrollmentDate).toLocaleDateString('en-GB')} ·{' '}
            {course.startTime} - {course.endTime} · £{course.pricePerHour} per class/session (adult) · £{course.childPricePerHour} per class/session (14 & under)
          </p>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Number of people (max {MAX_PEOPLE}, e.g. for families)
              </label>
              <select
                value={participants.length}
                onChange={(e) => updateParticipantCount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {Array.from({ length: MAX_PEOPLE }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {participants.map((participant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-600 mb-2">Student {index + 1}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={participant.firstName}
                    onChange={(e) => updateParticipant(index, 'firstName', e.target.value)}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={participant.lastName}
                    onChange={(e) => updateParticipant(index, 'lastName', e.target.value)}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    min={0}
                    max={120}
                    value={participant.age}
                    onChange={(e) => updateParticipant(index, 'age', e.target.value)}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            ))}

            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-gray-700">
                Total price: <span className="font-bold text-amber-800">£{totalPrice}</span>
              </p>
              <p className="text-xs text-gray-500">Payable on the day of the course (cash or bank transfer)</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-600 text-white font-bold py-2 rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
