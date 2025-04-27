import { NextRequest, NextResponse } from 'next/server';
import { searchArtists } from '@/lib/prisma/artists';

// GET /api/admin/artists/search
// Sanatçı arama
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Number(searchParams.get('limit')) || 50;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Arama sorgusu gereklidir' },
        { status: 400 }
      );
    }
    
    const artists = await searchArtists(query, limit);
    
    return NextResponse.json(artists);
  } catch (error) {
    console.error('Sanatçı araması yapılırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Sanatçı araması yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 