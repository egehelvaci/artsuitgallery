import { NextRequest, NextResponse } from "next/server";
import { getArtistBySlug, updateArtistBySlug } from "@/lib/prisma/artists";

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
    console.log("Dosya yükleme API isteği alındı");
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const artistSlug = formData.get('artistSlug') as string;
    
    console.log("Formdan alınan veriler:", {
      fileExists: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      artistSlug
    });
    
    if (!file) {
      console.error("API Hatası: Dosya bulunamadı");
      return NextResponse.json(
        { message: 'Dosya gereklidir' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (!artistSlug) {
      console.error("API Hatası: Sanatçı slug değeri bulunamadı");
      return NextResponse.json(
        { message: 'Sanatçı slug değeri gereklidir' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Sanatçı kontrolü
    console.log(`${artistSlug} slug'ı ile sanatçı aranıyor...`);
    const artist = await getArtistBySlug(artistSlug);
    
    if (!artist) {
      console.error(`API Hatası: ${artistSlug} slug'ı ile sanatçı bulunamadı`);
      return NextResponse.json(
        { message: 'Sanatçı bulunamadı' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    console.log("Sanatçı bulundu:", artist.id, artist.name);
    
    // Server-side dosya yükleme API'sine isteği yönlendir
    console.log("Server-side dosya yükleme API'sine istek yapılıyor...");
    
    try {
      // Yeni bir FormData oluştur
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('artistSlug', artistSlug);
      
      // Server-side API'ye yönlendir
      const uploadResponse = await fetch(new URL('/api/upload-file', request.url).toString(), {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Server-side yükleme hatası:", errorText);
        throw new Error(`Dosya yükleme hatası: ${uploadResponse.status} ${errorText}`);
      }
      
      // Başarılı cevabı al
      const uploadResult = await uploadResponse.json();
      console.log("Dosya başarıyla yüklendi:", uploadResult);
      
      // Sanatçının artworks dizisini güncelle
      console.log("Sanatçı bilgileri güncelleniyor...");
      
      if (!artist.artworks) {
        artist.artworks = [];
      }
      
      const updatedArtworks = [...artist.artworks, uploadResult.fileUrl];
      const updatedArtist = await updateArtistBySlug(artistSlug, {
        artworks: updatedArtworks
      });
      
      console.log("Sanatçı bilgileri başarıyla güncellendi");
      
      return NextResponse.json({
        message: 'Dosya başarıyla yüklendi',
        fileUrl: uploadResult.fileUrl,
        artist: updatedArtist
      }, { headers: corsHeaders });
    } catch (uploadError) {
      console.error("Dosya yükleme hatası:", uploadError);
      return NextResponse.json(
        { message: `Dosya yüklenirken hata oluştu: ${uploadError.message}` },
        { status: 500, headers: corsHeaders }
      );
    }
    
  } catch (error) {
    console.error('Genel dosya yükleme hatası:', error);
    return NextResponse.json(
      { message: `Dosya yüklenirken bir hata oluştu: ${error.message}` },
      { status: 500, headers: corsHeaders }
    );
  }
} 