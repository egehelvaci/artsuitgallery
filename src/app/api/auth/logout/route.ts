import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Logout attempt');
    
    // Başarılı yanıt hazırla
    const response = NextResponse.json({ 
      success: true,
      message: 'Çıkış başarılı' 
    });
    
    // Tüm olası auth token/cookie'lerini temizle
    const cookieNames = [
      'auth_token',
      'auth_session',
      'admin_session',
      'admin_token',
      'jwt'
    ];
    
    cookieNames.forEach(name => {
      response.cookies.set({
        name,
        value: '',
        httpOnly: true,
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    });
    
    console.log('Logout successful - all cookies cleared');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Bir hata oluştu', 
      error: String(error) 
    }, { status: 500 });
  }
} 