import { NextRequest, NextResponse } from 'next/server';
import { getCollectionById, updateCollection, deleteCollection } from '@/lib/prisma/collections';

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

// Koleksiyon bilgilerini ID'ye göre getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { message: "Geçersiz istek: Koleksiyon ID'si eksik" },
        { status: 400, headers: corsHeaders }
      );
    }

    const collection = await getCollectionById(id);

    if (!collection) {
      return NextResponse.json(
        { message: "Koleksiyon bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(collection, { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error("Koleksiyon alma hatası:", error);
    return NextResponse.json(
      { message: "Koleksiyon bilgileri alınırken bir hata oluştu" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Koleksiyon bilgilerini ID'ye göre güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { message: "Geçersiz istek: Koleksiyon ID'si eksik" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Koleksiyonun mevcut olup olmadığını kontrol et
    const existingCollection = await getCollectionById(id);
    if (!existingCollection) {
      return NextResponse.json(
        { message: "Güncellenecek koleksiyon bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    // İstek gövdesini al
    const data = await request.json();

    // Zorunlu alanları kontrol et
    if (!data.title || !data.artist_name || !data.imageUrl) {
      return NextResponse.json(
        { message: "Başlık, sanatçı adı ve görsel alanları zorunludur" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Koleksiyonu güncelle
    const updatedCollection = await updateCollection(id, data);

    return NextResponse.json(updatedCollection, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Koleksiyon güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Koleksiyon güncellenirken bir hata oluştu" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Koleksiyonu ID'ye göre sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { message: "Geçersiz istek: Koleksiyon ID'si eksik" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Koleksiyonun mevcut olup olmadığını kontrol et
    const existingCollection = await getCollectionById(id);
    if (!existingCollection) {
      return NextResponse.json(
        { message: "Silinecek koleksiyon bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    try {
      await deleteCollection(id);
      
      return NextResponse.json(
        { message: "Koleksiyon başarıyla silindi" },
        { status: 200, headers: corsHeaders }
      );
    } catch (deleteError) {
      console.error("Koleksiyon silme hatası:", deleteError);
      const errorMessage = deleteError instanceof Error 
        ? deleteError.message 
        : "Koleksiyon silinirken bir hata oluştu";
      
      return NextResponse.json(
        { message: errorMessage },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Genel API hatası:", error);
    return NextResponse.json(
      { message: "Koleksiyon silinirken bir hata oluştu" },
      { status: 500, headers: corsHeaders }
    );
  }
} 