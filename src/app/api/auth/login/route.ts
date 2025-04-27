import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { compare } from 'bcrypt';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ message: 'E-posta ve şifre gereklidir' }, { status: 400 });
    }
    
    // Veritabanından admin kullanıcısını kontrol et
    console.log('Querying database for user:', email);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    let user;
    try {
      user = await prisma.admin.findUnique({
        where: { email },
      });
      console.log('User found:', user ? 'Yes' : 'No');
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        message: 'Veritabanı hatası', 
        error: String(dbError),
        details: JSON.stringify(dbError, null, 2)
      }, { status: 500 });
    }
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    // Şifre doğrulaması
    console.log('Verifying password');
    let isPasswordValid;
    try {
      isPasswordValid = await compare(password, user.password);
      console.log('Password valid:', isPasswordValid);
    } catch (pwError) {
      console.error('Password comparison error:', pwError);
      return NextResponse.json({ message: 'Şifre doğrulama hatası', error: String(pwError) }, { status: 500 });
    }
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json({ message: 'Geçersiz şifre' }, { status: 401 });
    }
    
    // Session ID oluştur (rastgele UUID)
    const sessionId = randomUUID();
    console.log('Created session ID:', sessionId);
    
    // Response hazırla
    const response = NextResponse.json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'Admin',
      }
    });
    
    // Session cookie'si ayarla
    response.cookies.set({
      name: 'auth_session',
      value: sessionId,
      httpOnly: true,  // Tarayıcı JS'den erişilemesin
      secure: process.env.NODE_ENV === 'production', // Sadece HTTPS üzerinden
      path: '/',
      maxAge: 86400,   // 24 saat (saniye cinsinden)
      sameSite: 'lax'
    });
    
    console.log('Session cookie set, login successful');
    
    return response;
  } catch (error) {
    console.error('Login error (global catch):', error);
    return NextResponse.json({ 
      message: 'Bir hata oluştu', 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
} 