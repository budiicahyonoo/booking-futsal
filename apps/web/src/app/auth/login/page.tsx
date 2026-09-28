'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { GlassCard, GlassButton, GlassInput } from '@/components/glass';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      // Access token di cookie (dibaca proxy & axios interceptor)
      Cookies.set('access_token', res.data.access_token, { expires: 1, sameSite: 'lax' });
      toast.success('Login berhasil!');
      const role = res.data.user?.role;
      router.push(role === 'OWNER' || role === 'ADMIN' ? '/dashboard' : '/account');
    } catch (err: any) {
      toast.error(err.message || 'Login gagal');
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
          <h1 className="text-2xl font-bold text-[#00033D]">Masuk ke Mampang Arena</h1>
          <p className="text-sm text-[#00033D]/60 mt-1">Email / No. HP &amp; password Anda</p>
        </div>

        <GlassCard className="p-6 md:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <GlassInput
              label="Email atau No. HP"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="cth. 081234567890"
              required
            />
            <GlassInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <GlassButton type="submit" className="w-full" loading={loading} size="lg">
              Masuk
            </GlassButton>
          </form>

          <p className="text-sm text-center text-[#00033D]/60 mt-6">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="font-semibold text-[#0033FF] hover:underline">
              Daftar member
            </Link>
          </p>
        </GlassCard>

        <p className="text-xs text-center text-[#00033D]/40 mt-6">
          Guest tetap bisa booking tanpa akun —{' '}
          <Link href="/booking" className="text-[#0033FF] hover:underline">
            langsung ke jadwal
          </Link>
        </p>
      </div>
    </div>
  );
}
