import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="fade-up flex flex-col items-center text-center">
          <div className="mb-5 flex justify-center sm:mb-6">
            <Image
              src="/logo.png"
              alt="Portal Modelo logo"
              width={700}
              height={220}
              priority
              className="h-auto w-full max-w-[32rem]"
            />
          </div>

          <div className="max-w-2xl">
            <h1 className="display-title mb-4 text-4xl font-black text-[#061b36] sm:text-5xl lg:text-6xl">
              Move with <span className="text-[#007a3f]">intention.</span>
            </h1>

            <p className="mx-auto max-w-lg text-base leading-7 text-[#4d5d59] sm:text-lg sm:leading-8">
              A welcoming space for capoeira practice, Brazilian culture and the people who keep the roda alive.
            </p>

            <div className="mx-auto mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <Link href="/student/login" className="primary-button inline-flex items-center justify-center text-center">
                Student access
              </Link>
              <Link href="/admin/login" className="secondary-button inline-flex items-center justify-center text-center">
                Admin access
              </Link>
            </div>
          </div>
        </section>

        <section className="fade-up mx-auto mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2" style={{ animationDelay: '120ms' }}>
          <div className="feature-card feature-card--light">
            <span className="feature-icon" aria-hidden="true">◌</span>
            <p className="eyebrow">For practitioners</p>
            <h2>Enter the roda</h2>
            <p>Book a class, meet your community and keep your practice moving.</p>
          </div>

          <div className="feature-card feature-card--dark">
            <span className="feature-icon" aria-hidden="true">✦</span>
            <p className="eyebrow eyebrow--light">For the team</p>
            <h2>Shape the rhythm</h2>
            <p>Manage sessions, attendance and the next chapter of the school.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
