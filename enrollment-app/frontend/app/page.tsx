import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="mx-auto w-full max-w-5xl px-4 py-3 sm:px-6 lg:px-8 lg:py-5">
        <section className="fade-up flex flex-col items-center text-center">
          <div className="mb-2 flex justify-center rounded-xl bg-white px-5 py-3 sm:mb-3 sm:px-6 sm:py-4">
            <Image
              src="/32295424-1BB4-4B01-91BB-84F9FE60FDC1.png"
              alt="Portal Modelo logo"
              width={1254}
              height={1254}
              priority
              className="h-auto w-full max-w-[18rem]"
            />
          </div>

        </section>

        <section className="fade-up mx-auto mt-4 grid w-full max-w-2xl gap-4 sm:grid-cols-2" style={{ animationDelay: '120ms' }}>
          <div className="feature-card feature-card--light">
            <p className="eyebrow">For practitioners</p>
            <h2>Enter the roda</h2>
            <p>Book a class, meet your community and keep your practice moving.</p>
            <Link href="/student/login" className="primary-button mt-auto text-center">
              Student access
            </Link>
          </div>

          <div className="feature-card feature-card--dark">
            <p className="eyebrow eyebrow--light">For the team</p>
            <h2>Shape the rhythm</h2>
            <p>Manage sessions, attendance and the next chapter of the school.</p>
            <Link href="/admin/login" className="secondary-button secondary-button--light mt-auto text-center">
              Admin access
            </Link>
          </div>
        </section>

        <section className="fade-up mx-auto mt-8 max-w-2xl text-center" style={{ animationDelay: '220ms' }}>
          <h1 className="display-title mb-4 text-4xl font-black text-[#061b36] sm:text-5xl lg:text-6xl">
            Move with <span className="text-[#007a3f]">intention.</span>
          </h1>

          <p className="mx-auto max-w-lg text-base leading-7 text-[#4d5d59] sm:text-lg sm:leading-8">
            A welcoming space for capoeira practice, Brazilian culture and the people who keep the roda alive.
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm font-bold leading-6 text-[#007a3f] sm:text-base">
            Classes in Taunton, Somerset, led by Professor Modo.
          </p>
        </section>
      </div>
    </main>
  );
}
