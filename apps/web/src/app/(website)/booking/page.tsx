'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass';
import { api } from '@/lib/api';
import { formatHour, formatRupiah, formatTanggalIndo, addDays, toDateStringWIB } from '@/lib/format';
import type { AvailabilityResponse, SlotCell } from '@/lib/types';

const STATUS_STYLE: Record<string, string> = {
  KOSONG: 'bg-white/30 border-white/40 text-[#00033D] hover:bg-white/50 hover:border-[#977DFF]/50 hover:scale-[1.03]',
  TERISI: 'bg-[#00033D]/60 border-[#00033D]/30 text-white/80 cursor-not-allowed',
  HOLD: 'bg-amber-200/40 border-amber-300/50 text-amber-900 cursor-not-allowed',
  LEWAT: 'bg-gray-200/40 border-gray-300/40 text-gray-400 cursor-not-allowed',
};

export default function BookingPage() {
  const router = useRouter();
  const [date, setDate] = useState(toDateStringWIB());
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [selected, setSelected] = useState<Record<string, SlotCell>>({});
  const [courtName, setCourtName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);

  const loadAvailability = useCallback(async (d: string) => {
    try {
      const res = await api.get(`/availability?date=${d}`);
      setData(res.data);
    } catch (e: any) {
      toast.error(e.message || 'Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAvailability(date);
    // Real-time polling tiap 30 detik (PRD 10: kalender hidup)
    const interval = setInterval(() => loadAvailability(date), 30_000);
    return () => clearInterval(interval);
  }, [date, loadAvailability]);

  const selectedList = useMemo(() => Object.entries(selected), [selected]);

  const totalPrice = useMemo(
    () =>
      selectedList.reduce((sum, [, slot]) => {
        const isMember = data?.isMember && slot.memberPrice != null;
        return sum + (isMember ? slot.memberPrice! : slot.price);
      }, 0),
    [selectedList, data?.isMember],
  );

  function toggleSlot(courtId: string, courtNm: string, slot: SlotCell) {
    if (slot.status !== 'KOSONG') return;
    setCourtName(courtNm);
    setSelected((prev) => {
      const key = `${courtId}-${slot.startHour}`;
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        // Hanya slot berurutan di lapangan yang sama
        const otherCourt = Object.keys(next).find((k) => !k.startsWith(courtId));
        if (otherCourt) {
          toast.error('Pilih slot di lapangan yang sama');
          return prev;
        }
        // Slot harus berurutan
        const hours = Object.keys(next).map((k) => Number(k.split('-')[1]));
        if (hours.length > 0) {
          const min = Math.min(...hours);
          const max = Math.max(...hours);
          if (slot.startHour !== min - 1 && slot.startHour !== max + 1) {
            toast.error('Pilih slot yang berurutan');
            return prev;
          }
        }
        next[key] = slot;
      }
      return next;
    });
  }

  async function handleHold() {
    if (selectedList.length === 0) return;
    setHolding(true);
    const [courtId] = selectedList[0][0].split('-');
    try {
      const res = await api.post('/bookings/hold', {
        courtId,
        date,
        slots: selectedList.map(([, slot]) => ({
          startHour: slot.startHour,
          endHour: slot.endHour,
        })),
      });
      // Simpan sesi hold utk checkout
      sessionStorage.setItem(
        'checkout_session',
        JSON.stringify({
          sessionId: res.data.sessionId,
          courtId,
          courtName,
          date,
          slots: selectedList.map(([, slot]) => ({ ...slot })),
          expiredAt: res.data.expiredAt,
        }),
      );
      router.push('/booking/checkout');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setHolding(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#00033D] mb-2">Booking Lapangan</h1>
        <p className="text-[#00033D]/60">
          {data ? `${data.venue.name} · ${formatHour(data.venue.openHour)}–${formatHour(data.venue.closeHour)} WIB` : ''}
        </p>
      </div>

      {/* Pilih tanggal */}
      <GlassCard className="p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {Array.from({ length: 14 }).map((_, i) => {
            const d = addDays(toDateStringWIB(), i);
            const isActive = d === date;
            const [y, m, dd] = d.split('-').map(Number);
            const dow = new Date(Date.UTC(y, m - 1, dd)).getUTCDay();
            return (
              <button
                key={d}
                onClick={() => { setDate(d); setSelected({}); }}
                className={`flex flex-col items-center px-4 py-2.5 rounded-xl min-w-16 shrink-0 transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0033FF] text-white shadow-[0_4px_20px_rgba(0,51,255,0.35)]'
                    : 'bg-white/20 border border-white/30 text-[#00033D] hover:bg-white/40'
                }`}
              >
                <span className="text-[10px] opacity-70">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][dow]}
                </span>
                <span className="text-lg font-bold">{dd}</span>
                <span className="text-[10px] opacity-70">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][m - 1]}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-[#00033D]/70">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-white/30 border border-white/40" /> Kosong</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-[#00033D]/60" /> Terisi</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-200/40 border border-amber-300/50" /> Di-hold</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-gray-200/40" /> Lewat</span>
      </div>

      {/* Grid slot per lapangan */}
      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-6 w-40 bg-white/40 rounded-xl mb-4" />
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {Array.from({ length: 16 }).map((_, j) => (
                  <div key={j} className="h-14 bg-white/30 rounded-xl" />
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {data?.courts.map((court) => (
            <GlassCard key={court.courtId} className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg text-[#00033D]">{court.courtName}</h2>
                  <p className="text-xs text-[#00033D]/50 capitalize">{court.surfaceType}</p>
                </div>
                <GlassBadge>{data.dayType === 'WEEKEND' ? 'Weekend' : 'Weekday'}</GlassBadge>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {court.slots.map((slot) => {
                  const key = `${court.courtId}-${slot.startHour}`;
                  const isSelected = !!selected[key];
                  const isMember = data.isMember && slot.memberPrice != null;
                  const price = isMember ? slot.memberPrice! : slot.price;
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSlot(court.courtId, court.courtName, slot)}
                      disabled={slot.status !== 'KOSONG'}
                      title={`${formatHour(slot.startHour)}–${formatHour(slot.endHour)} · ${formatRupiah(price)}`}
                      className={`rounded-xl border p-2 text-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#0033FF] text-white border-[#0033FF] shadow-[0_4px_20px_rgba(0,51,255,0.35)] scale-[1.03]'
                          : STATUS_STYLE[slot.status]
                      }`}
                    >
                      <div className="text-xs font-semibold">{formatHour(slot.startHour)}</div>
                      <div className="text-[10px] opacity-70">
                        {slot.status === 'KOSONG' || isSelected ? formatRupiah(price) : slot.status === 'HOLD' ? 'Hold' : slot.status === 'LEWAT' ? 'Lewat' : 'Terisi'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Bar pilihan (sticky bottom mobile-first) */}
      {selectedList.length > 0 && (
        <div className="sticky bottom-4 mt-6 z-40">
          <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-[#00033D]">
                {selectedList.length} slot · {courtName} · {formatTanggalIndo(date, false)}
              </p>
              <p className="text-xs text-[#00033D]/60">
                {formatHour(Math.min(...selectedList.map(([, s]) => s.startHour)))}–
                {formatHour(Math.max(...selectedList.map(([, s]) => s.endHour)))} ·{' '}
                <span className="font-semibold text-[#0033FF]">{formatRupiah(totalPrice)}</span>
              </p>
            </div>
            <GlassButton onClick={handleHold} loading={holding} size="lg" className="w-full sm:w-auto">
              Lanjut ke Pembayaran
            </GlassButton>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
