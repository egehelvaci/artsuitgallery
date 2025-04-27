import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// HTTP metotlarını belirten CORS yapılandırması - daha güvenli hale getirildi
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Geliştirme için tüm kaynaklara izin veriyoruz
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
  'Access-Control-Max-Age': '86400', // 24 saat
};

// CORS için OPTIONS isteğini yanıtla
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Tebi.io için gerçek presigned URL oluşturucu
export async function POST(request: NextRequest) {
  try {
    // Tarayıcıdan gelen dosya bilgilerini al
    const data = await request.json();
    const { fileName, fileType } = data;
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Dosya adı ve tipi gereklidir' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Tebi.io yapılandırması - daha güvenli şekilde alınıyor
    const endpoint = process.env.NEXT_PUBLIC_TEBI_ENDPOINT || 'https://s3.tebi.io';
    const bucketName = process.env.NEXT_PUBLIC_TEBI_BUCKET_NAME || 'artsuitgallery';
    
    // Secret değerleri "NEXT_PUBLIC_" olmadan backend-only değişken olarak tanımlamak daha güvenlidir
    // Ancak test amaçlı olarak şu an "NEXT_PUBLIC_" değişkenleri kullanıyoruz
    const accessKey = process.env.NEXT_PUBLIC_TEBI_ACCESS_KEY || '';
    const secretKey = process.env.NEXT_PUBLIC_TEBI_SECRET_KEY || '';
    
    // Yapılandırma değerlerini kontrol et
    console.log('Tebi.io konfigürasyonu:');
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Bucket: ${bucketName}`);
    console.log(`Access Key: ${accessKey.slice(0, 3)}...${accessKey.slice(-3)}`); // Güvenlik için sadece başlangıç ve bitiş kısmını göster
    console.log(`Secret Key mevcut: ${secretKey ? 'Evet' : 'Hayır'}`);
    
    if (!endpoint || !bucketName || !accessKey || !secretKey) {
      return NextResponse.json(
        { error: 'Tebi.io yapılandırması eksik', missingParams: { endpoint: !endpoint, bucketName: !bucketName, accessKey: !accessKey, secretKey: !secretKey } },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9.]/g, '-');
    const uniqueFileName = `${timestamp}-${safeName}`;
    const objectKey = `uploads/test/${uniqueFileName}`;
    
    console.log(`Dosya adı: ${uniqueFileName}`);
    console.log(`Object key: ${objectKey}`);
    
    // S3 client yapılandırması
    const s3Client = new S3Client({
      region: 'auto', // Tebi.io için 'auto' kullanılabilir
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // S3 uyumlu servisler için gerekli
    });
    
    // PUT nesnesi komutu oluştur
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: fileType,
      ACL: 'public-read', // Tebi.io'da dosyanın public olarak erişilebilir olması için
    });
    
    // Presigned URL oluştur (30 dakika geçerli - daha uzun bir süre)
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 30 * 60, // 30 dakika (saniye cinsinden)
    });
    
    console.log('Presigned URL oluşturuldu:');
    console.log(signedUrl.substring(0, 100) + '...');
    
    // Dosya URL'i - yükleme sonrası erişim için
    const fileUrl = `${endpoint}/${bucketName}/${objectKey}`;
    
    // CORS başlıklarıyla birlikte başarılı yanıt
    return NextResponse.json(
      {
        success: true,
        uploadUrl: signedUrl, // Yükleme için presigned URL
        fileUrl: fileUrl,     // Yükleme sonrası erişim için URL
        debugInfo: {
          timestamp,
          endpoint,
          bucketName,
          objectKey,
          contentType: fileType
        }
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Presigned URL oluşturma hatası:', error);
    
    // Hatanın detaylarını kaydet
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Presigned URL oluşturulurken bir hata oluştu', 
        details: errorMessage,
        stack: errorStack 
      },
      { status: 500, headers: corsHeaders }
    );
  }
} 