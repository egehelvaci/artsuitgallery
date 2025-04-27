import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { tebiConfig } from '@/lib/tebi';

export async function GET(request: NextRequest) {
  try {
    // Sanatçı sayısı
    const artistCount = await prisma.artist.count();
    
    // Koleksiyon sayısı
    const collectionCount = await prisma.collection.count();
    
    // Tüm sanatçıların resim sayısı (artworks alanı string array)
    const artists = await prisma.artist.findMany({
      select: {
        artworks: true
      }
    });
    
    // Toplam resim sayısını hesapla
    let totalArtworks = 0;
    artists.forEach(artist => {
      totalArtworks += artist.artworks.length;
    });
    
    // Depolama kullanımı
    let storageInfo = {
      used: '0 MB',
      total: '10 GB',
      percentage: 0
    };
    
    try {
      // Tebi.io'dan depolama bilgilerini al
      const s3Client = new S3Client({
        region: tebiConfig.region || 'auto',
        endpoint: tebiConfig.endpoint,
        credentials: {
          accessKeyId: tebiConfig.accessKey || '',
          secretAccessKey: tebiConfig.secretKey || '',
        },
        forcePathStyle: true,
      });
      
      const command = new ListObjectsV2Command({
        Bucket: tebiConfig.bucketName,
      });
      
      const response = await s3Client.send(command);
      
      if (response.Contents) {
        // Toplam dosya boyutunu hesapla
        const totalSizeBytes = response.Contents.reduce((acc, obj) => acc + (obj.Size || 0), 0);
        
        // MB ve GB cinsinden formatla
        if (totalSizeBytes > 1024 * 1024 * 1024) {
          // GB
          const sizeGB = (totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);
          storageInfo.used = `${sizeGB} GB`;
        } else {
          // MB
          const sizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
          storageInfo.used = `${sizeMB} MB`;
        }
        
        // Yüzde hesapla (varsayılan 10GB limit)
        const limitBytes = 10 * 1024 * 1024 * 1024; // 10GB
        storageInfo.percentage = Math.min(Math.round((totalSizeBytes / limitBytes) * 100), 100);
      }
    } catch (storageError) {
      console.error('Depolama bilgisi alınırken hata:', storageError);
      // Hata durumunda varsayılan değerler kullanılır
    }
    
    // Tüm istatistikleri döndür
    return NextResponse.json({
      artistCount,
      collectionCount,
      totalArtworks,
      storage: storageInfo
    });
  } catch (error) {
    console.error('Dashboard istatistikleri alınırken hata:', error);
    return NextResponse.json(
      { error: 'İstatistikler alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 