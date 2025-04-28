import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Dinamik meta veriler için generateMetadata fonksiyonu
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Gerçek projede veritabanından koleksiyon bilgisi alınacak
  const collection = mockCollections.find(c => c.id === params.id);
  
  if (!collection) {
    return {
      title: 'Koleksiyon Bulunamadı',
    };
  }

  return {
    title: `${collection.title} | Art Suites Gallery`,
    description: collection.description.substring(0, 160),
  };
}

// Mock veri (gerçek projede veritabanından alınacak)
const mockCollections = Array.from({ length: 24 }).map((_, index) => ({
  id: `collection-${index + 1}`,
  title: `Koleksiyon ${index + 1}`,
  slug: `koleksiyon-${index + 1}`,
  description: `Bu koleksiyon, farklı sanatçılardan modern sanat eserlerini bir araya getirmektedir. Koleksiyon ${index + 1}, doğa ve şehir yaşamı arasındaki kontrastı vurgulayan çalışmaları içermektedir. Çeşitli teknikler ve materyaller kullanılarak oluşturulan bu eserler, izleyicilere farklı bakış açıları sunmaktadır.`,
  imageUrls: Array.from({ length: 12 }).map((_, mediaIndex) => ({
    id: `media-${index}-${mediaIndex}`,
    url: '/placeholder.jpg',
    title: `Eser ${mediaIndex + 1}`,
    description: `Koleksiyon ${index + 1}'in ${mediaIndex + 1} numaralı eseri. Bu eser, sanatçının doğa ve teknoloji arasındaki ilişkiyi yorumladığı bir çalışmadır.`,
  })),
}));

export default async function CollectionDetailPage({ params }: { params: { id: string } }) {
  // Gerçek projede veritabanından koleksiyon bilgisi alınacak
  const collection = mockCollections.find(c => c.id === params.id);
  
  if (!collection) {
    notFound();
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/koleksiyon" 
            className="text-indigo-600 font-medium hover:text-indigo-500 mb-6 inline-block"
          >
            ← Koleksiyon
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{collection.title}</h1>
          <p className="text-gray-700 mb-8">{collection.description}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-500">Toplam Eser: </span>
                <span className="font-medium">{collection.imageUrls.length}</span>
              </div>
            </div>
          </div>
          
          {/* Galeri Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.imageUrls.map((image) => (
              <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-64 bg-gray-200 relative">
                  {/* Görsel içeriği */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <span>Görsel İçeriği</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{image.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 