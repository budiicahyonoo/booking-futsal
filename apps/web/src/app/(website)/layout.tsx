import Link from 'next/link';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar glass sticky */}
      <header className="sticky top-0 z-50 w-full bg-white/30 backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/home" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0033FF] flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_20px_rgba(0,51,255,0.35)]">
                MA
              </div>
              <span className="font-bold text-lg text-[#00033D] tracking-wide">Mampang Arena</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/home" className="text-sm font-medium text-[#00033D] hover:text-[#0033FF] transition-colors">
                Home
              </Link>
              <Link href="/booking" className="text-sm font-medium text-[#00033D] hover:text-[#0033FF] transition-colors">
                Booking
              </Link>
              <Link href="/booking/status" className="text-sm font-medium text-[#00033D] hover:text-[#0033FF] transition-colors">
                Cek Status
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-medium text-[#00033D] hover:text-[#0033FF] transition-colors">
                Masuk
              </Link>
              <Link
                href="/booking"
                className="px-4 py-2 bg-[#0033FF] text-white rounded-xl text-sm font-medium shadow-[0_4px_20px_rgba(0,51,255,0.35)] hover:scale-[1.02] transition-transform"
              >
                Booking Sekarang
              </Link>
            </div>

            {/* Hamburger mobile */}
            <button
              className="md:hidden p-2 text-[#00033D]"
              aria-label="Menu"
              onClick={() => {
                const el = document.getElementById('mobile-menu');
                if (el) el.classList.toggle('hidden');
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        <div
          id="mobile-menu"
          className="hidden md:hidden px-4 pb-4 space-y-1 bg-white/40 backdrop-blur-xl border-t border-white/20"
        >
          <Link href="/home" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#00033D] hover:bg-white/30">
            Home
          </Link>
          <Link href="/booking" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#00033D] hover:bg-white/30">
            Booking
          </Link>
          <Link href="/booking/status" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#00033D] hover:bg-white/30">
            Cek Status Booking
          </Link>
          <Link href="/auth/login" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#00033D] hover:bg-white/30">
            Masuk
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer gelap */}
      <footer className="bg-[#030812] text-white py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#0033FF] flex items-center justify-center text-white font-bold text-xs">
                  MA
                </div>
                <span className="font-bold">Mampang Arena</span>
              </div>
              <p className="text-sm text-white/60 max-w-sm">
                GOR futsal di kawasan Mampang Prapatan, Jakarta Selatan. Booking
                online, jadwal real-time, tanpa ribet.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Navigasi</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="/booking" className="hover:text-white transition-colors">
                    Booking Lapangan
                  </Link>
                </li>
                <li>
                  <Link href="/booking/status" className="hover:text-white transition-colors">
                    Cek Status Booking
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Masuk / Daftar
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Kontak</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>📍 Mampang Prapatan, Jakarta Selatan</li>
                <li>📱 WhatsApp: 0812-3456-7890</li>
                <li>⏰ 08:00 – 24:00 WIB</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/40">
            © 2026 Mampang Arena. Dibangun dengan CayLabs Core Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
