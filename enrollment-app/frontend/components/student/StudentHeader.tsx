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
    <header className="bg-[#153f35] text-white shadow-lg shadow-[#153f35]/15">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold sm:text-2xl">Portal Modelo Capoeira</h1>
          <p className="text-xs text-amber-100 sm:text-sm">Student Area</p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex max-w-[11rem] items-center justify-center gap-2 rounded-xl bg-[#c85b3d] px-3 py-2 text-xs font-bold transition hover:bg-[#a9472d] sm:max-w-none sm:text-sm"
            aria-expanded={showMenu}
            aria-haspopup="menu"
          >
            <span aria-hidden="true">◉</span>
            <span className="truncate">{student.firstName} {student.lastName}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full z-10 mt-2 w-52 rounded-xl bg-white p-2 text-gray-800 shadow-xl" role="menu">
              <Link
                href="/student/dashboard"
                className="block w-full rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-100"
                role="menuitem"
              >
                My Bookings
              </Link>
              <Link
                href="/student/courses"
                className="block w-full rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-100"
                role="menuitem"
              >
                Browse Classes
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="block w-full rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-100"
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