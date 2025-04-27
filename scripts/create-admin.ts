import { PrismaClient } from '../src/generated/prisma';
import { hash } from 'bcrypt';

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    // Admin şifresini hash'le
    const hashedPassword = await hash('admin123', 10);
    
    // Admin kullanıcısını oluştur veya güncelle
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@artsuitgallery.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'admin@artsuitgallery.com',
        name: 'Admin User',
        password: hashedPassword,
      },
    });
    
    console.log('Admin kullanıcısı başarıyla oluşturuldu/güncellendi:');
    console.log(`Email: ${admin.email}`);
    console.log(`ID: ${admin.id}`);
    console.log('Şifre: admin123');
  } catch (error) {
    console.error('Admin kullanıcısı oluşturulurken hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 