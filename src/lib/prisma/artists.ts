import { prisma } from "../db";

// Tüm sanatçıları getir
export async function getAllArtists(options: {
  limit?: number;
  page?: number;
  orderBy?: 'name' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
  search?: string;
} = {}) {
  const { 
    limit = 20, 
    page = 1, 
    orderBy = 'name',
    orderDirection = 'asc',
    search = ''
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Arama filtresini oluştur
  const where = search 
    ? {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      } 
    : {};
  
  const [artists, total] = await Promise.all([
    prisma.artist.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [orderBy]: orderDirection,
      },
    }),
    prisma.artist.count({ where }),
  ]);
  
  return {
    artists,
    pagination: {
      total,
      page,
      pageSize: limit,
      pageCount: Math.ceil(total / limit),
    },
  };
}

// ID'ye göre sanatçı getir
export async function getArtistById(id: string) {
  return await prisma.artist.findUnique({
    where: { id },
  });
}

// Slug'a göre sanatçı getir
export async function getArtistBySlug(slug: string) {
  try {
    const artist = await prisma.artist.findUnique({
      where: {
        slug: slug
      }
    });
    return artist;
  } catch (error) {
    console.error('getArtistBySlug error:', error);
    throw error;
  }
}

// Sanatçı oluştur
export async function createArtist(data: {
  name: string;
  slug: string;
  biography?: string;
  artworks?: string[];
}) {
  return await prisma.artist.create({
    data,
  });
}

// Sanatçı güncelle
export async function updateArtist(
  id: string,
  data: {
    name?: string;
    slug?: string;
    biography?: string;
    artworks?: string[];
  }
) {
  return await prisma.artist.update({
    where: { id },
    data,
  });
}

// Sanatçı sil
export async function deleteArtist(id: string) {
  return await prisma.artist.delete({
    where: { id },
  });
}

// Sanatçı adına göre ara
export async function searchArtists(query: string, limit = 50) {
  return await prisma.artist.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: limit,
    orderBy: {
      name: 'asc',
    },
  });
}

// Sanatçı eserlerini güncelle
export async function updateArtistArtworks(id: string, artworks: string[]) {
  return await prisma.artist.update({
    where: { id },
    data: {
      artworks,
    },
  });
}

// Slug'a göre sanatçı güncelle
export async function updateArtistBySlug(slug: string, data: any) {
  try {
    const artist = await prisma.artist.update({
      where: {
        slug: slug
      },
      data: {
        name: data.name,
        slug: data.slug,
        biography: data.biography,
        ...(data.artworks && { artworks: data.artworks })
      }
    });
    return artist;
  } catch (error) {
    console.error('updateArtistBySlug error:', error);
    throw error;
  }
}

// Slug'a göre sanatçı sil
export async function deleteArtistBySlug(slug: string) {
  try {
    // Önce sanatçı bilgilerini al
    const artist = await prisma.artist.findUnique({
      where: {
        slug: slug
      }
    });

    if (!artist) {
      throw new Error('Sanatçı bulunamadı');
    }

    // Tebi.io'dan resimleri silmek için gerekli işlemleri yapmak üzere bulabiliriz,
    // ancak şu aşamada sanatçıyı silme işlemini gerçekleştirelim

    // Sanatçıyı sil
    const deletedArtist = await prisma.artist.delete({
      where: {
        slug: slug
      }
    });
    
    console.log(`Sanatçı başarıyla silindi: ${slug}`, deletedArtist);
    return deletedArtist;
  } catch (error) {
    console.error('deleteArtistBySlug error:', error);
    // Hata mesajını yakalayıp detaylı olarak dönelim
    if (error instanceof Error) {
      throw new Error(`Sanatçı silinirken hata oluştu: ${error.message}`);
    }
    throw new Error('Sanatçı silinirken bilinmeyen bir hata oluştu');
  }
} 