import { NextRequest, NextResponse } from "next/server";
import { getAllArtists, createArtist } from "@/lib/prisma/artists";
import jwt from 'jsonwebtoken';

// CORS başlıkları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// CORS için OPTIONS isteğini yanıtla
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Token doğrulama fonksiyonu
async function verifyToken(request: NextRequest) {
  // API Key kontrolü - basit API anahtarı yetkilendirmesi için
  const apiKey = process.env.API_ACCESS_TOKEN;
  const apiKeyFromHeader = request.headers.get('x-api-key');
  
  if (apiKey && apiKeyFromHeader === apiKey) {
    return true;
  }
  
  // JWT Token kontrolü
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    console.error('JWT_SECRET çevresel değişkeni tanımlanmamış');
    return false;
  }
  
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return false;
  }
}

// Tüm sanatçıları getir
export async function GET(request: NextRequest) {
  try {
    // CORS headers ekle
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Debug: Gelen istek bilgilerini loglayalım
    console.log('API İsteği Alındı:', request.url);
    console.log('İstek Başlıkları:', Object.fromEntries(request.headers));
    
    // Yetkilendirme kontrolü - şimdilik API'yi tamamen public yapıyoruz
    const isPublicRoute = true; // process.env.ENABLE_PUBLIC_API === 'true';
    console.log('API Public mi?', isPublicRoute);
    
    if (!isPublicRoute) {
      const isAuthenticated = await verifyToken(request);
      console.log('Yetkilendirme durumu:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('API erişimi reddedildi: Yetkisiz erişim');
        return NextResponse.json(
          { error: 'Bu API endpoint\'ine erişim için yetkilendirme gereklidir.' },
          { status: 401, headers }
        );
      }
    }

    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : 20;
    const orderBy = (searchParams.get('orderBy') as 'name' | 'createdAt') || 'name';
    const orderDirection = (searchParams.get('orderDirection') as 'asc' | 'desc') || 'asc';
    const search = searchParams.get('search') || '';

    // Tüm sanatçıları getir
    const result = await getAllArtists({
      page,
      limit,
      orderBy,
      orderDirection,
      search
    });

    console.log('Sanatçılar başarıyla getirildi, toplam:', result.artists.length);

    // Sanatçı listesi ile ilk resimleri birleştir
    const artistsWithImage = result.artists.map(artist => {
      // Eğer sanatçının artworks dizisi varsa ilk elemanı al, yoksa boş string
      const firstImage = artist.artworks && artist.artworks.length > 0 
        ? artist.artworks[0] 
        : '';
      
      return {
        ...artist,
        firstImage
      };
    });

    // Başarılı yanıt
    return NextResponse.json(
      {
        artists: artistsWithImage,
        pagination: result.pagination
      },
      { headers }
    );
  } catch (error) {
    console.error('Sanatçıları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Sanatçıları getirirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Yeni sanatçı oluştur
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Zorunlu alanlar
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { message: 'İsim ve slug zorunludur' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Slug doğrulama (sadece harfler, rakamlar ve tire içerebilir)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(data.slug)) {
      return NextResponse.json(
        { message: 'Slug sadece küçük harfler, rakamlar ve tire içerebilir' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Artworks alanı array olmalı
    if (data.artworks && !Array.isArray(data.artworks)) {
      return NextResponse.json(
        { message: 'Artworks bir dizi olmalıdır' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const newArtist = await createArtist({
      name: data.name,
      slug: data.slug,
      biography: data.biography || "",
      artworks: data.artworks || []
    });
    
    return NextResponse.json(newArtist, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Sanatçı oluşturulurken hata oluştu:', error);
    
    // Duplicate slug hatası
    if (error instanceof Error && error.message.includes('Unique constraint failed on the fields: (`slug`)')) {
      return NextResponse.json(
        { message: 'Bu slug zaten kullanılıyor, lütfen farklı bir slug deneyin' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    return NextResponse.json(
      { message: 'Sanatçı oluşturulurken bir hata oluştu' },
      { status: 500, headers: corsHeaders }
    );
  }
} 