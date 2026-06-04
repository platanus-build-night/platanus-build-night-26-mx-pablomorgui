import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);
const COOKIE_NAME = 'mundialin_session';

async function verifySession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = await verifySession(request);

  // Landing page: redirect to /inteligencia if authenticated
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/inteligencia', request.url));
    }
    return NextResponse.next();
  }

  // Login page: redirect to /inteligencia if already authenticated
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/inteligencia', request.url));
    }
    return NextResponse.next();
  }

  // Dashboard routes: redirect to /login if not authenticated
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/inteligencia/:path*',
    '/partidos/:path*',
    '/alertas/:path*',
    '/inventario/:path*',
  ],
};
