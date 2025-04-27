import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Bu endpoint, Vercel'in Free planında uygulamanın uyku moduna geçmesini önlemek için
// düzenli olarak çalıştırılır (cron job ile)
export async function GET() {
  try {
    // Basit bir veritabanı bağlantı kontrolü
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Database connection is active',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 