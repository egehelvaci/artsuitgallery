import { NextRequest, NextResponse } from "next/server";
import { getArtistBySlug, updateArtistBySlug } from "@/lib/prisma/artists";

// CORS başlıkları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// CORS için OPTIONS isteğini yanıtla
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Sanatçı görselini sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; index: string } }
) {
  try {
    const { slug, index } = params;
    
    if (!slug || !index) {
      return NextResponse.json(
        { message: 'Geçersiz istek - slug ve index parametreleri gereklidir' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const indexNum = parseInt(index, 10);
    if (isNaN(indexNum)) {
      return NextResponse.json(
        { message: 'Geçersiz index değeri - sayı olmalıdır' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Sanatçıyı getir
    const artist = await getArtistBySlug(slug);
    
    if (!artist) {
      return NextResponse.json(
        { message: 'Sanatçı bulunamadı' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // İndeksin geçerli olup olmadığını kontrol et
    if (indexNum < 0 || indexNum >= artist.artworks.length) {
      return NextResponse.json(
        { message: 'Geçersiz görsel indeksi' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Görsel URL'sini al
    const artworkUrl = artist.artworks[indexNum];
    
    // Artworks dizisinden belirtilen indeksteki görseli kaldır
    const updatedArtworks = [...artist.artworks];
    updatedArtworks.splice(indexNum, 1);
    
    // Sanatçıyı güncelle
    const updatedArtist = await updateArtistBySlug(slug, {
      artworks: updatedArtworks
    });
    
    return NextResponse.json(updatedArtist, { headers: corsHeaders });
  } catch (error) {
    console.error('Görsel silme hatası:', error);
    return NextResponse.json(
      { message: 'Görsel silinirken bir hata oluştu' },
      { status: 500, headers: corsHeaders }
    );
  }
} 