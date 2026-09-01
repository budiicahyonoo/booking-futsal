"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    // Hapus cookie token (sesuaikan nama 'access_token' dengan yang digunakan backend NestJS)
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect ke halaman login
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      
      {/* Sidebar - Menggunakan variabel --sidebar (#030812) */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen py-6 px-4 shrink-0">
        
        {/* Tempat Upload Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 rounded-md bg-muted overflow-hidden shrink-0 flex items-center justify-center border border-sidebar-border">
            {/* Ganti span di bawah dengan tag <img> saat logo sudah ada */}
            <span className="text-primary font-bold text-[10px]">IMG</span>
          </div>
          <h1 className="text-lg font-bold tracking-wide text-sidebar-foreground truncate">CayLabs</h1>
        </div>
        
        {/* Area Menu (Bisa di-scroll jika menu bertambah banyak) */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
          
          {/* MODUL SISTEM */}
          <div className="mb-6">
            <p className="px-3 text-[10px] font-semibold text-muted/50 mb-2 tracking-widest uppercase">Modul Sistem</p>
            <nav className="space-y-1">
              <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 bg-primary text-primary-foreground rounded-md font-medium text-sm shadow-sm">
                <span>📊</span> Dashboard
              </a>
              <a href="/dashboard/users" className="flex items-center gap-3 px-3 py-2.5 text-muted rounded-md font-medium text-sm transition-colors hover:bg-white/5 hover:text-white">
                <span>👥</span> Manajemen User
              </a>
            </nav>
          </div>

          {/* AKUN & PREFERENSI */}
          <div className="mb-6">
            <p className="px-3 text-[10px] font-semibold text-muted/50 mb-2 tracking-widest uppercase">Akun & Preferensi</p>
            <nav className="space-y-1">
              <a href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 text-muted rounded-md font-medium text-sm transition-colors hover:bg-white/5 hover:text-white">
                <span>👤</span> Profil Saya
              </a>
              <a href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 text-muted rounded-md font-medium text-sm transition-colors hover:bg-white/5 hover:text-white">
                <span>⚙️</span> Pengaturan Sistem
              </a>
            </nav>
          </div>
          
        </div>

        {/* Profil & Logout di bagian paling bawah */}
        <div className="mt-auto border-t border-sidebar-border pt-4 px-1">
          {/* Info Profil */}
          <div className="flex items-center gap-3 mb-4 overflow-hidden px-1">
            <div className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center text-sm font-bold shrink-0 text-white">
              B
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium leading-none mb-1 truncate text-white">Budi Cahyono</span>
              <span className="text-[10px] text-muted truncate">budicahyono.dev@gmail.com</span>
            </div>
          </div>
          
          {/* Tombol Logout - Di bawah profil */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}