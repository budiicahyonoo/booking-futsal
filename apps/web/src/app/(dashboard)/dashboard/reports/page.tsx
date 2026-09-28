'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass';
import { api } from '@/lib/api';
import { formatHour, formatRupiah, addDays, toDateStringWIB, dayOfWeek } from '@/lib/format';

interface OccupancyResponse {
  from: string;
  to: string;
  dates: string[];
  heatmap: Array<{
    courtId: string;
    courtName: string;
    rows: Array<{ hour: number; cells: Array<{ date: string; occupied: boolean; bookingCode?: string }> }>;
    occupancyPercentage: number;
  }>;
}

interface RevenueResponse {
  from: string;
  to: string;
  total: number;
  byCourt: Record<string, number>;
  byMethod: Record<string, number>;
  byDate: Record<string, number>;
}

export default function ReportsPage() {
  const [from, setFrom] = useState(addDays(toDateStringWIB(), -6));
  const [to, setTo] = useState(toDateStringWIB());
  const [occupancy, setOccupancy] = useState<OccupancyResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [occ, rev] = await Promise.all([
        api.get(`/reports/occupancy?from=${from}&to=${to}`),
        api.get(`/reports/revenue?from=${from}&to=${to}`),
      ]);
      setOccupancy(occ.data);
      setRevenue(rev.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#00033D]">Laporan</h1>
          <p className="text-sm text-[#00033D]/60">Okupansi & pendapatan per periode</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 px-3 rounded-xl bg-white/40 backdrop-blur-md border border-[#EAEDFB] text-sm text-[#00033D]" />
          <span className="text-[#00033D]/50 text-sm">s/d</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 px-3 rounded-xl bg-white/40 backdrop-blur-md border border-[#EAEDFB] text-sm text-[#00033D]" />
          <GlassButton size="sm" onClick={load} loading={loading}>Terapkan</GlassButton>
        </div>
      </div>

      {/* Ringkasan pendapatan */}
      {revenue && (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <GlassCard className="p-5">
            <p className="text-xs text-[#00033D]/60 mb-1">Total Pendapatan</p>
            <p className="text-2xl font-bold text-[#00033D]">{formatRupiah(revenue.total)}</p>
            <p className="text-xs text-[#00033D]/40">{revenue.from} s/d {revenue.to}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs text-[#00033D]/60 mb-1">Per Lapangan</p>
            {Object.entries(revenue.byCourt).map(([court, amount]) => (
              <div key={court} className="flex justify-between text-sm text-[#00033D]">
                <span>{court}</span><span className="font-medium">{formatRupiah(amount)}</span>
              </div>
            ))}
            {Object.keys(revenue.byCourt).length === 0 && <p className="text-sm text-[#00033D]/40">-</p>}
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs text-[#00033D]/60 mb-1">Per Metode</p>
            {Object.entries(revenue.byMethod).map(([method, amount]) => (
              <div key={method} className="flex justify-between text-sm text-[#00033D]">
                <span>{method === 'TRANSFER' ? 'Transfer' : method === 'QRIS' ? 'QRIS' : 'Lainnya'}</span>
                <span className="font-medium">{formatRupiah(amount)}</span>
              </div>
            ))}
            {Object.keys(revenue.byMethod).length === 0 && <p className="text-sm text-[#00033D]/40">-</p>}
          </GlassCard>
        </div>
      )}

      {/* Heatmap okupansi */}
      <h2 className="font-semibold text-[#00033D] mb-3">Heatmap Okupansi</h2>
      {loading ? (
        <GlassCard className="p-6 animate-pulse"><div className="h-48 bg-white/30 rounded-xl" /></GlassCard>
      ) : (
        <div className="grid gap-5">
          {occupancy?.heatmap.map((court) => (
            <GlassCard key={court.courtId} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#00033D]">{court.courtName}</h3>
                <GlassBadge>{court.occupancyPercentage}% terisi</GlassBadge>
              </div>
              <div className="overflow-x-auto">
                <table className="text-xs border-separate border-spacing-0.5">
                  <thead>
                    <tr>
                      <th className="sticky left-0 p-1"></th>
                      {occupancy.dates.map((d) => (
                        <th key={d} className="p-1 font-medium text-[#00033D]/60 text-[10px]">
                          {HARI_SINGKAT[dayOfWeek(d)]}<br />{d.slice(8)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {court.rows.map((row) => (
                      <tr key={row.hour}>
                        <td className="sticky left-0 pr-2 text-[#00033D]/60 font-medium whitespace-nowrap">
                          {formatHour(row.hour)}
                        </td>
                        {row.cells.map((cell) => (
                          <td key={cell.date}>
                            <div
                              title={`${formatHour(row.hour)} ${cell.date}${cell.bookingCode ? ` · ${cell.bookingCode}` : ''}`}
                              className={`w-8 h-6 rounded border ${
                                cell.occupied
                                  ? 'bg-[#0033FF]/70 border-[#0033FF]/40'
                                  : 'bg-white/20 border-white/30'
                              }`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
