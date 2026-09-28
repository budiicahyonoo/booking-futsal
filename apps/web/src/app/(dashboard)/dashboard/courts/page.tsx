'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassModal, GlassBadge } from '@/components/glass';
import { api } from '@/lib/api';
import { formatRupiah, formatHour } from '@/lib/format';
import type { Court, PricingRule } from '@/lib/types';

interface RuleRow {
  dayType: 'WEEKDAY' | 'WEEKEND';
  startHour: number;
  endHour: number;
  price: number;
  memberPrice: number | null;
}

const EMPTY_COURT = { name: '', surfaceType: 'vinyl', capacity: 10, photoUrl: '' };

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Court | null>(null);
  const [form, setForm] = useState(EMPTY_COURT);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pricingCourt, setPricingCourt] = useState<Court | null>(null);
  const [rules, setRules] = useState<RuleRow[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/courts/all');
      setCourts(res.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_COURT);
    setModalOpen(true);
  }

  function openEdit(court: Court) {
    setEditing(court);
    setModalOpen(true);
    setForm({
      name: court.name,
      surfaceType: court.surfaceType,
      capacity: court.capacity,
      photoUrl: court.photoUrl || '',
    });
  }

  async function saveCourt() {
    if (!form.name.trim()) {
      toast.error('Nama lapangan wajib diisi');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/courts/${editing.id}`, form);
        toast.success('Lapangan diperbarui');
      } else {
        await api.post('/courts', form);
        toast.success('Lapangan ditambahkan');
      }
      setEditing(null);
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(court: Court) {
    try {
      await api.patch(`/courts/${court.id}/status`, {
        status: court.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF',
      });
      toast.success(`${court.name} ${court.status === 'AKTIF' ? 'dinonaktifkan' : 'diaktifkan'}`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function openPricing(court: Court) {
    setPricingCourt(court);
    setRules(
      court.pricingRules.length > 0
        ? court.pricingRules.map((r) => ({
            dayType: r.dayType,
            startHour: r.startHour,
            endHour: r.endHour,
            price: r.price,
            memberPrice: r.memberPrice ?? null,
          }))
        : [
            { dayType: 'WEEKDAY', startHour: 8, endHour: 17, price: 100000, memberPrice: 90000 },
            { dayType: 'WEEKDAY', startHour: 17, endHour: 24, price: 150000, memberPrice: 135000 },
            { dayType: 'WEEKEND', startHour: 8, endHour: 15, price: 150000, memberPrice: 135000 },
            { dayType: 'WEEKEND', startHour: 15, endHour: 24, price: 200000, memberPrice: 180000 },
          ],
    );
  }

  async function savePricing() {
    if (!pricingCourt) return;
    setSaving(true);
    try {
      await api.put(`/courts/${pricingCourt.id}/pricing-rules`, { rules });
      toast.success('Harga diperbarui');
      setPricingCourt(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  function updateRule(idx: number, patch: Partial<RuleRow>) {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#00033D]">Lapangan & Harga</h1>
          <p className="text-sm text-[#00033D]/60">Kelola lapangan dan aturan harga per slot</p>
        </div>
        <GlassButton onClick={openCreate}>+ Tambah Lapangan</GlassButton>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <GlassCard key={i} className="p-6 animate-pulse"><div className="h-32 bg-white/30 rounded-xl" /></GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courts.map((court) => (
            <GlassCard key={court.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-bold text-[#00033D] text-lg">{court.name}</h2>
                  <p className="text-xs text-[#00033D]/50 capitalize">
                    {court.surfaceType} · kapasitas {court.capacity}
                  </p>
                </div>
                <GlassBadge
                  className={
                    court.status === 'AKTIF'
                      ? 'bg-emerald-100/60 border-emerald-300/50 text-emerald-800'
                      : 'bg-red-100/60 border-red-300/50 text-red-800'
                  }
                >
                  {court.status}
                </GlassBadge>
              </div>

              <div className="space-y-1 mb-4 text-xs text-[#00033D]/70">
                {court.pricingRules.map((r: PricingRule) => (
                  <div key={r.id} className="flex justify-between">
                    <span>
                      {r.dayType === 'WEEKDAY' ? 'Weekday' : 'Weekend'} {formatHour(r.startHour)}–{formatHour(r.endHour)}
                    </span>
                    <span className="font-medium text-[#00033D]">
                      {formatRupiah(r.price)}
                      {r.memberPrice != null && (
                        <span className="text-[#977DFF]"> · member {formatRupiah(r.memberPrice)}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <GlassButton size="sm" variant="secondary" onClick={() => openEdit(court)}>✏️ Edit</GlassButton>
                <GlassButton size="sm" variant="secondary" onClick={() => openPricing(court)}>💰 Atur Harga</GlassButton>
                <GlassButton
                  size="sm"
                  variant={court.status === 'AKTIF' ? 'danger' : 'primary'}
                  onClick={() => toggleStatus(court)}
                >
                  {court.status === 'AKTIF' ? 'Nonaktifkan' : 'Aktifkan'}
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal tambah/edit lapangan */}
      <GlassModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'Tambah Lapangan'}
      >
        <div className="space-y-4">
          <GlassInput label="Nama Lapangan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth. Lapangan A" />
          <GlassSelect label="Jenis Permukaan" value={form.surfaceType} onChange={(e) => setForm({ ...form, surfaceType: e.target.value })}>
            <option value="vinyl">Vinyl</option>
            <option value="rumput sintetis">Rumput Sintetis</option>
            <option value="interlock">Interlock</option>
          </GlassSelect>
          <GlassInput label="Kapasitas (orang)" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          <GlassInput label="URL Foto (opsional)" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." />
          <div className="flex gap-2 justify-end">
            <GlassButton variant="secondary" onClick={() => setModalOpen(false)}>Batal</GlassButton>
            <GlassButton loading={saving} onClick={saveCourt}>Simpan</GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Modal harga */}
      <GlassModal open={!!pricingCourt} onClose={() => setPricingCourt(null)} title={`Harga — ${pricingCourt?.name || ''}`} wide>
        <div className="space-y-3">
          <p className="text-xs text-[#00033D]/60">
            Harga per slot 1 jam. Harga member otomatis berlaku untuk member reguler (FR-COURT-05).
          </p>
          {rules.map((rule, idx) => (
            <div key={idx} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end bg-white/30 border border-white/30 rounded-xl p-3">
              <GlassSelect label="Hari" value={rule.dayType} onChange={(e) => updateRule(idx, { dayType: e.target.value as 'WEEKDAY' | 'WEEKEND' })}>
                <option value="WEEKDAY">Weekday</option>
                <option value="WEEKEND">Weekend</option>
              </GlassSelect>
              <GlassInput label="Mulai" type="number" min={0} max={23} value={rule.startHour} onChange={(e) => updateRule(idx, { startHour: Number(e.target.value) })} />
              <GlassInput label="Selesai" type="number" min={1} max={24} value={rule.endHour} onChange={(e) => updateRule(idx, { endHour: Number(e.target.value) })} />
              <GlassInput label="Harga/jam" type="number" value={rule.price} onChange={(e) => updateRule(idx, { price: Number(e.target.value) })} />
              <GlassInput label="Harga member" type="number" value={rule.memberPrice ?? ''} onChange={(e) => updateRule(idx, { memberPrice: e.target.value ? Number(e.target.value) : null })} />
            </div>
          ))}
          <div className="flex justify-between">
            <GlassButton variant="secondary" size="sm" onClick={() => setRules([...rules, { dayType: 'WEEKDAY', startHour: 8, endHour: 17, price: 100000, memberPrice: null }])}>
              + Tambah Aturan
            </GlassButton>
            <GlassButton loading={saving} onClick={savePricing}>Simpan Harga</GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
