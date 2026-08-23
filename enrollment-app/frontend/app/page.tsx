import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-10">
        <section className="fade-up max-w-xl px-1 sm:px-0">
          <div className="mb-5 flex items-center justify-start sm:mb-6">
            <Image
              src="/logo"
              alt="Portal Modelo logo"
              width={560}
              height={180}
              priority
              className="h-auto w-full max-w-[30rem]"
            />
          </div>
          <h1 className="display-title mb-5 text-5xl font-black text-[#061b36] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            Move with<br />
            <span className="text-[#007a3f]">intention.</span>
          </h1>

          <p className="max-w-lg text-base leading-7 text-[#4d5d59] sm:text-lg sm:leading-8">
            A welcoming space for capoeira practice, Brazilian culture and the people who keep the roda alive.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/student/login" className="primary-button inline-flex items-center justify-center text-center">
              Student access
            </Link>
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
