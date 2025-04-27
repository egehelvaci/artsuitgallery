import { NextRequest, NextResponse } from 'next/server';
import { getAllArtists, createArtist } from '@/lib/prisma/artists';

// GET /api/admin/artists
// Tüm sanatçıları listele (pagination destekli)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const orderBy = (searchParams.get('orderBy') || 'name') as 'name' | 'createdAt';
    const orderDirection = (searchParams.get('orderDirection') || 'asc') as 'asc' | 'desc';
    
    const result = await getAllArtists({
      limit,
      page,
      orderBy,
      orderDirection
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sanatçılar listelenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Sanatçılar listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/admin/artists
// Yeni sanatçı oluştur
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Zorunlu alanlar
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'İsim ve slug zorunludur' },
        { status: 400 }
      );
    }
    
    // Slug doğrulama (sadece harfler, rakamlar ve tire içerebilir)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(data.slug)) {
      return NextResponse.json(
        { error: 'Slug sadece küçük harfler, rakamlar ve tire içerebilir' },
        { status: 400 }
      );
    }
    
    // Artworks alanı array olmalı
    if (data.artworks && !Array.isArray(data.artworks)) {
      return NextResponse.json(
        { error: 'Artworks bir dizi olmalıdır' },
        { status: 400 }
      );
    }
    
    const newArtist = await createArtist({
      name: data.name,
      slug: data.slug,
      biography: data.biography,
      artworks: data.artworks || []
    });
    
    return NextResponse.json(newArtist, { status: 201 });
  } catch (error) {
    console.error('Sanatçı oluşturulurken hata oluştu:', error);
    
    // Duplicate slug hatası
    if (error instanceof Error && error.message.includes('Unique constraint failed on the fields: (`slug`)')) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor, lütfen farklı bir slug deneyin' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Sanatçı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 