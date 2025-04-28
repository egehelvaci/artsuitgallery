'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface MediaItem {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  title?: string;
}

interface Artist {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  title: string;
  slug: string;
  artist_name: string;
  artist?: Artist | null;
  mediaItems: MediaItem[];
  imageUrl?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

interface CollectionsResponse {
  collections: Collection[];
  pagination: PaginationInfo;
}

export default function CollectionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artistSearchTerm, setArtistSearchTerm] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Infinite scroll için observer ve referans
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCollectionElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCollections();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);
  
  // Koleksiyonı yükle
  const fetchCollections = async (page = 1, query = '', artistQuery = '', reset = true) => {
    try {
      const isInitialLoad = page === 1;
      if (isInitialLoad) setLoading(true);
      else setLoadingMore(true);
      
      // Client-side fetch olduğu için göreceli URL kullanabiliriz.
      // Bu, window.location.origin'a göre otomatik olarak çözümlenir
      let url = `/api/collections?page=${page}&limit=50`; // Her bir yüklemede 50 koleksiyon
      if (query) url += `&query=${encodeURIComponent(query)}`;
      if (artistQuery) url += `&artist=${encodeURIComponent(artistQuery)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Koleksiyon yüklenirken bir hata oluştu');
      }
      
      const data: CollectionsResponse | Collection[] = await response.json();
      
      if (Array.isArray(data)) {
        // Arama sonuçları
        setCollections(reset ? data : [...collections, ...data]);
        setPagination(null);
        setHasMore(data.length > 0);
      } else {
        // Sayfalı liste sonuçları
        setCollections(reset ? data.collections : [...collections, ...data.collections]);
        setPagination(data.pagination);
        setHasMore(page < data.pagination.pageCount);
      }
      
      setCurrentPage(page);
    } catch (err) {
      console.error('Koleksiyonı getirme hatası:', err);
      setError('Koleksiyon yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  // İlk yükleme
  useEffect(() => {
    fetchCollections(1);
  }, []);
  
  // Arama
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCollections(1, '', artistSearchTerm);
    }, 500); // Kullanıcı yazmayı bıraktıktan 500ms sonra aramayı başlat
    
    return () => clearTimeout(timer);
  }, [artistSearchTerm]);
  
  // Daha fazla koleksiyon yükle
  const loadMoreCollections = () => {
    if (!loadingMore && hasMore) {
      fetchCollections(currentPage + 1, '', artistSearchTerm, false);
    }
  };

  // Modal açma fonksiyonu
  const openImageModal = (imageUrl: string, title: string) => {
    setSelectedImage(imageUrl);
    setSelectedTitle(title);
    // Modal açıldığında body scrollunu engelle
    document.body.style.overflow = 'hidden';
  };

  // Modal kapatma fonksiyonu
  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedTitle(null);
    // Modal kapandığında body scrollunu tekrar etkinleştir
    document.body.style.overflow = 'auto';
  };

  // Koleksiyon için görsel URL'si belirle
  const getImageUrl = (collection: Collection): string => {
    // Önce mediaItems'da görsel ara
    if (collection.mediaItems && collection.mediaItems.length > 0) {
      return collection.mediaItems[0].url;
    }
    // Yoksa imageUrl property'sini kontrol et
    else if (collection.imageUrl) {
      return collection.imageUrl;
    }
    // Hiçbiri yoksa placeholder URL'si döndür
    return 'https://via.placeholder.com/400x300?text=Görsel+Mevcut+Değil';
  };

  // Sanatçı adını belirle
  const getArtistName = (collection: Collection): string => {
    // Önce artist objesi olup olmadığını kontrol et
    if (collection.artist && collection.artist.name) {
      return collection.artist.name.toUpperCase();
    }
    // Yoksa artist_name property'sini kontrol et
    else if (collection.artist_name) {
      return collection.artist_name.toUpperCase();
    }
    return "BİLİNMEYEN SANATÇI";
  };

  // Başlıktaki sayısal ID'leri temizle
  const cleanTitle = (title: string): string => {
    // Sayısal ID'ler ile başlayan başlıkları temizle (örn: 977-, 976-, 975-, 974- vb.)
    const regex = /^\d{3,4}-/;
    if (regex.test(title)) {
      return title.replace(regex, '');
    }
    return title;
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">KOLEKSİYONLAR</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8 text-sm md:text-base">
            Art Suites Gallery'nin sanat koleksiyonunu keşfedin.
          </p>
          
          {/* Arama Kutusu - Mobil Uyumlu */}
          <div className="max-w-3xl mx-auto mb-6 md:mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Sanatçı Adı Ara..."
                value={artistSearchTerm}
                onChange={(e) => setArtistSearchTerm(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent text-sm md:text-base"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="text-center py-4 md:py-8">
            <p className="text-red-600 text-sm md:text-base">{error}</p>
          </div>
        )}

        {/* Yükleniyor göstergesi */}
        {loading && (
          <div className="text-center py-8 md:py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-4 border-[#8B0000] border-t-transparent"></div>
            <p className="mt-2 text-gray-600 text-sm md:text-base">Koleksiyon yükleniyor...</p>
          </div>
        )}

        {/* Koleksiyon gridi - Mobil Uyumlu */}
        {!loading && collections.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-gray-600 text-sm md:text-base">Aramanıza uygun koleksiyon bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {collections.map((collection, index) => (
                <div 
                  key={collection.id}
                  ref={index === collections.length - 1 ? lastCollectionElementRef : undefined}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div 
                    className="h-40 sm:h-48 md:h-56 bg-gray-100 dark:bg-gray-700 relative cursor-pointer" 
                    onClick={() => {
                      const imageUrl = getImageUrl(collection);
                      if (imageUrl) {
                        openImageModal(imageUrl, collection.title);
                      }
                    }}
                  >
                    <Image
                      src={getImageUrl(collection)}
                      alt={collection.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-3 md:p-4 flex-grow flex flex-col">
                    <Link
                      href={`/koleksiyon/${collection.slug || collection.id}`}
                      className="hover:text-[#8B0000] dark:hover:text-[#ff6b6b] transition-colors"
                    >
                      <h3 className="font-medium text-xs sm:text-sm md:text-base mb-1 md:mb-2 line-clamp-2 text-gray-900 dark:text-gray-100" title={collection.title}>
                        {cleanTitle(collection.title)}
                      </h3>
                    </Link>
                    <p className="text-[#8B0000] dark:text-[#ff6b6b] text-xs md:text-sm mt-auto font-medium" title={getArtistName(collection)}>
                      {getArtistName(collection)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Daha fazla yükleniyor göstergesi */}
            {loadingMore && (
              <div className="text-center py-6 md:py-8">
                <div className="inline-block animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-4 border-[#8B0000] border-t-transparent"></div>
                <p className="mt-2 text-gray-600 text-xs md:text-sm">Daha fazla yükleniyor...</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Resim Görüntüleme Modal'ı - Mobil Uyumlu */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative w-full max-w-4xl mx-auto">
            <button 
              className="absolute top-2 right-2 md:top-4 md:right-4 text-white p-2 z-10 bg-black/20 rounded-full hover:bg-black/40"
              onClick={closeImageModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative pt-[56.25%] md:pt-[75%] overflow-hidden rounded-md bg-black/50">
              <Image
                src={selectedImage}
                alt={selectedTitle || "Sanat Eseri"}
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {selectedTitle && (
              <div className="mt-2 md:mt-4 text-center">
                <h3 className="font-medium text-white text-sm md:text-lg">{cleanTitle(selectedTitle)}</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 