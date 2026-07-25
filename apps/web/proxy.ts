import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NAMA FUNGSI WAJIB DIGANTI MENJADI 'proxy'
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (request.nextUrl.pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};