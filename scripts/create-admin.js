// Bu script admin kullanıcısı oluşturmak için kullanılır
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Admin kullanıcısı oluşturuluyor...');
    
    // Kullanıcı bilgileri - istenen kullanıcı adı ve şifre ile oluşturuyoruz
    const email = 'admin@artsuitgallery.com';
    const password = 'artsuitgallery.48';
    const name = 'Admin';
    
    // Şifre hash'leme
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Kullanıcı kontrolü
    const existingUser = await prisma.admin.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('Bu e-posta adresine sahip bir kullanıcı zaten var. Güncelleniyor...');
      
      // Mevcut kullanıcıyı güncelle
      const updatedAdmin = await prisma.admin.update({
        where: { email },
        data: {
          password: hashedPassword,
          name
        }
      });
      
      console.log(`Admin kullanıcısı güncellendi: ${updatedAdmin.email}`);
    } else {
      // Yeni admin kullanıcısı oluştur
      const newAdmin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });
      
      console.log(`Yeni admin kullanıcısı oluşturuldu: ${newAdmin.email}`);
    }
    
    console.log('Kullanıcı adı:', email);
    console.log('Şifre:', password);
    console.log('İşlem başarıyla tamamlandı! Bu bilgilerle admin paneline giriş yapabilirsiniz.');
  } catch (error) {
    console.error('Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
createAdmin().catch(console.error); 