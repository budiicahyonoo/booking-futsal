'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import type { UserProfile } from '@/lib/types';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['OWNER', 'ADMIN'] },
  { href: '/dashboard/calendar', label: 'Kalender Jadwal', icon: '📅', roles: ['OWNER', 'ADMIN'] },
  { href: '/dashboard/bookings', label: 'Semua Booking', icon: '📋', roles: ['OWNER', 'ADMIN'] },
  { href: '/dashboard/pending', label: 'Verifikasi Pembayaran', icon: '⏳', roles: ['OWNER', 'ADMIN'] },
  { href: '/dashboard/courts', label: 'Lapangan & Harga', icon: '🏟️', roles: ['OWNER'] },
  { href: '/dashboard/members', label: 'Member', icon: '👥', roles: ['OWNER'] },
  { href: '/dashboard/reports', label: 'Laporan', icon: '📈', roles: ['OWNER'] },
  { href: '/dashboard/settings', label: 'Pengaturan Venue', icon: '⚙️', roles: ['OWNER'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => router.push('/auth/login'));
  }, [router]);

  function handleLogout() {
    Cookies.remove('access_token');
    router.push('/auth/login');
  }

  const visibleItems = NAV_ITEMS.filter((item) =>
    user ? item.roles.includes(user.role) : true,
  );

  const initials = (user?.name || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar glass gelap (ui.md: bg-[#030812]/60) */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 shrink-0 z-50 bg-[#030812]/60 backdrop-blur-2xl border-r border-white/10 flex flex-col py-6 px-4 transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#0033FF] flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_20px_rgba(0,51,255,0.35)]">
            MA
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Mampang Arena</h1>
            <p className="text-white/40 text-[10px]">
              Panel {user?.role === 'OWNER' ? 'Owner' : 'Admin'}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 pb-4 no-scrollbar">
          {visibleItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  active
                    ? 'bg-[#0033FF] text-white shadow-[0_4px_20px_rgba(0,51,255,0.35)]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4 px-1">
          <div className="flex items-center gap-3 mb-4 px-1 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#977DFF]/30 border border-[#977DFF]/40 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium leading-none mb-1 truncate text-white">
                {user?.name || 'Admin'}
              </span>
              <span className="text-[10px] text-white/40 truncate">
                {user?.email || user?.phone || ''}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/40 backdrop-blur-xl border-b border-white/20 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="p-2 text-[#00033D]" aria-label="Buka menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <span className="font-bold text-[#00033D] text-sm">Mampang Arena</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
