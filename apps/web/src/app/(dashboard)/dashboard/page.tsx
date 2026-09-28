'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton } from '@/components/glass';
import { api } from '@/lib/api';
import { formatRupiah, formatTanggalIndo, toDateStringWIB } from '@/lib/format';
import type { DailySummary } from '@/lib/types';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports/daily')
      .then((res) => setSummary(res.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = summary
    ? [
        { label: 'Booking Hari Ini', value: String(summary.totalBookings), icon: '📋', sub: `${summary.statusBreakdown.confirmed} terkonfirmasi · ${summary.statusBreakdown.pending} pending` },
        { label: 'Pendapatan Hari Ini', value: formatRupiah(summary.revenue), icon: '💰', sub: `${summary.bookedHours} jam terjual` },
        { label: 'Okupansi', value: `${summary.occupancyPercentage}%`, icon: '📈', sub: `${summary.bookedHours}/${summary.operationalHours} jam operasional` },
        { label: 'Menunggu Verifikasi', value: String(summary.pendingPayments), icon: '⏳', sub: 'Perlu ditindaklanjuti admin' },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#00033D]">Dashboard</h1>
          <p className="text-sm text-[#00033D]/60">
            {summary ? formatTanggalIndo(summary.date) : 'Ringkasan harian'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pending">
            <GlassButton variant="secondary" size="sm">⏳ Verifikasi Pembayaran</GlassButton>
          </Link>
          <Link href="/dashboard/calendar">
            <GlassButton size="sm">📅 Lihat Kalender</GlassButton>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-4 w-24 bg-white/40 rounded mb-3" />
              <div className="h-8 w-28 bg-white/40 rounded mb-2" />
              <div className="h-3 w-32 bg-white/30 rounded" />
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => (
            <GlassCard key={c.label} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#00033D]/60">{c.label}</span>
                <span className="text-lg">{c.icon}</span>
              </div>
              <div className="text-2xl font-bold text-[#00033D]">{c.value}</div>
              <p className="text-xs text-[#00033D]/50 mt-1">{c.sub}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Aksi cepat */}
      <h2 className="font-semibold text-[#00033D] mb-3">Aksi Cepat</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/pending">
          <GlassCard className="p-5 hover:bg-white/40 transition-all hover:scale-[1.02] cursor-pointer">
            <div className="text-2xl mb-2">✅</div>
            <p className="font-semibold text-sm text-[#00033D]">Konfirmasi Pembayaran</p>
            <p className="text-xs text-[#00033D]/50">Verifikasi bukti transfer manual</p>
          </GlassCard>
        </Link>
        <Link href="/dashboard/calendar">
          <GlassCard className="p-5 hover:bg-white/40 transition-all hover:scale-[1.02] cursor-pointer">
            <div className="text-2xl mb-2">📝</div>
            <p className="font-semibold text-sm text-[#00033D]">Booking Walk-in</p>
            <p className="text-xs text-[#00033D]/50">Catat booking manual pelanggan</p>
          </GlassCard>
        </Link>
        <Link href="/dashboard/reports">
          <GlassCard className="p-5 hover:bg-white/40 transition-all hover:scale-[1.02] cursor-pointer">
            <div className="text-2xl mb-2">📈</div>
            <p className="font-semibold text-sm text-[#00033D]">Laporan Okupansi</p>
            <p className="text-xs text-[#00033D]/50">Heatmap jam ramai & pendapatan</p>
          </GlassCard>
        </Link>
        <Link href="/dashboard/settings">
          <GlassCard className="p-5 hover:bg-white/40 transition-all hover:scale-[1.02] cursor-pointer">
            <div className="text-2xl mb-2">⚙️</div>
            <p className="font-semibold text-sm text-[#00033D]">Pengaturan Venue</p>
            <p className="text-xs text-[#00033D]/50">Jam operasional, DP, kebijakan</p>
          </GlassCard>
        </Link>
      </div>
    </div>
  );
}
