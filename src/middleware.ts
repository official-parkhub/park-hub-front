import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/home' || pathname === '/manager-dashboard') {
    // Route protection logic can be added here in the future
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|_vercel|.*\\..*).*)',
};
