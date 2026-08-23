'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function StudentRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    birthDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const response = await apiClient.studentRegister(formData);

    if (response.error) {
      setError(response.error);
      setLoading(false);
    } else {
      router.push('/student/courses');
    }
  };

  return (
    <main className="page-shell">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-head text-center">
            <p className="eyebrow mb-3">Portal Modelo</p>
            <h2 className="auth-title text-4xl sm:text-5xl">Create account</h2>
            <p className="auth-subtitle">Join our Capoeira community.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label">First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="field"
                />
              </div>
              <div>
                <label className="form-label">Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="field"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="field"
              />
            </div>

            <div>
              <label className="form-label">Phone (optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="field"
              />
            </div>

            <div>
              <label className="form-label">Date of birth (optional)</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link href="/student/login">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
