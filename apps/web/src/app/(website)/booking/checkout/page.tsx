'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassBadge } from '@/components/glass';
import { api } from '@/lib/api';
import { formatHour, formatRupiah, formatTanggalIndo } from '@/lib/format';
import type { SlotCell, Venue } from '@/lib/types';

interface CheckoutSession {
  sessionId: string;
  courtId: string;
  courtName: string;
  date: string;
  slots: SlotCell[];
  expiredAt: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentType, setPaymentType] = useState<'DP' | 'LUNAS'>('DP');
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'QRIS'>('TRANSFER');
  const [loading, setLoading] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Muat sesi hold dari sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('checkout_session');
    if (!raw) {
      toast.error('Tidak ada slot yang di-hold. Silakan pilih slot ulang.');
      router.replace('/booking');
      return;
    }
    const parsed: CheckoutSession = JSON.parse(raw);
    setSession(parsed);

    api.get('/venues').then((res) => setVenue(res.data)).catch(() => {});

    // Prefill jika member sudah login
    api
      .get('/auth/me')
      .then((res) => {
        if (res.data?.name) setName(res.data.name);
        if (res.data?.phone) setPhone(res.data.phone);
        if (res.data?.email) setEmail(res.data.email);
      })
      .catch(() => {}); // guest
  }, [router]);

  // Countdown hold (FR-SCHED-03: hold 10 menit)
  useEffect(() => {
    if (!session) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(session.expiredAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        toast.error('Waktu hold habis. Silakan pilih slot ulang.');
        router.replace('/booking');
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session, router]);

  const totalPrice = useMemo(() => {
    if (!session) return 0;
    return session.slots.reduce((sum, s) => sum + s.price, 0);
  }, [session]);

  const dpAmount = useMemo(() => {
    if (!venue) return 0;
    if (paymentType === 'LUNAS') return totalPrice;
    return Math.ceil((totalPrice * (venue.defaultDpPercentage ?? 50)) / 100);
  }, [totalPrice, paymentType, venue]);

  const amountDue = paymentType === 'LUNAS' ? totalPrice : dpAmount;

  async function submit() {
    if (!session) return;
    if (!name.trim() || !phone.trim()) {
      toast.error('Nama dan No. HP wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/bookings/checkout', {
        sessionId: session.sessionId,
        bookerName: name,
        bookerPhone: phone,
        email: email || undefined,
        paymentType,
        paymentMethod,
      });
      setBookingCode(res.data.bookingCode);
      sessionStorage.removeItem('checkout_session');
      toast.success('Booking berhasil dibuat!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Sukses view
  if (bookingCode && session) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16">
        <GlassCard className="p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-[#00033D] mb-2">Booking Dibuat!</h1>
          <p className="text-sm text-[#00033D]/60 mb-6">
            {paymentMethod === 'QRIS'
              ? 'Selesaikan pembayaran QRIS Anda. Status otomatis terkonfirmasi setelah pembayaran berhasil.'
              : 'Silakan transfer sesuai nominal di bawah, lalu upload bukti transfer.'}
          </p>

          <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#00033D]/60">Kode Booking</span><span className="font-bold text-[#0033FF]">{bookingCode}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Lapangan</span><span className="font-medium text-[#00033D]">{session.courtName}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Tanggal</span><span className="font-medium text-[#00033D]">{formatTanggalIndo(session.date)}</span></div>
            <div className="flex justify-between"><span className="text-[#00033D]/60">Jam</span><span className="font-medium text-[#00033D]">{formatHour(session.slots[0].startHour)}–{formatHour(session.slots[session.slots.length - 1].endHour)}</span></div>
            <div className="flex justify-between border-t border-white/40 pt-2"><span className="text-[#00033D]/60">Nominal dibayar</span><span className="font-bold text-[#00033D]">{formatRupiah(amountDue)}</span></div>
            {venue?.bankName && paymentMethod === 'TRANSFER' && (
              <div className="text-xs text-[#00033D]/60 pt-1">
                Transfer ke {venue.bankName} a/n {venue.bankAccountName} ({venue.bankAccount})
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {paymentMethod === 'TRANSFER' && (
              <GlassButton onClick={() => router.push(`/booking/status?code=${bookingCode}`)}>
                Upload Bukti Transfer
              </GlassButton>
            )}
            <GlassButton variant="secondary" onClick={() => router.push(`/booking/status?code=${bookingCode}`)}>
              Lihat Status Booking
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!session) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#00033D] mb-2">Checkout</h1>
        <GlassBadge className={secondsLeft < 120 ? 'bg-red-100/60 border-red-300/50' : ''}>
          ⏱ Slot di-hold {minutes}:{String(seconds).padStart(2, '0')}
        </GlassBadge>
      </div>

      {/* Ringkasan */}
      <GlassCard className="p-5 mb-6">
        <h2 className="font-semibold text-[#00033D] mb-3">Ringkasan Booking</h2>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-[#00033D]/60">Lapangan</span><span className="font-medium text-[#00033D]">{session.courtName}</span></div>
          <div className="flex justify-between"><span className="text-[#00033D]/60">Tanggal</span><span className="font-medium text-[#00033D]">{formatTanggalIndo(session.date)}</span></div>
          <div className="flex justify-between"><span className="text-[#00033D]/60">Jam</span><span className="font-medium text-[#00033D]">{formatHour(session.slots[0].startHour)}–{formatHour(session.slots[session.slots.length - 1].endHour)}</span></div>
          <div className="flex justify-between"><span className="text-[#00033D]/60">Jumlah slot</span><span className="font-medium text-[#00033D]">{session.slots.length}</span></div>
          <div className="flex justify-between border-t border-white/40 pt-2 mt-2"><span className="text-[#00033D]/60">Total</span><span className="font-bold text-[#00033D]">{formatRupiah(totalPrice)}</span></div>
        </div>
      </GlassCard>

      {/* Data pemesan */}
      <GlassCard className="p-5 mb-6">
        <h2 className="font-semibold text-[#00033D] mb-4">Data Pemesan</h2>
        <div className="space-y-4">
          <GlassInput label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Rian" required />
          <GlassInput label="No. HP (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="cth. 081234567890" required />
          <GlassInput label="Email (opsional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cth. rian@email.com" hint="Notifikasi dikirim ke WhatsApp; email opsional" />
        </div>
      </GlassCard>

      {/* Pembayaran */}
      <GlassCard className="p-5 mb-6">
        <h2 className="font-semibold text-[#00033D] mb-4">Metode Pembayaran</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setPaymentType('DP')}
            className={`p-4 rounded-xl border text-left transition-all ${paymentType === 'DP' ? 'bg-[#0033FF]/10 border-[#0033FF]/50' : 'bg-white/20 border-white/30 hover:bg-white/30'}`}
          >
            <p className="font-semibold text-sm text-[#00033D]">DP {venue?.defaultDpPercentage ?? 50}%</p>
            <p className="text-xs text-[#00033D]/60">Bayar sisanya di lokasi</p>
            <p className="text-sm font-bold text-[#0033FF] mt-1">{formatRupiah(dpAmount)}</p>
          </button>
          <button
            onClick={() => setPaymentType('LUNAS')}
            className={`p-4 rounded-xl border text-left transition-all ${paymentType === 'LUNAS' ? 'bg-[#0033FF]/10 border-[#0033FF]/50' : 'bg-white/20 border-white/30 hover:bg-white/30'}`}
          >
            <p className="font-semibold text-sm text-[#00033D]">Lunas</p>
            <p className="text-xs text-[#00033D]/60">Bayar penuh di muka</p>
            <p className="text-sm font-bold text-[#0033FF] mt-1">{formatRupiah(totalPrice)}</p>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('TRANSFER')}
            className={`p-4 rounded-xl border text-left transition-all ${paymentMethod === 'TRANSFER' ? 'bg-[#0033FF]/10 border-[#0033FF]/50' : 'bg-white/20 border-white/30 hover:bg-white/30'}`}
          >
            <p className="font-semibold text-sm text-[#00033D]">🏦 Transfer Bank</p>
            <p className="text-xs text-[#00033D]/60">Upload bukti, dikonfirmasi admin</p>
          </button>
          <button
            onClick={() => setPaymentMethod('QRIS')}
            className={`p-4 rounded-xl border text-left transition-all ${paymentMethod === 'QRIS' ? 'bg-[#0033FF]/10 border-[#0033FF]/50' : 'bg-white/20 border-white/30 hover:bg-white/30'}`}
          >
            <p className="font-semibold text-sm text-[#00033D]">📱 QRIS</p>
            <p className="text-xs text-[#00033D]/60">Otomatis terkonfirmasi</p>
          </button>
        </div>
      </GlassCard>

      <GlassButton size="lg" className="w-full" loading={loading} onClick={submit}>
        Buat Booking — {formatRupiah(amountDue)}
      </GlassButton>
      <p className="text-xs text-center text-[#00033D]/40 mt-3">
        Dengan melanjutkan, slot akan dikunci sesuai kebijakan pembatalan venue.
      </p>
    </div>
  );
}
