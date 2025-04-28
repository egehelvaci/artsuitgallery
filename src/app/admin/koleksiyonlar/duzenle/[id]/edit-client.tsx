'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Koleksiyon tipi
interface Collection {
  id: string;
  title: string;
  artist_name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientEditCollectionPageProps {
  id: string;
}

export default function ClientEditCollectionPage({ id }: ClientEditCollectionPageProps) {
  const router = useRouter();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        setTitle(data.title);
        setArtistName(data.artist_name);
        setCurrentImageUrl(data.imageUrl);
        setPreviewUrl(data.imageUrl);
      } catch (error) {
        console.error('Koleksiyon yükleme hatası:', error);
        setErrorMessage('Koleksiyon yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollection();
  }, [id]);

  // Dosya seçildiğinde
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      // Dosya iptal edilirse mevcut görseli kullan
      setPreviewUrl(currentImageUrl);
    }
  };

  // Dosya yükleme işlemi
  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    setErrorMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Dosya yükleme hatası');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setErrorMessage('Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Form doğrulama
    if (!title.trim()) {
      setErrorMessage('Lütfen bir başlık girin.');
      return;
    }
    
    if (!artistName.trim()) {
      setErrorMessage('Lütfen sanatçı adını girin.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = currentImageUrl;
      
      // Eğer yeni bir dosya seçildiyse yükle
      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }
      
      // Koleksiyonu güncelle
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          artist_name: artistName,
          imageUrl,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Koleksiyon güncelleme hatası');
      }
      
      // Başarılı
      setSuccessMessage('Koleksiyon başarıyla güncellendi');
      
      // 2 saniye sonra Koleksiyon sayfasına yönlendir
      setTimeout(() => {
        router.push('/admin/koleksiyonlar');
      }, 2000);
      
    } catch (error) {
      console.error('Koleksiyon güncelleme hatası:', error);
      setErrorMessage('Koleksiyon güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Koleksiyon silme işlemi
  const handleDelete = async () => {
    // Kullanıcıya sor
    const confirmed = window.confirm('Bu koleksiyonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
    
    if (!confirmed) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Koleksiyon silme hatası');
      }
      
      // Başarılı
      setSuccessMessage('Koleksiyon başarıyla silindi');
      
      // 2 saniye sonra Koleksiyon sayfasına yönlendir
      setTimeout(() => {
        router.push('/admin/koleksiyonlar');
      }, 2000);
      
    } catch (error) {
      console.error('Koleksiyon silme hatası:', error);
      setErrorMessage('Koleksiyon silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
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
  
  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Koleksiyon Düzenle</h1>
        
        <div className="flex space-x-3">
          <Link 
            href="/admin/koleksiyonlar" 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow-sm transition-colors"
          >
            Geri Dön
          </Link>
          
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors"
            disabled={isSubmitting}
          >
            Koleksiyonu Sil
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Koleksiyon başlığı"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-1">
                  Sanatçı Adı
                </label>
                <input
                  type="text"
                  id="artistName"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Sanatçı adı"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Görsel
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Yeni bir görsel seçmezseniz, mevcut görsel kullanılacaktır.
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Görsel Önizleme
              </label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-md p-2 h-64 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Önizleme"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-1">Önizleme için görsel seçin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin/koleksiyonlar')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 