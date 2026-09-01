'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      router.push('/choice'); // Mengarah ke halaman pemilihan template
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // Redirect langsung ke backend NestJS untuk OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        
        {/* Header CayLabs */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-[#0033FF] flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-[0_0_15px_rgba(0,51,255,0.3)]">
            C
          </div>
          <h1 className="text-2xl font-bold text-[#00033D]">Sign In to CayLabs</h1>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg text-[#00033D]">Welcome Back</CardTitle>
            <CardDescription>Continue your engineering journey</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-[#00033D]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00033D]/50" />
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    required
                    className="pl-9 bg-[#FFFFFF] border-[#EAEDFB] text-[#00033D]" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#00033D]">Password</label>
                  <button type="button" className="text-xs font-semibold text-[#0033FF] hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00033D]/50" />
                  <Input 
                    type="password" 
                    placeholder="Enter your password" 
                    required
                    className="pl-9 bg-[#FFFFFF] border-[#EAEDFB] text-[#00033D]" 
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-[#0033FF] hover:bg-[#0033FF]/90 text-white font-medium shadow-[0_4px_14px_rgba(0,51,255,0.3)]"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#EAEDFB]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#FFFFFF] px-2 text-[#00033D]/60 font-medium">Or continue with</span>
              </div>
            </div>

            <Button 
              onClick={handleGoogleLogin}
              variant="outline" 
              type="button"
              className="w-full border-[#EAEDFB] bg-[#FFFFFF] text-[#00033D] hover:bg-[#EAEDFB]/50 font-semibold"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}