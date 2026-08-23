import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 p-6">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-amber-800 mb-2">Capoeira Portal</h1>
        <p className="text-gray-600 mb-10">Capoeira & Brazilian Culture</p>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* User card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-800">Student</h2>
            <p className="text-sm text-gray-500 mb-1">Book a class or manage your bookings</p>
            <Link
              href="/student/login"
              className="bg-amber-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-amber-700 transition"
            >
              Login
            </Link>
            <Link
              href="/student/register"
              className="bg-white text-amber-700 font-bold px-6 py-3 rounded-lg border border-amber-600 hover:bg-amber-50 transition"
            >
              First time? Sign up
            </Link>
          </div>

          {/* Admin card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-800">Admin</h2>
            <p className="text-sm text-gray-500 mb-1">Manage courses and enrollments</p>
            <Link
              href="/admin/login"
              className="bg-gray-800 text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-900 transition mt-auto"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <Link href="/student/courses" className="inline-block mt-8 text-amber-700 font-semibold hover:underline">
          Browse classes without an account →
        </Link>
      </div>
    </div>
  );
}
