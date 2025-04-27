import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 client oluştur (Tebi.io S3-uyumlu API'yi kullanır)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_TEBI_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_TEBI_ACCESS_KEY || '',
    secretAccessKey: process.env.NEXT_PUBLIC_TEBI_SECRET_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const key = formData.get('key') as string;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json(
        { message: 'Dosya gereklidir' },
        { status: 400 }
      );
    }

    if (!key) {
      return NextResponse.json(
        { message: 'Dosya anahtarı (key) gereklidir' },
        { status: 400 }
      );
    }

    // Dosyayı buffer'a çevir
    const buffer = Buffer.from(await file.arrayBuffer());

    // S3 komut parametrelerini hazırla
    const putObjectParams = {
      Bucket: process.env.NEXT_PUBLIC_TEBI_BUCKET || 'artsuitgallery',
      Key: key,
      Body: buffer,
      ContentType: file.type,
    };

    // S3'e yükle
    const command = new PutObjectCommand(putObjectParams);
    await s3Client.send(command);

    // Dosya URL'sini oluştur
    const fileUrl = `${process.env.NEXT_PUBLIC_TEBI_ENDPOINT}/${process.env.NEXT_PUBLIC_TEBI_BUCKET}/${key}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      key,
    });
  } catch (error) {
    console.error('S3 yükleme hatası:', error);
    return NextResponse.json(
      { message: `Dosya yüklenirken bir hata oluştu: ${error.message}` },
      { status: 500 }
    );
  }
} 