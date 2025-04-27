import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    console.log('Admin kullanıcısı oluşturma isteği alındı');
    
    const body = await request.json();
    const { email, password, name } = body;
    
    if (!email || !password) {
      return NextResponse.json({ 
        success: false,
        message: 'E-posta ve şifre gereklidir' 
      }, { status: 400 });
    }
    
    // Şifreyi hashle
    const hashedPassword = await hash(password, 10);
    
    // Veritabanında kullanıcı var mı kontrol et
    const existingUser = await prisma.admin.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor' 
      }, { status: 400 });
    }
    
    // Yeni admin kullanıcısı oluştur
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name: name || 'Admin User'
      }
    });
    
    // Hassas bilgileri kaldır
    const { password: _, ...adminWithoutPassword } = newAdmin;
    
    console.log('Yeni admin kullanıcısı oluşturuldu:', adminWithoutPassword.email);
    
    return NextResponse.json({ 
      success: true,
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('Admin kullanıcısı oluşturma hatası:', error);
    
    return NextResponse.json({ 
      success: false,
      message: 'Admin kullanıcısı oluşturulurken bir hata meydana geldi',
      error: String(error)
    }, { status: 500 });
  }
} 