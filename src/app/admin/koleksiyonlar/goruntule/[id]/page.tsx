'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Koleksiyon tipi
interface Collection {
  id: string;
  title: string;
  artist_name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewCollectionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Koleksiyonu yükle
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/collections/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Koleksiyon bulunamadı');
          }
          throw new Error('Koleksiyon yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setCollection(data);
      } catch (error) {
        console.error('Koleksiyon yükleme hatası:', error);
        setErrorMessage('Koleksiyon yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollection();
  }, [id]);
  
  // Koleksiyon silme işlemi
  const handleDelete = async () => {
    // Kullanıcıya sor
    const confirmed = window.confirm('Bu koleksiyonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
    
    if (!confirmed) {
      return;
    }
    
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Koleksiyon silme hatası');
      }
      
      // Başarıyla silindi, Koleksiyon sayfasına yönlendir
      router.push('/admin/koleksiyonlar');
      
    } catch (error) {
      console.error('Koleksiyon silme hatası:', error);
      alert('Koleksiyon silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };
  
  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (!collection && !isLoading) {
    return (
      <div className="px-6 py-8">
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          <h1 className="text-xl font-semibold mb-2">Koleksiyon bulunamadı</h1>
          <p>İstediğiniz koleksiyon bulunamadı veya silinmiş olabilir.</p>
          <div className="mt-4">
            <Link 
              href="/admin/koleksiyonlar" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors"
            >
              Koleksiyona Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!collection) return null;
  
  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Koleksiyon Detayları</h1>
        
        <div className="flex space-x-3">
          <Link 
            href="/admin/koleksiyonlar" 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow-sm transition-colors"
          >
            Geri Dön
          </Link>
          
          <Link
            href={`/admin/koleksiyonlar/duzenle/${id}`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors"
          >
            Düzenle
          </Link>
          
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors"
          >
            Koleksiyonu Sil
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{collection.title}</h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sanatçı</h3>
                <p className="mt-1 text-lg">{collection.artist_name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</h3>
                <p className="mt-1">{new Date(collection.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Son Güncelleme</h3>
                <p className="mt-1">{new Date(collection.updatedAt).toLocaleDateString('tr-TR')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Koleksiyon ID</h3>
                <p className="mt-1 text-xs text-gray-500">{collection.id}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Görsel</h3>
            <div className="border rounded-md overflow-hidden bg-gray-50 h-64 flex items-center justify-center">
              <img 
                src={collection.imageUrl} 
                alt={collection.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 