'use client';

import { useState } from 'react';
import Link from 'next/link';

interface StudentHeaderProps {
  student: {
    firstName: string;
    lastName: string;
  };
  onLogout: () => void;
}

export default function StudentHeader({ student, onLogout }: StudentHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-gradient-to-r from-green-700 via-green-800 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Portal Modelo Capoeira</h1>
          <p className="text-amber-100 text-sm">Student Area</p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg transition"
            aria-expanded={showMenu}
            aria-haspopup="menu"
          >
            👤 {student.firstName} {student.lastName}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-lg shadow-lg p-2 min-w-44 z-10" role="menu">
              <Link
                href="/student/dashboard"
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                role="menuitem"
              >
                My Bookings
              </Link>
              <Link
                href="/student/courses"
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                role="menuitem"
              >
                Browse Classes
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                role="menuitem"
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