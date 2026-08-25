'use client';

import Image from 'next/image';
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
    <header className="bg-[#061b36] text-white shadow-lg shadow-[#061b36]/15">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <Image
              src="/32295424-1BB4-4B01-91BB-84F9FE60FDC1.png"
              alt=""
              width={1254}
              height={1254}
              className="h-auto w-[42px] sm:w-[52px]"
            />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black leading-tight sm:text-2xl">Portal Modelo Capoeira</h1>
              <p className="text-sm font-semibold text-[#f4cf59] sm:text-base">Student Area</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex max-w-[11rem] items-center justify-center gap-2 rounded-xl bg-[#007a3f] px-3 py-2 text-xs font-bold transition hover:bg-[#005f32] sm:max-w-none sm:text-sm"
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