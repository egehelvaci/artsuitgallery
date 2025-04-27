import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    console.log('Auth check API endpoint çağrıldı');
    
    // Authorization header'dan token'ı al
    const authHeader = req.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('Authorization header\'dan token alındı');
    }
    
    // Eğer header'da yoksa cookie'den kontrol et
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get('auth_token')?.value;
      console.log('Cookie\'den token kontrol edildi:', token ? 'Mevcut' : 'Yok');
    }
    
    // Token yoksa hata döndür
    if (!token) {
      console.log('Token bulunamadı');
      return NextResponse.json(
        { success: false, message: 'Erişim yetkisi bulunamadı' }, 
        { status: 401 }
      );
    }
    
    // JWT doğrulama için gizli anahtarı çevresel değişkenlerden al
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET çevresel değişkeni tanımlanmamış');
      return NextResponse.json(
        { success: false, message: 'Sunucu yapılandırma hatası' }, 
        { status: 500 }
      );
    }
    
    // Token'ı doğrula
    try {
      console.log('Token doğrulanıyor...');
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
      
      console.log('Token doğrulandı, kullanıcı ID:', decoded.id);
      
      // Başarılı yanıt döndür
      return NextResponse.json({
        success: true,
        message: 'Token geçerli',
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name || 'Admin Kullanıcı' // Ad yoksa varsayılan değer
        }
      });
    } catch (jwtError) {
      console.error('Token doğrulama hatası:', jwtError);
      return NextResponse.json(
        { success: false, message: 'Geçersiz veya süresi dolmuş token' }, 
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth check endpoint hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' }, 
      { status: 500 }
    );
  }
} 