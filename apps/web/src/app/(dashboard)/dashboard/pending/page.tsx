'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassBadge, GlassModal, GlassTextarea } from '@/components/glass';
import { api } from '@/lib/api';
import { formatHour, formatRupiah, formatTanggalIndo } from '@/lib/format';
import type { Booking } from '@/lib/types';

export default function PendingPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings?pending=true');
      setBookings(res.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm(b: Booking) {
    setBusy(b.id);
    try {
      await api.post(`/bookings/${b.id}/confirm`);
      toast.success(`Booking ${b.code} dikonfirmasi`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function reject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Alasan penolakan wajib diisi (tercatat di audit log)');
      return;
    }
    setBusy(rejectTarget.id);
    try {
      await api.post(`/bookings/${rejectTarget.id}/reject`, { reason: rejectReason });
      toast.success(`Booking ${rejectTarget.code} ditolak`);
      setRejectTarget(null);
      setRejectReason('');
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#00033D] mb-1">Verifikasi Pembayaran</h1>
      <p className="text-sm text-[#00033D]/60 mb-6">
        Booking transfer manual yang menunggu konfirmasi admin (target &lt; 15 menit).
      </p>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <GlassCard key={i} className="p-6 animate-pulse"><div className="h-24 bg-white/30 rounded-xl" /></GlassCard>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm text-[#00033D]/60">Tidak ada pembayaran menunggu verifikasi.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => {
            const payment = b.payments?.find((p) => p.status === 'MENUNGGU');
            return (
              <GlassCard key={b.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0033FF]">{b.code}</span>
                      <GlassBadge>{b.paymentType}</GlassBadge>
                    </div>
                    <p className="text-sm text-[#00033D]">
                      {b.bookerName} · {b.bookerPhone}
                    </p>
                    <p className="text-sm text-[#00033D]/70">
                      {b.court.name} · {formatTanggalIndo(String(b.date).slice(0, 10))} ·{' '}
                      {formatHour(b.startHour)}–{formatHour(b.endHour)}
                    </p>
                    <p className="text-sm">
                      <span className="text-[#00033D]/60">Nominal: </span>
                      <span className="font-bold text-[#00033D]">{formatRupiah(payment?.amount ?? b.dpAmount)}</span>
                      {payment?.proofUrl && (
                        <a
                          href={payment.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-xs text-[#0033FF] hover:underline"
                        >
                          Lihat bukti transfer →
                        </a>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <GlassButton loading={busy === b.id} onClick={() => confirm(b)}>
                      ✓ Konfirmasi
                    </GlassButton>
                    <GlassButton variant="danger" onClick={() => setRejectTarget(b)}>
                      ✕ Tolak
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <GlassModal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Tolak Pembayaran">
        <div className="space-y-4">
          <p className="text-sm text-[#00033D]/70">
            Tolak booking <b>{rejectTarget?.code}</b>? Slot dilepas kembali menjadi kosong dan
            pemesan mendapat notifikasi.
          </p>
          <GlassTextarea
            label="Alasan penolakan (wajib)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="cth. Nominal transfer tidak sesuai"
          />
          <div className="flex gap-2 justify-end">
            <GlassButton variant="secondary" onClick={() => setRejectTarget(null)}>Batal</GlassButton>
            <GlassButton variant="danger" loading={busy === rejectTarget?.id} onClick={reject}>
              Tolak Booking
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
