"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      
      if (res.data.access_token) {
        // Simpan token ke cookie
        Cookies.set("token", res.data.access_token, { expires: 1 }); // Expire 1 hari
        // Tendang ke halaman dashboard
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error("❌ Gagal: " + (error.response?.data?.message || "Kredensial salah"));
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Stack Plus Studio</h1>
        <p className="text-zinc-500">Core Engine V1.0 - Auth Ready</p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Masukkan kredensial untuk mengakses dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}