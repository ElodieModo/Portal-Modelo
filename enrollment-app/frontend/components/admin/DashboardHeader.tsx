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
    <header className="bg-[#061b36] text-white shadow-lg shadow-[#061b36]/15">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-3xl">
            Portal Modelo Capoeira
          </h1>
          <p className="text-sm text-[#f4cf59]">Admin Dashboard</p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLogout(!showLogout)}
            className="flex max-w-[10rem] items-center gap-2 rounded-xl bg-[#007a3f] px-3 py-2 text-sm font-bold transition hover:bg-[#005f32] sm:max-w-none sm:px-4"
          >
            <span aria-hidden="true">◉</span>
            <span className="truncate">{admin.name}</span>
          </button>

          {showLogout && (
            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl bg-white p-2 text-gray-800 shadow-xl">
              <Link
                href="/admin/change-password"
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
              >
                Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
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
