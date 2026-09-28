'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { GlassCard, GlassButton, GlassInput } from '@/components/glass';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name,
        phone,
        email: email || undefined,
        password,
      });
      // Auto login setelah register
      const res = await api.post('/auth/login', { identifier: phone, password });
      Cookies.set('access_token', res.data.access_token, { expires: 1, sameSite: 'lax' });
      toast.success('Pendaftaran berhasil!');
      router.push('/account');
    } catch (err: any) {
      toast.error(err.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#0033FF] flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-[0_4px_20px_rgba(0,51,255,0.35)]">
            MA
          </div>
          <h1 className="text-2xl font-bold text-[#00033D]">Daftar Member</h1>
          <p className="text-sm text-[#00033D]/60 mt-1">
            Riwayat booking tersimpan &amp; harga khusus member reguler
          </p>
        </div>

        <GlassCard className="p-6 md:p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <GlassInput label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Rian" required />
            <GlassInput label="No. HP (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="cth. 081234567890" required />
            <GlassInput label="Email (opsional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cth. rian@email.com" />
            <GlassInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" required />
            <GlassInput label="Konfirmasi Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Ulangi password" required />
            <GlassButton type="submit" className="w-full" loading={loading} size="lg">
              Daftar
            </GlassButton>
          </form>

          <p className="text-sm text-center text-[#00033D]/60 mt-6">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="font-semibold text-[#0033FF] hover:underline">
              Masuk
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
