import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Veritabanı bağlantısını test et
    let dbConnected = false;
    let dbTest;
    try {
      // Basit bir bağlantı kontrolü
      await prisma.$connect();
      dbConnected = true;
      console.log('Database connection successful');
      
      // Daha detaylı test (opsiyonel)
      try {
        dbTest = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('Database query test:', dbTest);
      } catch (queryError) {
        console.error('Query test error (non-critical):', queryError);
      }
    } catch (connError) {
      console.error('Database connection error:', connError);
      return NextResponse.json({
        success: false,
        error: `Veritabanı bağlantı hatası: ${String(connError)}`,
      }, { status: 500 });
    }
    
    // Admin kullanıcılarını say
    let adminCount = 0;
    let admins = [];
    
    try {
      adminCount = await prisma.admin.count();
      console.log('Admin count:', adminCount);
      
      // Tüm admin kullanıcılarını getir (hassas bilgiler olmadan)
      admins = await prisma.admin.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (adminError) {
      console.error('Admin query error:', adminError);
      return NextResponse.json({
        success: false,
        error: `Admin sorgulama hatası: ${String(adminError)}`,
        dbConnected
      }, { status: 500 });
    }
    
    // Dönüş
    return NextResponse.json({
      success: true,
      dbConnected,
      dbTest: !!dbTest,
      adminCount,
      admins,
      prismaVersion: prisma._engineConfig?.version || 'bilinmiyor'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    // Her zaman bağlantıyı kapat
    await prisma.$disconnect();
  }
} 