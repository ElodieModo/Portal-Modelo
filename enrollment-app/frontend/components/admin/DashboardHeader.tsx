'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function DashboardHeader({ admin }: { admin: any }) {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    apiClient.clearToken();
    router.push('/');
  };

  return (
    <header className="bg-gradient-to-r from-green-700 via-green-800 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Portal Modelo Capoeira
          </h1>
          <p className="text-amber-100 text-sm">Admin Dashboard</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg transition"
          >
            👤 {admin.name}
          </button>

          {showLogout && (
            <div className="absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-lg shadow-lg p-2">
              <Link
                href="/admin/change-password"
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
              >
                Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
