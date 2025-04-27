'use client';

import { useState } from 'react';
import Link from 'next/link';

// Sanatçı ve eserlerini içeren tip tanımı
interface Artist {
  id: string;
  name: string;
  slug: string;
  biography?: string;
  artworks: string[];
  createdAt: string;
  updatedAt: string;
}

// Client bileşeni için Props tanımı
interface ArtistDetailClientProps {
  artist: Artist;
  artworks: string[];
}

export default function ArtistDetailClient({ artist, artworks }: ArtistDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Resim görüntüleme işlevleri
  const openModal = (imageUrl: string) => {
    console.log('Resme tıklandı:', imageUrl);
    setSelectedImage(imageUrl);
    setShowModal(true);
    // Sayfanın scroll edilmesini engelle
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
    // Scroll'u tekrar aktif et
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sanatçı Profil Bilgileri */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-200 rounded-lg mb-6 overflow-hidden cursor-pointer" onClick={() => artworks.length > 0 && openModal(artworks[0])}>
                {artworks.length > 0 ? (
                  <img 
                    src={artworks[0]} 
                    alt={artist.name}
                    className="w-full object-contain max-h-[400px]"
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    Görsel Yok
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{artist.name}</h1>
              
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">Biyografi</h2>
                <p className="text-gray-700 whitespace-pre-line">{artist.biography || 'Henüz biyografi eklenmemiş.'}</p>
              </div>
              
              <div className="mt-6">
                <Link 
                  href="/sanatcilar" 
                  className="text-indigo-600 font-medium hover:text-indigo-500"
                >
                  ← Tüm Sanatçılar
                </Link>
              </div>
            </div>
          </div>
          
          {/* Sanatçı Eserleri */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Eserleri</h2>
            
            {artworks.length <= 1 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Sanatçının henüz eserleri eklenmemiş.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* İlk eser zaten profil resmi olarak kullanıldığı için artworks[1]'den başla */}
                {artworks.slice(1).map((artwork, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02]"
                    onClick={() => openModal(artwork)}
                  >
                    <div className="bg-gray-200 relative overflow-hidden">
                      <img 
                        src={artwork} 
                        alt={`${artist.name} - Eser ${index + 2}`}
                        className="w-full h-64 object-contain"
                      />
                      <div className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-md opacity-80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10v4m0 0v4m0-4h4m-4 0H6" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">Eser {index + 2}</h3>
                      <p className="text-gray-600 text-sm">
                        {artist.name} - Eser {index + 2}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resim Büyütme Modal */}
      {showModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-7xl mx-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 bg-white rounded-full p-2 z-[10000]"
              onClick={closeModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-center justify-center h-[85vh]">
              <img 
                src={selectedImage} 
                alt="Büyütülmüş Eser" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 