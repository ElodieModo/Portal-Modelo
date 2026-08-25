'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface CourseFormProps {
  course?: any;
  onClose: () => void;
}

export default function CourseForm({ course, onClose }: CourseFormProps) {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    description: course?.description || '',
    category: course?.category || 'General',
    level: course?.level || 'ALL_LEVELS',
    type: course?.type || 'REGULAR',
    dayOfWeek: course?.dayOfWeek || 'Sunday',
    startTime: course?.startTime || '10:00',
    endTime: course?.endTime || '11:30',
    date: course?.date ? new Date(course.date).toISOString().split('T')[0] : '',
    maxStudents: course?.maxStudents || 20,
    pricePerHour: course?.pricePerHour ?? 8,
    childPricePerHour: course?.childPricePerHour ?? 6,
    location: course?.location || ''
  });

  const [sessionDates, setSessionDates] = useState<string[]>(
    course?.sessionDates?.map((d: string) => new Date(d).toISOString().split('T')[0]) || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addSessionDate = () => setSessionDates(prev => [...prev, '']);
  const updateSessionDate = (index: number, value: string) => {
    setSessionDates(prev => prev.map((d, i) => (i === index ? value : d)));
  };
  const removeSessionDate = (index: number) => {
    setSessionDates(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['maxStudents'].includes(name)
        ? parseInt(value)
        : ['pricePerHour', 'childPricePerHour'].includes(name)
        ? parseFloat(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const submitData = {
      ...formData,
      date: formData.type === 'SPECIAL' ? formData.date : null,
      dayOfWeek: formData.type === 'REGULAR' ? formData.dayOfWeek : null,
      sessionDates: formData.type === 'REGULAR' ? sessionDates.filter(Boolean) : []
    };

    const response = course
      ? await apiClient.updateCourse(course.id, submitData)
      : await apiClient.createCourse(submitData);

    if (response.error) {
      setError(response.error);
    } else {
      alert(`Class ${course ? 'updated' : 'created'} successfully!`);
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-amber-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {course ? '✏️ Edit Class' : '➕ Add New Class'}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-70"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Class Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="e.g., Children & Family Class"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="ALL_LEVELS">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="CHILDREN">Children</option>
                <option value="FAMILY">Family</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="Adults">Adults</option>
                <option value="Family & Childs">Family & Childs</option>
                <option value="Exceptional Stages">Exceptional Stages</option>
              </select>
            </div>
          </div>

          {/* Class Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="REGULAR">Regular (Recurring)</option>
                <option value="SPECIAL">Special (One-time)</option>
                <option value="WORKSHOP">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Max Students *</label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Adult Price (£/hour) *</label>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                required
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Child Price (£/hour, 14 & under) *</label>
              <input
                type="number"
                name="childPricePerHour"
                value={formData.childPricePerHour}
                onChange={handleChange}
                required
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Day or Date */}
          {formData.type === 'REGULAR' ? (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Day of Week *</label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Course Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required={formData.type !== 'REGULAR'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          )}

          {/* Explicit session dates for irregular schedules */}
          {formData.type === 'REGULAR' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Specific session dates (optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Leave empty for a class that runs every {formData.dayOfWeek}. Add dates if this class doesn&apos;t run every week.
              </p>
              <div className="space-y-2">
                {sessionDates.map((d, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="date"
                      value={d}
                      onChange={(e) => updateSessionDate(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeSessionDate(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSessionDate}
                  className="text-amber-700 font-semibold hover:underline text-sm"
                >
                  + Add a session date
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none h-24"
              placeholder="Enter course description..."
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="e.g., Main Hall, Studio A"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-600 text-white font-bold py-2 rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
