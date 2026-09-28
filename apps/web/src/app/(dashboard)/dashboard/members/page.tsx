'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass';
import { api } from '@/lib/api';
import { formatRupiah, formatTanggalIndo } from '@/lib/format';
import type { MemberRow } from '@/lib/types';

export default function MembersPage() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/members');
      setMembers(res.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRegular(m: MemberRow) {
    setBusyId(m.userId);
    try {
      await api.patch(`/members/${m.userId}/regular`, { isRegular: !m.isRegular });
      toast.success(`${m.name} ditandai ${!m.isRegular ? 'reguler' : 'biasa'}`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#00033D] mb-1">Member</h1>
      <p className="text-sm text-[#00033D]/60 mb-6">
        Tandai member reguler untuk harga khusus otomatis saat booking.
      </p>

      {loading ? (
        <GlassCard className="p-6 animate-pulse"><div className="h-40 bg-white/30 rounded-xl" /></GlassCard>
      ) : members.length === 0 ? (
        <GlassCard className="p-10 text-center text-sm text-[#00033D]/50">
          Belum ada member terdaftar.
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/30 text-left text-xs text-[#00033D]/60">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3 text-right">Total Booking</th>
                  <th className="px-4 py-3 text-right">Total Spend</th>
                  <th className="px-4 py-3">Booking Terakhir</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#00033D]">{m.name || '-'}</div>
                      <div className="text-xs text-[#00033D]/50">{m.phone || m.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <GlassBadge className={m.isRegular ? 'bg-[#977DFF]/20 border-[#977DFF]/30' : ''}>
                        {m.isRegular ? '⭐ Reguler' : 'Biasa'}
                      </GlassBadge>
                    </td>
                    <td className="px-4 py-3 text-right text-[#00033D]">{m.totalBooking}</td>
                    <td className="px-4 py-3 text-right text-[#00033D]">{formatRupiah(m.totalSpend)}</td>
                    <td className="px-4 py-3 text-[#00033D]/70">
                      {m.lastBookingAt ? formatTanggalIndo(String(m.lastBookingAt).slice(0, 10), false) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <GlassButton
                        size="sm"
                        variant={m.isRegular ? 'danger' : 'primary'}
                        loading={busyId === m.userId}
                        onClick={() => toggleRegular(m)}
                      >
                        {m.isRegular ? 'Jadikan Biasa' : 'Jadikan Reguler'}
                      </GlassButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
