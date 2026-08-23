import Link from 'next/link';

const quickStats = [
  { value: '3+', label: 'types of practice' },
  { value: 'Weekly', label: 'community sessions' },
  { value: 'All levels', label: 'welcome' },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-10">
        <section className="fade-up max-w-xl px-1 sm:px-0">
          <p className="eyebrow mb-4 sm:mb-5">Portal Modelo · Since 2026</p>
          <h1 className="display-title mb-5 text-5xl font-black text-[#153f35] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            Move with<br />
            <span className="text-[#c85b3d]">intention.</span>
          </h1>

          <p className="max-w-lg text-base leading-7 text-[#4d5d59] sm:text-lg sm:leading-8">
            A welcoming space for capoeira practice, Brazilian culture and the people who keep the roda alive.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm font-bold text-[#153f35]">
            <span className="inline-flex items-center rounded-full border border-[#e2a13b]/60 bg-[#fff7e8] px-3 py-1 text-[#c77b2b]">
              Train
            </span>
            <span className="inline-flex items-center rounded-full border border-[#dfe8e5] bg-white/60 px-3 py-1">
              Connect
            </span>
            <span className="inline-flex items-center rounded-full border border-[#dfe8e5] bg-white/60 px-3 py-1">
              Belong
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/student/login" className="primary-button inline-flex items-center justify-center text-center">
              Student access
            </Link>
            <Link href="/student/courses" className="secondary-button inline-flex items-center justify-center text-center">
              Explore courses
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-3 text-center">
                <div className="text-lg font-black text-[#153f35] sm:text-xl">{stat.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#64716c]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="fade-up grid gap-4 sm:grid-cols-2" style={{ animationDelay: '120ms' }}>
          <div className="feature-card feature-card--light">
            <span className="feature-icon" aria-hidden="true">◌</span>
            <p className="eyebrow">For practitioners</p>
            <h2>Enter the roda</h2>
            <p>Book a class, meet your community and keep your practice moving.</p>
            <Link href="/student/login" className="primary-button mt-auto text-center">
              Student access
            </Link>
          </div>

          <div className="feature-card feature-card--dark">
            <span className="feature-icon" aria-hidden="true">✦</span>
            <p className="eyebrow eyebrow--light">For the team</p>
            <h2>Shape the rhythm</h2>
            <p>Manage sessions, attendance and the next chapter of the school.</p>
            <Link href="/admin/login" className="secondary-button secondary-button--light mt-auto text-center">
              Admin access
            </Link>
          </div>

          <div className="feature-footnote sm:col-span-2">
            <Link href="/student/courses">Browse upcoming classes without an account →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
