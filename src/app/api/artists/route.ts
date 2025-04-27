import { NextRequest, NextResponse } from "next/server";
import { getAllArtists, createArtist } from "@/lib/prisma/artists";

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

// Tüm sanatçıları getir
export async function GET(request: NextRequest) {
  try {
    // CORS headers ekle
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

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