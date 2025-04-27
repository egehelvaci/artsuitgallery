import { NextRequest, NextResponse } from "next/server";
import { getArtistBySlug, updateArtistBySlug, deleteArtistBySlug } from "@/lib/prisma/artists";
import { Prisma } from "@prisma/client";

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

// Sanatçı bilgilerini slug'a göre getir
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json(
        { message: "Geçersiz istek: Sanatçı slug'ı eksik" },
        { status: 400, headers: corsHeaders }
      );
    }

    const artist = await getArtistBySlug(slug);

    if (!artist) {
      return NextResponse.json(
        { message: "Sanatçı bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(artist, { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error("Sanatçı alma hatası:", error);
    return NextResponse.json(
      { message: "Sanatçı bilgileri alınırken bir hata oluştu" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Sanatçı bilgilerini slug'a göre güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json(
        { message: "Geçersiz istek: Sanatçı slug'ı eksik" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanatçının mevcut olup olmadığını kontrol et
    const existingArtist = await getArtistBySlug(slug);
    if (!existingArtist) {
      return NextResponse.json(
        { message: "Güncellenecek sanatçı bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    // İstek gövdesini al
    const data = await request.json();

    // Zorunlu alanları kontrol et
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { message: "İsim ve slug alanları zorunludur" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Slug formatını kontrol et
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(data.slug)) {
      return NextResponse.json(
        { message: "Geçersiz slug formatı. Sadece küçük harfler, rakamlar ve tire (-) kullanılabilir" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Artworks alanını kontrol et
    if (data.artworks && !Array.isArray(data.artworks)) {
      return NextResponse.json(
        { message: "Artworks alanı bir dizi olmalıdır" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanatçıyı güncelle
    const updatedArtist = await updateArtistBySlug(slug, data);

    return NextResponse.json(updatedArtist, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Sanatçı güncelleme hatası:", error);
    
    // Yinelenen slug hatası kontrolü
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { message: "Bu slug zaten kullanılıyor" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    return NextResponse.json(
      { message: "Sanatçı güncellenirken bir hata oluştu" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Sanatçıyı slug'a göre sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json(
        { message: "Geçersiz istek: Sanatçı slug'ı eksik" },
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      await deleteArtistBySlug(slug);
      
      return NextResponse.json(
        { message: "Sanatçı başarıyla silindi" },
        { status: 200, headers: corsHeaders }
      );
    } catch (deleteError) {
      console.error("Sanatçı silme hatası:", deleteError);
      const errorMessage = deleteError instanceof Error 
        ? deleteError.message 
        : "Sanatçı silinirken bir hata oluştu";
      
      return NextResponse.json(
        { message: errorMessage },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Genel API hatası:", error);
    return NextResponse.json(
      { message: "Sanatçı silinirken bir hata oluştu" },
      { status: 500, headers: corsHeaders }
    );
  }
} 