'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const response = await apiClient.studentLogin(email, password);

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
          <div className="auth-head">
            <p className="eyebrow mb-3">Portal Modelo</p>
            <h2 className="auth-title">Find your rhythm.</h2>
            <p className="auth-subtitle">Sign in to book your next class.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} noValidate className="auth-form">
            <div>
              <label className="form-label">Email</label>
              <input
                type="text"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
                className="field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link href="/student/register">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
