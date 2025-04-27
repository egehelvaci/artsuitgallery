'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Metadata import'unu kaldırıyorum
// import { Metadata } from 'next';

// Metadata tanımını kaldırıyorum. Client component içinde kullanılamaz
// export const metadata: Metadata = {
//   title: 'Koleksiyonlar | Art Suit Gallery',
//   description: 'Art Suit Gallery\'nin etkileyici sanat koleksiyonları.',
// };

// Koleksiyon tipi tanımı
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
  artist_name: string; // Backend ile uyumlu olarak artist_name eklendi
  artist?: Artist | null;
  mediaItems: MediaItem[];
  imageUrl?: string; // Backend ile uyumlu olarak imageUrl eklendi
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
  
  // Koleksiyonları yükle
  const fetchCollections = async (page = 1, query = '', artistQuery = '', reset = true) => {
    try {
      const isInitialLoad = page === 1;
      if (isInitialLoad) setLoading(true);
      else setLoadingMore(true);
      
      let url = `/api/collections?page=${page}&limit=50`; // Her bir yüklemede 50 koleksiyon
      if (query) url += `&query=${encodeURIComponent(query)}`;
      if (artistQuery) url += `&artist=${encodeURIComponent(artistQuery)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Koleksiyonlar yüklenirken bir hata oluştu');
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
      console.error('Koleksiyonları getirme hatası:', err);
      setError('Koleksiyonlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
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

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">KOLEKSİYONLAR</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Art Suit Gallery'nin sanat koleksiyonunu keşfedin.
          </p>
          
          {/* Arama Kutusu - Sadece sanatçı adı araması bırakıldı */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Sanatçı Adı Ara..."
                value={artistSearchTerm}
                onChange={(e) => setArtistSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Yükleniyor göstergesi */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#8B0000] border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Koleksiyonlar yükleniyor...</p>
          </div>
        )}

        {/* Koleksiyonlar gridi - 5 sütun olarak ayarlandı */}
        {!loading && collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Aramanıza uygun koleksiyon bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {collections.map((collection, index) => (
                <div 
                  key={collection.id}
                  ref={index === collections.length - 1 ? lastCollectionElementRef : undefined}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div 
                    className="h-56 bg-gray-100 relative cursor-pointer" 
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
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover"
                    />
                    {/* Büyütme işareti */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    {/* Sanatçı adı büyük harflerle (getArtistName fonksiyonu artık büyük harfleri dönüyor) */}
                    <p className="text-gray-800 text-sm font-medium">
                      {getArtistName(collection)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Daha fazla yükleniyor göstergesi */}
            {loadingMore && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#8B0000] border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Daha fazla koleksiyon yükleniyor...</p>
              </div>
            )}
            
            {/* Manuel yükleme butonu - mobil cihazlar için veya otomatik yükleme çalışmadığında */}
            {!loading && !loadingMore && hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreCollections}
                  className="px-6 py-3 bg-[#8B0000] text-white rounded-md hover:bg-[#700000] transition-colors"
                >
                  Daha Fazla Göster
                </button>
              </div>
            )}
            
            {/* Tüm içerik yüklendiğinde göster */}
            {!loading && !loadingMore && !hasMore && collections.length > 0 && (
              <div className="text-center mt-8 text-sm text-gray-500">
                Tüm koleksiyonlar yüklendi. Toplam {collections.length} koleksiyon gösteriliyor.
              </div>
            )}
          </>
        )}
      </div>

      {/* Resim Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapatma butonu */}
            <button 
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-100 transition-colors"
              onClick={closeImageModal}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            {/* Görsel */}
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage}
                alt={selectedTitle || "Koleksiyon görseli"}
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-contain"
                priority
              />
            </div>
            
            {/* Başlık */}
            {selectedTitle && (
              <div className="bg-black bg-opacity-60 p-4 text-white text-center">
                <h3 className="text-xl font-semibold">{selectedTitle}</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 