'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassInput, GlassBadge } from '@/components/glass';
import { api } from '@/lib/api';
import { formatHour, formatRupiah, formatTanggalIndo, STATUS_LABEL, STATUS_COLOR } from '@/lib/format';
import type { Booking, Venue } from '@/lib/types';

function StatusContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async (c: string) => {
    if (!c) return;
    setLoading(true);
    try {
      const res = await api.get(`/bookings/status/${encodeURIComponent(c)}`);
      setBooking(res.data);
    } catch (e: any) {
      setBooking(null);
      toast.error(e.message || 'Booking tidak ditemukan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCode) load(initialCode);
    api.get('/venues').then((r) => setVenue(r.data)).catch(() => {});
  }, [initialCode, load]);

  async function uploadProof() {
    if (!booking || !proofUrl.trim()) {
      toast.error('Tempel URL bukti transfer terlebih dahulu');
      return;
    }
    setUploading(true);
    try {
      await api.post(`/bookings/status/${booking.code}/proof`, { proofUrl });
      toast.success('Bukti transfer terkirim, menunggu konfirmasi admin');
      load(booking.code);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }

  const pendingTransfer = booking?.payments?.find(
    (p) => p.method === 'TRANSFER' && p.status === 'MENUNGGU',
  );

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#00033D] mb-2">Cek Status Booking</h1>
        <p className="text-sm text-[#00033D]/60">Masukkan kode booking dari notifikasi WhatsApp Anda</p>
      </div>

      <GlassCard className="p-5 mb-6">
        <div className="flex gap-2">
          <GlassInput
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Kode booking"
            className="flex-1"
          />
          <GlassButton onClick={() => load(code)} loading={loading}>Cek</GlassButton>
        </div>
      </GlassCard>

      {booking && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-[#00033D]">{booking.code}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLOR[booking.status] || ''}`}>
              {STATUS_LABEL[booking.status] || booking.status}
            </span>
          </div>

          <div className="space-y-1.5 text-sm mb-6">
            <div className="flex justify-between"><span className="text-[#00033D]/60">Nama</span><span className="font-medium text-[#00033D]">{booking.bookerName}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Lapangan</span><span className="font-medium text-[#00033D]">{booking.court.name}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Tanggal</span><span className="font-medium text-[#00033D]">{formatTanggalIndo(String(booking.date).slice(0, 10))}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Jam</span><span className="font-medium text-[#00033D]">{formatHour(booking.startHour)}–{formatHour(booking.endHour)}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Tipe</span><span className="font-medium text-[#00033D]">{booking.paymentType === 'DP' ? 'DP' : 'Lunas'}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Total</span><span className="font-medium text-[#00033D]">{formatRupiah(booking.totalPrice)}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Sudah dibayar</span><span className="font-semibold text-[#0033FF]">{formatRupiah(booking.paidAmount)}</span></div>
            {booking.status === 'PENDING_PAYMENT' && (
              <div className="flex justify-between"><span className="text-[#00033D]/60">Harus dibayar</span><span className="font-semibold text-[#0033FF]">{formatRupiah(booking.dpAmount)}</span></div>
            )}
          </div>

          {/* Instruksi transfer */}
          {booking.status === 'PENDING_PAYMENT' && pendingTransfer && (
            <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-[#00033D] mb-2">Instruksi Pembayaran</p>
              {venue?.bankName && (
                <p className="text-sm text-[#00033D]/70 mb-1">
                  Transfer <b>{formatRupiah(booking.dpAmount)}</b> ke {venue.bankName} a/n{' '}
                  {venue.bankAccountName} ({venue.bankAccount})
                </p>
              )}
              <p className="text-xs text-[#00033D]/50 mb-3">
                Setelah transfer, tempel link bukti transfer (gambar) di bawah ini.
              </p>
              <GlassInput
                label="URL bukti transfer"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://... (link gambar bukti transfer)"
              />
              <GlassButton className="mt-3 w-full" loading={uploading} onClick={uploadProof}>
                Kirim Bukti Transfer
              </GlassButton>
            </div>
          )}

          {booking.status === 'REJECTED' && booking.payments?.[0]?.rejectionReason && (
            <div className="bg-red-50/40 border border-red-300/40 rounded-xl p-4 text-sm text-red-700">
              Alasan penolakan: {booking.payments[0].rejectionReason}
            </div>
          )}

          {booking.status === 'CONFIRMED' && (
            <div className="bg-emerald-50/40 border border-emerald-300/40 rounded-xl p-4 text-sm text-emerald-800">
              ✅ Booking terkonfirmasi. Tunjukkan kode <b>{booking.code}</b> saat datang ke lokasi.
            </div>
          )}
        </GlassCard>
      )}

      {!booking && !loading && (
        <GlassCard className="p-8 text-center text-sm text-[#00033D]/50">
          Masukkan kode booking untuk melihat status tanpa perlu login.
        </GlassCard>
      )}
    </div>
  );
}

export default function BookingStatusPage() {
  return (
    <Suspense>
      <StatusContent />
    </Suspense>
  );
}
