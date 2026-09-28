'use client';

import { useState } from 'react';
import Link from 'next/link';

export function WebsiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
            onClick={() => setMenuOpen((v) => !v)}
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
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-1 bg-white/40 backdrop-blur-xl border-t border-white/20">
          <Link href="/home" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#00033D] hover:bg-white/30">
            Home
          </Link>
          <Link href="/booking" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#00033D] hover:bg-white/30">
            Booking
          </Link>
          <Link href="/booking/status" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#00033D] hover:bg-white/30">
            Cek Status Booking
          </Link>
          <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#00033D] hover:bg-white/30">
            Masuk
          </Link>
        </div>
      )}
    </header>
  );
}
