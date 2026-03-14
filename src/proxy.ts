import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')
  const isLoginPage = request.nextUrl.pathname === '/login'
  const sessionSecret = process.env.SESSION_SECRET || 'dev_secret_only'

  // Si no hay sesión y no estamos en login, redirigir a login
  if (!session || session.value !== sessionSecret) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Si hay sesión y estamos en login, redirigir a la home
  if (isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
