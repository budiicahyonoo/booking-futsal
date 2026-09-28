'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassBadge, GlassInput, GlassModal } from '@/components/glass';
import { api } from '@/lib/api';
import {
  formatHour, formatRupiah, formatTanggalIndo, toDateStringWIB, addDays,
  STATUS_LABEL, STATUS_COLOR,
} from '@/lib/format';
import type { Booking, UserProfile } from '@/lib/types';

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState('');
  const [editingPhone, setEditingPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const load = useCallback(async () => {
    try {
      const [me, myBookings] = await Promise.all([
        api.get('/auth/me'),
        api.get('/bookings/me'),
      ]);
      setProfile(me.data);
      setEditingName(me.data.name || '');
      setEditingPhone(me.data.phone || '');
      setBookings(myBookings.data);
    } catch (e: any) {
      toast.error(e.message);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api.patch('/auth/me', { name: editingName, phone: editingPhone });
      toast.success('Profil diperbarui');
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-[#00033D] mb-6">Akun Saya</h1>

      {loading ? (
        <GlassCard className="p-6 animate-pulse"><div className="h-40 bg-white/30 rounded-xl" /></GlassCard>
      ) : profile && (
        <>
          {/* Profil */}
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-[#0033FF] flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_20px_rgba(0,51,255,0.35)]">
                {(profile.name || 'M')[0]}
              </div>
              <div>
                <p className="font-bold text-[#00033D] text-lg">{profile.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <GlassBadge>{profile.role}</GlassBadge>
                  {profile.memberProfile && (
                    <GlassBadge className={profile.memberProfile.type === 'REGULER' ? 'bg-[#977DFF]/20 border-[#977DFF]/30' : ''}>
                      {profile.memberProfile.type === 'REGULER' ? '⭐ Member Reguler' : 'Member'}
                    </GlassBadge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <GlassInput label="Nama" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
              <GlassInput label="No. HP" value={editingPhone} onChange={(e) => setEditingPhone(e.target.value)} />
            </div>
            <GlassButton className="mt-4" size="sm" loading={savingProfile} onClick={saveProfile}>
              Simpan Profil
            </GlassButton>

            {profile.memberProfile && (
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/30">
                <div className="text-center">
                  <p className="text-xl font-bold text-[#00033D]">{profile.memberProfile.totalBooking}</p>
                  <p className="text-xs text-[#00033D]/50">Total Booking</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-[#00033D]">{formatRupiah(profile.memberProfile.totalSpend)}</p>
                  <p className="text-xs text-[#00033D]/50">Total Belanja</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-[#00033D]">
                    {profile.memberProfile.lastBookingAt
                      ? formatTanggalIndo(String(profile.memberProfile.lastBookingAt).slice(0, 10), false)
                      : '-'}
                  </p>
                  <p className="text-xs text-[#00033D]/50">Booking Terakhir</p>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Riwayat booking (FR-BOOK-08) */}
          <h2 className="text-xl font-bold text-[#00033D] mb-4">Riwayat Booking</h2>
          {bookings.length === 0 ? (
            <GlassCard className="p-10 text-center">
              <p className="text-sm text-[#00033D]/60 mb-4">Belum ada booking.</p>
              <Link href="/booking">
                <GlassButton>Booking Sekarang</GlassButton>
              </Link>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} onDone={load} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookingCard({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const [policy, setPolicy] = useState<{ withinFreeWindow: boolean; penaltyPercentage: number; hoursLeft: number } | null>(null);
  const [reschedOpen, setReschedOpen] = useState(false);
  const [newDate, setNewDate] = useState(addDays(toDateStringWIB(), 1));
  const [newHour, setNewHour] = useState(booking.startHour);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT') {
      api.get(`/bookings/${booking.id}/policy`).then((r) => setPolicy(r.data)).catch(() => {});
    }
  }, [booking.id, booking.status]);

  async function cancel() {
    if (!confirm('Batalkan booking ini? Kebijakan pembatalan akan berlaku.')) return;
    setBusy(true);
    try {
      const res = await api.post(`/bookings/${booking.id}/cancel`, { reason: 'Dibatalkan oleh pemesan' });
      const p = res.data.policy;
      toast.success(
        p.penaltyPercentage > 0
          ? `Booking dibatalkan. DP hangus ${p.penaltyPercentage}%.`
          : 'Booking dibatalkan tanpa penalti.',
      );
      onDone();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function reschedule() {
    setBusy(true);
    try {
      await api.post(`/bookings/${booking.id}/reschedule`, { newDate, newStartHour: Number(newHour) });
      toast.success('Jadwal dipindahkan');
      setReschedOpen(false);
      onDone();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  const canManage = booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT';
  const upcoming = new Date(booking.date).getTime() + booking.startHour * 3600_000 > Date.now();

  return (
    <GlassCard className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#0033FF]">{booking.code}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[booking.status] || ''}`}>
              {STATUS_LABEL[booking.status] || booking.status}
            </span>
          </div>
          <p className="text-sm text-[#00033D]">
            {booking.court.name} · {formatTanggalIndo(String(booking.date).slice(0, 10))} ·{' '}
            {formatHour(booking.startHour)}–{formatHour(booking.endHour)}
          </p>
          <p className="text-xs text-[#00033D]/50">
            {booking.paymentType === 'DP' ? 'DP' : 'Lunas'} · dibayar {formatRupiah(booking.paidAmount)} dari {formatRupiah(booking.totalPrice)}
          </p>
          {policy && canManage && upcoming && (
            <p className={`text-xs ${policy.withinFreeWindow ? 'text-emerald-700' : 'text-amber-700'}`}>
              {policy.withinFreeWindow
                ? `✓ Reschedule/batal gratis (sisa ${policy.hoursLeft} jam)`
                : `⚠ Lewat batas gratis — penalti ${policy.penaltyPercentage}% DP`}
            </p>
          )}
        </div>
        {canManage && upcoming && (
          <div className="flex gap-2 shrink-0">
            <GlassButton size="sm" variant="secondary" onClick={() => setReschedOpen(true)}>Reschedule</GlassButton>
            <GlassButton size="sm" variant="danger" loading={busy} onClick={cancel}>Batalkan</GlassButton>
          </div>
        )}
      </div>

      <GlassModal open={reschedOpen} onClose={() => setReschedOpen(false)} title="Reschedule Booking">
        <div className="space-y-4">
          <p className="text-sm text-[#00033D]/70">
            Pilih jadwal baru dengan durasi yang sama ({formatHour(booking.startHour)}–{formatHour(booking.endHour)}).
          </p>
          <GlassInput label="Tanggal Baru" type="date" value={newDate} min={toDateStringWIB()} onChange={(e) => setNewDate(e.target.value)} />
          <GlassInput label="Jam Mulai" type="number" min={8} max={23} value={newHour} onChange={(e) => setNewHour(Number(e.target.value))} />
          <div className="flex gap-2 justify-end">
            <GlassButton variant="secondary" onClick={() => setReschedOpen(false)}>Batal</GlassButton>
            <GlassButton loading={busy} onClick={reschedule}>Simpan Jadwal Baru</GlassButton>
          </div>
        </div>
      </GlassModal>
    </GlassCard>
  );
}
