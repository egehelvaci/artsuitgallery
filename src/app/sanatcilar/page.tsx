import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sanatçılar | Art Suites Gallery',
  description: 'Art Suites Gallery\'de yer alan tüm sanatçıları keşfedin.',
};

// Sanatçı tipi tanımı
interface Artist {
  id: string;
  name: string;
  slug: string;
  biography?: string | null;
  artworks: string[];
  firstImage?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Sanatçıları API'den getir
async function getArtists() {
  try {
    // Server-side kodu olduğu için doğrudan veritabanından almayı deneyelim
    const { getAllArtists } = await import('@/lib/prisma/artists');
    
    console.log('Doğrudan veritabanından sanatçıları getirme denenecek');
    
    // Doğrudan prisma fonksiyonunu çağır
    const result = await getAllArtists({
      page: 1,
      limit: 20,
      orderBy: 'name',
      orderDirection: 'asc',
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
    
    return {
      artists: artistsWithImage,
      pagination: result.pagination
    };
  } catch (error) {
    console.error('Sanatçılar yüklenirken hata:', error);
    return { artists: [], pagination: { total: 0, page: 1, pageSize: 20, pageCount: 0 } };
  }
}

export default async function ArtistsPage() {
  // API'den gerçek veriyi getir
  const { artists } = await getArtists();

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">Sanatçılar</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            İlham Verici Sanatçılar
          </p>
        </div>

        {artists.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-sm md:text-base">Henüz sanatçı bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {artists.map((artist: Artist) => (
              <Link 
                key={artist.id} 
                href={`/sanatcilar/${artist.slug}`} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="h-48 sm:h-56 md:h-64 bg-gray-200 relative">
                  {artist.firstImage ? (
                    <Image 
                      src={artist.firstImage} 
                      alt={artist.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm md:text-base">
                      Görsel Yok
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6 flex-grow flex flex-col">
                  <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{artist.name}</h2>
                  <p className="text-gray-600 text-xs md:text-sm line-clamp-3 mb-2 md:mb-4">{artist.biography || 'Biyografi henüz eklenmemiş.'}</p>
                  <div className="mt-auto text-[#8B0000] font-medium text-sm md:text-base">Profili Görüntüle →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 