import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Asumsi token disimpan di cookies dengan nama 'access_token' atau sejenisnya
  // Sesuaikan nama cookie dengan yang diset oleh backend NestJS kamu
  const token = request.cookies.get('access_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // Jika user belum login dan mencoba akses halaman terproteksi
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Jika user SUDAH login tapi mencoba akses halaman login, lempar ke choice
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/choice', request.url));
  }

  return NextResponse.next();
}

// Tentukan rute mana saja yang akan dilewati oleh middleware ini
export const config = {
  matcher: ['/dashboard/:path*', '/choice', '/auth/:path*'],
};