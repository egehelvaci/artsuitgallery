'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import React from 'react';

interface Artist {
  id: string;
  name: string;
  slug: string;
  biography?: string;
  artworks: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ArtistDetailsPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const slug = React.use(params).slug;

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await fetch(`/api/artists/${slug}`);
        
        if (!response.ok) {
          throw new Error(`Sanatçı bilgileri alınamadı: ${response.status} ${response.statusText}`);
        }
        
        try {
          const data = await response.json();
          setArtist(data);
        } catch (jsonError) {
          console.error('Sanatçı bilgileri JSON olarak ayrıştırılamadı:', jsonError);
          throw new Error('Sanatçı verileri geçersiz formatta');
        }
      } catch (err) {
        console.error('Sanatçı bilgileri yüklenirken hata:', err);
        setError(err instanceof Error ? err.message : 'Sanatçı bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [slug]);

  const handleDeleteArtist = async () => {
    if (!artist) return;
    
    try {
      const response = await fetch(`/api/artists/${artist.slug}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        let errorMessage = 'Sanatçı silinirken bir hata oluştu';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonError) {
          console.error('Hata yanıtı JSON olarak ayrıştırılamadı:', jsonError);
          errorMessage = `Sunucu hatası: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      router.push('/admin/sanatcilar');
    } catch (err) {
      console.error('Sanatçı silinirken hata:', err);
      setError(err instanceof Error ? err.message : 'Sanatçı silinirken bir hata oluştu');
    }
  };

  const openImageModal = (image: string) => {
    console.log('Resme tıklandı:', image);
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !artist) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error || 'Sanatçı bulunamadı'}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Geri Dön
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-800 mb-2 sm:mb-0">
            {artist.name}
          </h1>
          <div className="flex space-x-3">
            <Link
              href={`/admin/sanatcilar/${artist.slug}/duzenle`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Düzenle
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Sil
            </button>
            <Link
              href="/admin/sanatcilar"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Tüm Sanatçılar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-medium text-gray-800 mb-2">Sanatçı Bilgileri</h2>
                <div className="border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">İsim</dt>
                      <dd className="mt-1 text-base text-gray-900">{artist.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Slug</dt>
                      <dd className="mt-1 text-base text-gray-900">{artist.slug}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Eser Sayısı</dt>
                      <dd className="mt-1 text-base text-gray-900">{artist.artworks?.length || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Eklenme Tarihi</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {new Date(artist.createdAt).toLocaleDateString('tr-TR')}
                      </dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Biyografi</dt>
                      <dd className="mt-1 text-base text-gray-900 whitespace-pre-line">
                        {artist.biography || "Biyografi bilgisi girilmemiş."}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Sanatçı Eserleri</h2>
              
              {artist.artworks && artist.artworks.length > 0 ? (
                <div className="space-y-4">
                  {artist.artworks.map((artwork, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 p-2">
                        <div 
                          className="flex justify-center items-center cursor-pointer"
                          onClick={() => {
                            console.log('Resme tıklandı:', artwork);
                            openImageModal(artwork);
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={artwork} 
                            alt={`${artist.name} - Eser ${index + 1}`}
                            className="max-h-[300px] w-auto object-contain"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm font-medium">Eser {index + 1}</span>
                        <button 
                          onClick={() => openImageModal(artwork)} 
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10v4m0 0v4m0-4h4m-4 0H6" />
                          </svg>
                          Büyüt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                  <p className="text-gray-500">Henüz eser eklenmemiş</p>
                </div>
              )}
              
              <div className="mt-4">
                <Link
                  href={`/admin/sanatcilar/${artist.slug}/duzenle`}
                  className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Eserleri Düzenle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sanatçı Silme Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Sanatçıyı Sil</h2>
            
            <p className="mb-6 text-gray-700">
              <strong>{artist.name}</strong> isimli sanatçıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteArtist}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Resim Büyütme Modal */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-90 p-4" 
          onClick={() => closeImageModal()}
          style={{ touchAction: 'none' }}
        >
          <div 
            className="relative max-w-6xl w-full h-full flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-800 hover:text-gray-900 hover:bg-gray-200 transition-colors z-[10000]"
              onClick={() => closeImageModal()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="overflow-hidden bg-transparent w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedImage} 
                alt={`${artist.name} - Eser`} 
                className="max-h-[85vh] max-w-[90vw] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 