'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassBadge, GlassModal, GlassTextarea } from '@/components/glass';
import { api } from '@/lib/api';
import { formatHour, formatRupiah, formatTanggalIndo, STATUS_LABEL, STATUS_COLOR } from '@/lib/format';
import type { Booking } from '@/lib/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detail, setDetail] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (date) params.set('date', date);
      const res = await api.get(`/bookings?${params.toString()}`);
      setBookings(res.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, date]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm(booking: Booking) {
    try {
      await api.post(`/bookings/${booking.id}/confirm`);
      toast.success(`Booking ${booking.code} dikonfirmasi`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function reject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Alasan wajib diisi');
      return;
    }
    try {
      await api.post(`/bookings/${rejectTarget.id}/reject`, { reason: rejectReason });
      toast.success(`Booking ${rejectTarget.code} ditolak`);
      setRejectTarget(null);
      setRejectReason('');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#00033D]">Semua Booking</h1>
        <div className="flex gap-2 flex-wrap">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white/40 backdrop-blur-md border border-[#EAEDFB] text-sm text-[#00033D]"
          >
            <option value="">Semua status</option>
            <option value="PENDING_PAYMENT">Menunggu Konfirmasi</option>
            <option value="CONFIRMED">Terkonfirmasi</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
            <option value="REJECTED">Ditolak</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white/40 backdrop-blur-md border border-[#EAEDFB] text-sm text-[#00033D]"
          />
        </div>
      </div>

      {loading ? (
        <GlassCard className="p-6 animate-pulse"><div className="h-48 bg-white/30 rounded-xl" /></GlassCard>
      ) : bookings.length === 0 ? (
        <GlassCard className="p-10 text-center text-sm text-[#00033D]/50">Belum ada booking.</GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/30 text-left text-xs text-[#00033D]/60">
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Pemesan</th>
                  <th className="px-4 py-3">Jadwal</th>
                  <th className="px-4 py-3">Nominal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0033FF]">{b.code}</td>
                    <td className="px-4 py-3">
                      <div className="text-[#00033D] font-medium">{b.bookerName}</div>
                      <div className="text-xs text-[#00033D]/50">{b.bookerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-[#00033D]">
                      {b.court.name}<br />
                      <span className="text-xs text-[#00033D]/50">
                        {formatTanggalIndo(String(b.date).slice(0, 10), false)} · {formatHour(b.startHour)}–{formatHour(b.endHour)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#00033D]">
                      {formatRupiah(b.paidAmount || b.dpAmount)}
                      <span className="text-xs text-[#00033D]/50 block">dari {formatRupiah(b.totalPrice)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLOR[b.status] || ''}`}>
                        {STATUS_LABEL[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-end">
                        {b.status === 'PENDING_PAYMENT' ? (
                          <>
                            <GlassButton size="sm" onClick={() => confirm(b)}>Konfirmasi</GlassButton>
                            <GlassButton size="sm" variant="danger" onClick={() => setRejectTarget(b)}>Tolak</GlassButton>
                          </>
                        ) : (
                          <GlassButton size="sm" variant="secondary" onClick={() => setDetail(b)}>Detail</GlassButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Modal detail */}
      <GlassModal open={!!detail} onClose={() => setDetail(null)} title={`Booking ${detail?.code || ''}`} wide>
        {detail && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#00033D]/60">Pemesan</span><span className="text-[#00033D] font-medium">{detail.bookerName} ({detail.bookerPhone})</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Lapangan</span><span className="text-[#00033D]">{detail.court.name}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Jadwal</span><span className="text-[#00033D]">{formatTanggalIndo(String(detail.date).slice(0, 10))} · {formatHour(detail.startHour)}–{formatHour(detail.endHour)}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Tipe</span><span className="text-[#00033D]">{detail.paymentType} · {detail.isWalkIn ? 'Walk-in' : 'Online'}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Total / Dibayar</span><span className="text-[#00033D]">{formatRupiah(detail.totalPrice)} / {formatRupiah(detail.paidAmount)}</span></div>
            {detail.payments?.map((p) => (
              <div key={p.id} className="border-t border-white/30 pt-2 mt-2">
                <div className="flex justify-between"><span className="text-[#00033D]/60">Pembayaran {p.method}</span><span className="text-[#00033D]">{formatRupiah(p.amount)} · {p.status}</span></div>
                {p.proofUrl && (
                  <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-[#0033FF] hover:underline">
                    Lihat bukti transfer →
                  </a>
                )}
                {p.rejectionReason && <p className="text-xs text-red-600 mt-1">Alasan: {p.rejectionReason}</p>}
              </div>
            ))}
          </div>
        )}
      </GlassModal>

      {/* Modal tolak */}
      <GlassModal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Tolak Pembayaran">
        <div className="space-y-4">
          <p className="text-sm text-[#00033D]/70">
            Tolak booking <b>{rejectTarget?.code}</b>? Slot akan dilepas dan pemesan diberi tahu alasannya.
          </p>
          <GlassTextarea
            label="Alasan penolakan (wajib)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="cth. Bukti transfer tidak sesuai nominal"
          />
          <div className="flex gap-2 justify-end">
            <GlassButton variant="secondary" onClick={() => setRejectTarget(null)}>Batal</GlassButton>
            <GlassButton variant="danger" onClick={reject}>Tolak Booking</GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
