'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Hexagon, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulasi request API menggunakan instance axios CayLabs
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Login berhasil!');
      router.push('/dashboard');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // Redirect langsung ke backend NestJS untuk OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F8FF] to-[#87CEEB]/30 p-4 font-sans text-[#000080]">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-md p-8 bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(100,149,237,0.15)] rounded-[24px]">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-[0_4px_15px_rgb(100,149,237,0.2)]">
            <Hexagon className="w-6 h-6 text-[#6495ED]" />
          </div>
          <h1 className="text-2xl font-extrabold mb-1">Sign In</h1>
          <p className="text-sm text-gray-600">Please enter your details to sign in.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6495ED]" />
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-all placeholder:text-gray-500"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6495ED]" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#87CEEB] transition-all placeholder:text-gray-500"
            />
          </div>

          <div className="flex justify-end text-sm">
            <button type="button" className="text-[#6495ED] font-semibold hover:text-[#000080] transition-colors">
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-[#6495ED] text-white font-bold rounded-full shadow-[0_4px_15px_rgb(100,149,237,0.3)] hover:shadow-[0_8px_20px_rgb(100,149,237,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-white/60"></div>
          <span className="px-3 text-xs text-gray-500 font-medium">OR</span>
          <div className="flex-grow h-px bg-white/60"></div>
        </div>

        {/* Google OAuth */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 bg-white/60 border border-white/50 rounded-full font-semibold hover:bg-white/80 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-[#6495ED] font-bold hover:text-[#000080] transition-colors">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}