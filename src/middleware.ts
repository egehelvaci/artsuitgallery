import { NextRequest, NextResponse } from 'next/server';

// Admin yolları için middleware
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Debug için path bilgisini console'a yaz
  console.log('Middleware çalışıyor, Path:', path);
  
  // Admin sayfaları için kontrol (login hariç)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    // Session kontrolü - burada auth_session kullanılacak
    const session = request.cookies.get('auth_session')?.value;
    
    console.log('Admin sayfası isteği, session var mı?', !!session);
    
    // Session yoksa login sayfasına yönlendir
    if (!session) {
      console.log('Session bulunamadı, login sayfasına yönlendiriliyor');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    return NextResponse.next();
  }
  
  // Eğer /admin yoluna gelindiyse, /admin/dashboard'a yönlendir
  if (path === '/admin') {
    console.log('/admin yolu, dashboard\'a yönlendiriliyor');
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // Login sayfasındaysa ve session varsa, doğrudan kabul edip dashboard'a yönlendir
  if (path === '/admin/login') {
    const session = request.cookies.get('auth_session')?.value;
    console.log('Login sayfası isteği, session var mı?', !!session);
    
    if (session) {
      console.log('Session mevcut, dashboard\'a yönlendiriliyor');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

// Middleware'in hangi yollar için çalışacağını belirt
export const config = {
  matcher: [
    '/admin', 
    '/admin/dashboard/:path*',
    '/admin/sanatcilar/:path*',
    '/admin/koleksiyonlar/:path*',
    '/admin/login',
  ]
}; 