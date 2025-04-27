import { PrismaClient } from '@prisma/client';

// Geliştirme ortamında bağlantı havuzunu önlemek için
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Veritabanı bilgileri
const dbUrl = process.env.DATABASE_URL;

console.log('Connecting to database with URL:', dbUrl ? 'DB_URL mevcut' : 'DB_URL yok!');

// DB URL yoksa hata göster
if (!dbUrl) {
  console.error('DATABASE_URL ortam değişkeni tanımlanmamış! Veritabanı bağlantısı başarısız olabilir.');
  console.error('Mevcut ortam değişkenleri:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  });
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Vercel ortamında edge fonksiyonlarına uyumluluk için data proxy kullanımı
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 