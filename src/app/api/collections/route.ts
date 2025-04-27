import { NextRequest, NextResponse } from 'next/server';
import { getAllCollections, searchCollections, createCollection } from '@/lib/prisma/collections';
import { nanoid } from 'nanoid';

// CORS başlıkları
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS metodu için yanıt (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('search') || searchParams.get('query');
    const artistName = searchParams.get('artist');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const orderBy = searchParams.get('orderBy') as 'title' | 'createdAt' | 'artist_name';
    const orderDirection = searchParams.get('orderDirection') as 'asc' | 'desc';
    
    const page = pageParam ? parseInt(pageParam) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam) : 10;
    
    // Arama sorgusu veya sanatçı filtrelemesi varsa arama API'sini kullan
    if (query || artistName) {
      const result = await searchCollections({
        query: query || '',
        artistName: artistName || '',
        page,
        limit: pageSize,
        orderBy: orderBy || 'createdAt',
        orderDirection: orderDirection || 'desc',
      });
      
      return NextResponse.json(result, { headers: corsHeaders });
    } else {
      // Normal listeleme
      const result = await getAllCollections({
        page,
        limit: pageSize,
        orderBy: orderBy || 'createdAt',
        orderDirection: orderDirection || 'desc',
      });
      
      return NextResponse.json(result, { headers: corsHeaders });
    }
  } catch (error) {
    console.error('Koleksiyonlar getirilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Koleksiyonlar getirilirken bir hata oluştu' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Yeni koleksiyon oluştur
export async function POST(request: NextRequest) {
  try {
    // İstek gövdesini al
    const data = await request.json();
    
    // Zorunlu alanları kontrol et
    if (!data.title || !data.artist_name || !data.imageUrl) {
      return NextResponse.json(
        { error: 'Başlık, sanatçı adı ve görsel URL\'si zorunludur' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Koleksiyon oluştur
    const newCollection = await createCollection({
      title: data.title,
      artist_name: data.artist_name,
      imageUrl: data.imageUrl
    });
    
    return NextResponse.json(newCollection, { 
      status: 201, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Koleksiyon oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Koleksiyon oluşturulurken bir hata oluştu' },
      { status: 500, headers: corsHeaders }
    );
  }
} 