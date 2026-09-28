'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassInput, GlassTextarea } from '@/components/glass';
import { api } from '@/lib/api';
import type { Venue } from '@/lib/types';

export default function SettingsPage() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [form, setForm] = useState<Partial<Venue>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/venues').then((res) => {
      setVenue(res.data);
      setForm(res.data);
    });
  }, []);

  function set<K extends keyof Venue>(key: K, value: Venue[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!venue) return;
    setSaving(true);
    try {
      await api.put(`/venues/${venue.id}`, form);
      toast.success('Pengaturan tersimpan');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!venue) {
    return (
      <div className="max-w-3xl mx-auto">
        <GlassCard className="p-6 animate-pulse"><div className="h-64 bg-white/30 rounded-xl" /></GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#00033D] mb-1">Pengaturan Venue</h1>
      <p className="text-sm text-[#00033D]/60 mb-6">Hanya Owner yang dapat mengubah pengaturan ini.</p>

      <div className="grid gap-5">
        {/* Profil venue (FR-SET-01) */}
        <GlassCard className="p-5">
          <h2 className="font-semibold text-[#00033D] mb-4">Profil Venue</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <GlassInput label="Nama GOR" value={form.name || ''} onChange={(e) => set('name', e.target.value)} />
            <GlassInput label="No. WhatsApp" value={form.contactWa || ''} onChange={(e) => set('contactWa', e.target.value)} />
            <GlassInput label="Alamat" value={form.address || ''} onChange={(e) => set('address', e.target.value)} className="sm:col-span-2" />
            <GlassInput label="URL Logo (opsional)" value={form.logoUrl || ''} onChange={(e) => set('logoUrl', e.target.value)} className="sm:col-span-2" />
          </div>
        </GlassCard>

        {/* Jam operasional (FR-SET: FR-COURT-02) */}
        <GlassCard className="p-5">
          <h2 className="font-semibold text-[#00033D] mb-4">Jam Operasional & Slot</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <GlassInput label="Jam Buka" type="number" min={0} max={23} value={form.openHour} onChange={(e) => set('openHour', Number(e.target.value))} />
            <GlassInput label="Jam Tutup" type="number" min={1} max={24} value={form.closeHour} onChange={(e) => set('closeHour', Number(e.target.value))} />
            <GlassInput label="Durasi Slot (jam)" type="number" min={0.5} step={0.5} value={form.slotDurationHours} onChange={(e) => set('slotDurationHours', Number(e.target.value))} />
          </div>
        </GlassCard>

        {/* Hold & DP (FR-SET-03/05) */}
        <GlassCard className="p-5">
          <h2 className="font-semibold text-[#00033D] mb-4">Hold Slot & DP</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <GlassInput label="Durasi Hold (menit)" type="number" value={form.holdDurationMinutes} onChange={(e) => set('holdDurationMinutes', Number(e.target.value))} hint="Slot dikunci selama checkout" />
            <GlassInput label="DP Default (%)" type="number" min={0} max={100} value={form.defaultDpPercentage} onChange={(e) => set('defaultDpPercentage', Number(e.target.value))} hint="0 = wajib lunas" />
          </div>
        </GlassCard>

        {/* Kebijakan pembatalan (FR-SET-05, FR-POLICY-01) */}
        <GlassCard className="p-5">
          <h2 className="font-semibold text-[#00033D] mb-4">Kebijakan Pembatalan & Reschedule</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <GlassInput label="Batas Reschedule Gratis (jam sebelum main)" type="number" value={form.freeRescheduleHours} onChange={(e) => set('freeRescheduleHours', Number(e.target.value))} />
            <GlassInput label="Penalti Pembatalan (% DP hangus)" type="number" min={0} max={100} value={form.cancellationPenaltyPercentage} onChange={(e) => set('cancellationPenaltyPercentage', Number(e.target.value))} />
          </div>
        </GlassCard>

        {/* Rekening & QRIS (FR-SET-02) */}
        <GlassCard className="p-5">
          <h2 className="font-semibold text-[#00033D] mb-4">Rekening Pembayaran</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <GlassInput label="Nama Bank" value={form.bankName || ''} onChange={(e) => set('bankName', e.target.value)} />
            <GlassInput label="No. Rekening" value={form.bankAccount || ''} onChange={(e) => set('bankAccount', e.target.value)} />
            <GlassInput label="Nama Pemilik Rekening" value={form.bankAccountName || ''} onChange={(e) => set('bankAccountName', e.target.value)} className="sm:col-span-2" />
            <GlassInput label="URL Gambar QRIS" value={form.qrisImageUrl || ''} onChange={(e) => set('qrisImageUrl', e.target.value)} className="sm:col-span-2" placeholder="https://..." />
          </div>
        </GlassCard>

        {/* Template notifikasi (FR-SET-04) */}
        <GlassCard className="p-5">
          <h2 className="font-semibold text-[#00033D] mb-4">Template Notifikasi</h2>
          <div className="space-y-4">
            <GlassTextarea
              label="Template WhatsApp"
              value={form.waTemplate || ''}
              onChange={(e) => set('waTemplate', e.target.value)}
              placeholder="Halo {{nama}}! Booking {{kode}}: {{lapangan}}, {{tanggal}} {{jam}}. Status: {{status}}."
            />
            <GlassTextarea
              label="Template Email"
              value={form.emailTemplate || ''}
              onChange={(e) => set('emailTemplate', e.target.value)}
            />
            <p className="text-xs text-[#00033D]/50">
              Variabel: {'{{nama}} {{kode}} {{lapangan}} {{tanggal}} {{jam}} {{status}}'}
            </p>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <GlassButton size="lg" loading={saving} onClick={save}>Simpan Pengaturan</GlassButton>
        </div>
      </div>
    </div>
  );
}
