import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// CORS başlıkları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Geliştirme için tüm kaynaklara açık, üretimde değiştirilmeli
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
};

// CORS için OPTIONS isteğini yanıtla
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Dosya silme işlemi
export async function DELETE(request: NextRequest) {
  try {
    // URL'den dosya anahtarını al (key parametre olarak bekleniyor)
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('key');
    
    if (!fileKey) {
      return NextResponse.json(
        { error: 'Dosya anahtarı (key) gereklidir' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Tebi.io yapılandırması
    const endpoint = process.env.NEXT_PUBLIC_TEBI_ENDPOINT || 'https://s3.tebi.io';
    const bucketName = process.env.NEXT_PUBLIC_TEBI_BUCKET_NAME || 'artsuitgallery';
    const accessKey = process.env.NEXT_PUBLIC_TEBI_ACCESS_KEY || '';
    const secretKey = process.env.NEXT_PUBLIC_TEBI_SECRET_KEY || '';
    
    // Yapılandırma kontrolü
    if (!endpoint || !bucketName || !accessKey || !secretKey) {
      return NextResponse.json(
        { error: 'Tebi.io yapılandırması eksik' },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // S3 client yapılandırması
    const s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // S3 uyumlu hizmetler için gerekli
    });
    
    // Dosya silme komutu
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });
    
    // Dosyayı sil
    await s3Client.send(command);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Dosya başarıyla silindi',
        fileKey,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { error: 'Dosya silinirken bir hata oluştu', details: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
} 