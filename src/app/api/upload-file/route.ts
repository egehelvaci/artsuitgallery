import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 client oluştur (Tebi.io S3-uyumlu API kullanır)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_TEBI_ENDPOINT || 'https://s3.tebi.io',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_TEBI_ACCESS_KEY || '',
    secretAccessKey: process.env.NEXT_PUBLIC_TEBI_SECRET_KEY || '',
  },
});

const TEBI_BUCKET = process.env.NEXT_PUBLIC_TEBI_BUCKET || 'artsuitgallery';
const TEBI_ENDPOINT = process.env.NEXT_PUBLIC_TEBI_ENDPOINT || 'https://s3.tebi.io';

// CORS başlıkları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// CORS için OPTIONS isteğini yanıtla
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // FormData'dan dosyayı al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    let folder = formData.get('folder') as string || 'uploads';
    const artistSlug = formData.get('artistSlug') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya gereklidir' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Dosya bilgilerini al
    const originalName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    
    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya türü. JPEG, PNG, WEBP veya GIF yükleyin.' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Dosya boyutu kontrolü (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maksimum 10MB yüklenebilir.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanatçı slug değeri varsa, ona göre klasörü ayarla
    if (artistSlug) {
      folder = `artists/${artistSlug}`;
    }
    
    // Dosya uzantısını çıkar
    const extension = originalName.split('.').pop() || '';
    
    // Benzersiz dosya adı oluştur
    const fileName = `${uuidv4()}.${extension}`;
    
    // Depolama yolunu oluştur (klasör/dosya-adı.uzantı)
    const key = `${folder}/${fileName}`;

    console.log("Server-side yükleme başlıyor:", {
      originalName,
      fileType,
      fileSize,
      key,
      bucket: TEBI_BUCKET
    });

    // Dosyayı Buffer'a çevir
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // S3 komut parametrelerini hazırla
    const putObjectParams = {
      Bucket: TEBI_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: fileType,
      ContentDisposition: 'inline',  // Tarayıcıda görüntüleme için
      CacheControl: 'max-age=31536000', // 1 yıl cache - daha hızlı yüklenir
      ACL: 'public-read', // Dosyanın herkes tarafından okunabilir olmasını sağlar
    };

    // S3'e yükle
    try {
      const command = new PutObjectCommand(putObjectParams);
      await s3Client.send(command);
      
      // Dosya URL'sini oluştur
      const fileUrl = `${TEBI_ENDPOINT}/${TEBI_BUCKET}/${key}`;
      
      console.log("Dosya başarıyla yüklendi:", fileUrl);
      
      // Başarılı yanıt gönder
      return NextResponse.json({
        success: true,
        originalName,
        fileName,
        size: fileSize,
        fileUrl,
        key,
      }, { headers: corsHeaders });
      
    } catch (error) {
      console.error("S3 yükleme hatası:", error);
      return NextResponse.json(
        { error: `Dosya yüklenirken S3 hatası: ${error.message}` },
        { status: 500, headers: corsHeaders }
      );
    }
    
  } catch (error) {
    console.error("Genel yükleme hatası:", error);
    return NextResponse.json(
      { error: `Dosya yüklenirken bir hata oluştu: ${error.message}` },
      { status: 500, headers: corsHeaders }
    );
  }
} 