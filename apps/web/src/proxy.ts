import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Proxy (pengganti middleware di Next.js 16):
// - /dashboard/* khusus Owner/Admin (cek cookie access_token)
// - /account khusus member yang login
// - Halaman publik (/, /home, /booking, /auth) bebas diakses guest
export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isAccount = pathname.startsWith('/account');
  const isAuthPage = pathname.startsWith('/auth');

  // Belum login tapi akses halaman terproteksi -> login
  if (!token && (isDashboard || isAccount)) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Sudah login tapi buka halaman auth -> sesuai role
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/auth/:path*'],
};
