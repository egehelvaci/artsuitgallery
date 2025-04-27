import { PrismaClient } from '@prisma/client';

// Geliştirme ortamında bağlantı havuzunu önlemek için
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Veritabanı bilgileri
const dbUrl = process.env.DATABASE_URL;

console.log('Connecting to database with URL:', dbUrl);

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