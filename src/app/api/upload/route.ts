import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// CORS başlıkları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Geliştirme için tüm kaynaklara açık, üretimde değiştirilmeli
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
};

// CORS için OPTIONS isteğini yanıtla
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Dosya yükleme işlemi
export async function POST(request: NextRequest) {
  try {
    // FormData'dan dosyayı al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
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
    
    // Dosya bilgilerini al
    const fileName = file.name;
    const fileType = file.type;
    
    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9.]/g, '-');
    const uniqueFileName = `${timestamp}-${safeName}`;
    
    // Klasör yapısı - sanatçılar için
    const objectKey = `uploads/artists/${uniqueFileName}`;
    
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
    
    // Dosya içeriğini ArrayBuffer'a çevir
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    
    // Dosyayı doğrudan yükle
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: fileType,
      ACL: 'public-read', // Tebi.io'da dosyaların public olması için
    });
    
    // S3'e yükle
    await s3Client.send(command);
    
    // Başarılı yanıt
    const fileUrl = `${endpoint}/${bucketName}/${objectKey}`;
    
    return NextResponse.json(
      {
        success: true,
        url: fileUrl, // Eski API ile uyumlu olması için 'url' anahtarı kullanılıyor
        fileName: uniqueFileName,
        originalName: fileName,
        size: file.size,
        type: fileType
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu', details: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
} 