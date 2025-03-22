import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

// 受保护的基础路径
const protectedBasePath = '/dashboard/';

// 即使在 /dashboard 下也允许公开访问的页面路径
const publicAllowedPaths = [
  '/dashboard/companies',
  '/dashboard/demands',
  '/dashboard'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  
  // 检查是否是受保护路径，但排除公开允许的路径
  const isPublicAllowed = publicAllowedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`) && !pathname.includes('/new')
  );
  
  const isProtectedRoute = pathname.startsWith(protectedBasePath) && !isPublicAllowed;

  // 如果是受保护路径且没有会话，则重定向到登录页
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL(`/sign-in?redirect=${pathname}`, request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === "GET") {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
