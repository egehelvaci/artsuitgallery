import { prisma } from "../db";

// Koleksiyon oluşturmak için input tipini tanımla
type CollectionCreateInput = {
  title: string;
  artist_name: string;
  imageUrl: string;
};

// Koleksiyon güncellemek için input tipini tanımla
type CollectionUpdateInput = {
  title?: string;
  artist_name?: string;
  imageUrl?: string;
};

// Tüm Koleksiyonı getir
export async function getAllCollections(options: {
  limit?: number;
  page?: number;
  orderBy?: 'title' | 'createdAt' | 'artist_name';
  orderDirection?: 'asc' | 'desc';
} = {}) {
  const { 
    limit = 20, 
    page = 1, 
    orderBy = 'createdAt',
    orderDirection = 'desc'
  } = options;
  
  const skip = (page - 1) * limit;
  
  try {
    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        take: limit,
        skip,
        orderBy: {
          [orderBy]: orderDirection,
        },
      }),
      prisma.collection.count(),
    ]);
    
    return {
      collections,
      pagination: {
        total,
        page,
        pageSize: limit,
        pageCount: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Koleksiyonı getirme hatası:', error);
    // Boş sonuç döndür
    return {
      collections: [],
      pagination: {
        total: 0,
        page,
        pageSize: limit,
        pageCount: 0,
      },
    };
  }
}

// ID'ye göre koleksiyon getir
export async function getCollectionById(id: string) {
  try {
    return await prisma.collection.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`ID ile koleksiyon getirme hatası (${id}):`, error);
    return null;
  }
}

// Başlık ve sanatçı adına göre koleksiyon ara
export async function searchCollections(options: {
  query?: string;
  artistName?: string;  
  page?: number;
  limit?: number;
  orderBy?: 'title' | 'createdAt' | 'artist_name';
  orderDirection?: 'asc' | 'desc';
} = {}) {
  const {
    query = '',
    artistName = '',
    page = 1,
    limit = 20,
    orderBy = 'createdAt',
    orderDirection = 'desc'
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Arama kriterlerini oluştur
  const whereConditions: any = {
    AND: []
  };
  
  // Genel arama sorgusu
  if (query) {
    whereConditions.AND.push({
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          }
        },
        {
          artist_name: {
            contains: query,
            mode: 'insensitive',
          }
        }
      ]
    });
  }
  
  // Sadece sanatçı adına göre arama
  if (artistName) {
    whereConditions.AND.push({
      artist_name: {
        contains: artistName,
        mode: 'insensitive',
      }
    });
  }
  
  // Eğer hiçbir filtre yoksa, AND dizisini boş bırakmamak için
  if (whereConditions.AND.length === 0) {
    delete whereConditions.AND;
  }
  
  try {
    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where: whereConditions.AND?.length > 0 ? whereConditions : {},
        take: limit,
        skip,
        orderBy: {
          [orderBy]: orderDirection,
        },
      }),
      prisma.collection.count({
        where: whereConditions.AND?.length > 0 ? whereConditions : {},
      }),
    ]);
    
    return {
      collections,
      pagination: {
        total,
        page,
        pageSize: limit,
        pageCount: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error(`Koleksiyon arama hatası:`, error);
    return {
      collections: [],
      pagination: {
        total: 0,
        page,
        pageSize: limit,
        pageCount: 0,
      },
    };
  }
}

// Koleksiyon oluştur
export async function createCollection(data: CollectionCreateInput) {
  try {
    // Doğrudan data nesnesini kullan
    return await prisma.collection.create({
      data: {
        title: data.title,
        artist_name: data.artist_name,
        imageUrl: data.imageUrl
      },
    });
  } catch (error) {
    console.error('Koleksiyon oluşturma hatası:', error);
    throw error;
  }
}

// Koleksiyon güncelle
export async function updateCollection(
  id: string,
  data: CollectionUpdateInput
) {
  try {
    return await prisma.collection.update({
      where: { id },
      data: {
        title: data.title,
        artist_name: data.artist_name,
        imageUrl: data.imageUrl
      },
    });
  } catch (error) {
    console.error(`Koleksiyon güncelleme hatası (${id}):`, error);
    throw error;
  }
}

// Koleksiyon sil
export async function deleteCollection(id: string) {
  try {
    return await prisma.collection.delete({
      where: { id },
    });
  } catch (error) {
    console.error(`Koleksiyon silme hatası (${id}):`, error);
    throw error;
  }
} 