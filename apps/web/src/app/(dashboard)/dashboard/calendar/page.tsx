'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassModal, GlassBadge } from '@/components/glass';
import { api } from '@/lib/api';
import { formatHour, formatRupiah, formatTanggalIndo, addDays, toDateStringWIB } from '@/lib/format';
import type { AvailabilityResponse } from '@/lib/types';

const CELL_STYLE: Record<string, string> = {
  KOSONG: 'bg-white/30 border-white/40 text-[#00033D]/60 hover:bg-[#0033FF]/10 hover:border-[#0033FF]/40',
  TERISI: 'bg-[#0033FF]/20 border-[#0033FF]/30 text-[#00033D] cursor-pointer hover:bg-[#0033FF]/30',
  HOLD: 'bg-amber-200/40 border-amber-300/50 text-amber-900',
  LEWAT: 'bg-gray-200/40 border-gray-300/40 text-gray-400',
};

interface WalkInForm {
  courtId: string;
  startHour: number;
  endHour: number;
  bookerName: string;
  bookerPhone: string;
  paymentType: 'DP' | 'LUNAS';
  notes: string;
}

export default function CalendarPage() {
  const [date, setDate] = useState(toDateStringWIB());
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [form, setForm] = useState<WalkInForm>({
    courtId: '', startHour: 0, endHour: 0, bookerName: '', bookerPhone: '', paymentType: 'LUNAS', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/availability?date=${d}`);
      setData(res.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
    const interval = setInterval(() => load(date), 30_000);
    return () => clearInterval(interval);
  }, [date, load]);

  function openWalkIn(courtId: string, startHour: number, endHour: number) {
    setForm({
      courtId,
      startHour,
      endHour,
      bookerName: '',
      bookerPhone: '',
      paymentType: 'LUNAS',
      notes: '',
    });
    setWalkInOpen(true);
  }

  async function saveWalkIn() {
    if (!form.bookerName.trim() || !form.bookerPhone.trim()) {
      toast.error('Nama & No. HP wajib diisi');
      return;
    }
    setSaving(true);
    try {
      await api.post('/bookings/walk-in', { ...form, date });
      toast.success('Booking walk-in tersimpan');
      setWalkInOpen(false);
      load(date);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#00033D]">Kalender Jadwal</h1>
          <p className="text-sm text-[#00033D]/60">{formatTanggalIndo(date)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setDate(addDays(date, -1))} className="px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-sm text-[#00033D] hover:bg-white/30">←</button>
          <button onClick={() => setDate(toDateStringWIB())} className="px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-sm text-[#00033D] hover:bg-white/30">Hari ini</button>
          <button onClick={() => setDate(addDays(date, 1))} className="px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-sm text-[#00033D] hover:bg-white/30">→</button>
          <button onClick={() => setDate(addDays(date, 7))} className="px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-sm text-[#00033D] hover:bg-white/30">+7 hari</button>
        </div>
      </div>

      {loading ? (
        <GlassCard className="p-6 animate-pulse">
          <div className="h-64 bg-white/30 rounded-xl" />
        </GlassCard>
      ) : (
        <div className="grid gap-5">
          {data?.courts.map((court) => (
            <GlassCard key={court.courtId} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#00033D]">{court.courtName}</h2>
                <GlassBadge>{court.slots.filter((s) => s.status === 'TERISI').length} terisi</GlassBadge>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-1.5">
                {court.slots.map((slot) => (
                  <button
                    key={slot.startHour}
                    onClick={() => (slot.status === 'KOSONG' ? openWalkIn(court.courtId, slot.startHour, slot.endHour) : undefined)}
                    title={`${formatHour(slot.startHour)}–${formatHour(slot.endHour)}${slot.bookingCode ? ` · ${slot.bookingCode}` : ''}`}
                    className={`rounded-lg border py-2 text-center text-[10px] font-medium transition-all ${CELL_STYLE[slot.status] || ''}`}
                  >
                    {formatHour(slot.startHour)}
                  </button>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal walk-in */}
      <GlassModal open={walkInOpen} onClose={() => setWalkInOpen(false)} title="Booking Walk-in / Telepon">
        <div className="space-y-4">
          <div className="text-sm text-[#00033D]/70 bg-white/30 rounded-xl p-3 border border-white/30">
            {data && form.courtId && (
              <>
                <b>{data.courts.find((c) => c.courtId === form.courtId)?.courtName}</b> ·{' '}
                {formatTanggalIndo(date)} · {formatHour(form.startHour)}–{formatHour(form.endHour)}
              </>
            )}
          </div>
          <GlassInput label="Nama Pelanggan" value={form.bookerName} onChange={(e) => setForm({ ...form, bookerName: e.target.value })} required />
          <GlassInput label="No. HP" value={form.bookerPhone} onChange={(e) => setForm({ ...form, bookerPhone: e.target.value })} required />
          <GlassSelect label="Tipe Pembayaran" value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value as 'DP' | 'LUNAS' })}>
            <option value="LUNAS">Lunas (bayar di tempat)</option>
            <option value="DP">DP</option>
          </GlassSelect>
          <GlassInput label="Catatan (opsional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2 justify-end">
            <GlassButton variant="secondary" onClick={() => setWalkInOpen(false)}>Batal</GlassButton>
            <GlassButton loading={saving} onClick={saveWalkIn}>Simpan</GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
