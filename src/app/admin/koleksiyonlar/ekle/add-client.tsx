'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

export default function AddCollectionClient() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dosya seçildiğinde
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Dosya adından başlık ve sanatçı adını çıkarma
      try {
        const fileName = file.name;
        // Dosya uzantısını kaldır (.jpg, .png vb.)
        const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
        
        // Ayırıcı karakterleri kontrol et (tire veya alt çizgi)
        if (nameWithoutExtension.includes(' - ')) {
          // SanatçıAdı - EserAdı formatı
          const [artistPart, titlePart] = nameWithoutExtension.split(' - ');
          setArtistName(artistPart.trim());
          setTitle(titlePart.trim());
        } 
        else if (nameWithoutExtension.includes('_')) {
          // SanatçıAdı_EserAdı formatı
          const [artistPart, titlePart] = nameWithoutExtension.split('_');
          setArtistName(artistPart.trim());
          setTitle(titlePart.trim());
        }
        else if (nameWithoutExtension.includes('-')) {
          // SanatçıAdı-EserAdı formatı
          const [artistPart, titlePart] = nameWithoutExtension.split('-');
          setArtistName(artistPart.trim());
          setTitle(titlePart.trim());
        }
      } catch (error) {
        console.error('Dosya adı ayrıştırma hatası:', error);
        // Hata durumunda bir şey yapma, kullanıcı manuel olarak alanları doldurabilir
      }
    } else {
      setPreviewUrl(null);
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
    
    if (!imageFile) {
      setErrorMessage('Lütfen bir görsel seçin.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Dosyayı yükle
      const imageUrl = await uploadFile(imageFile);
      
      // 2. Koleksiyon oluştur
      const response = await fetch('/api/collections', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Koleksiyon oluşturma hatası');
      }
      
      // Başarılı
      setSuccessMessage('Koleksiyon başarıyla oluşturuldu');
      
      // Form temizle
      setTitle('');
      setArtistName('');
      setImageFile(null);
      setPreviewUrl(null);
      
      // Input'u da temizle
      if (document.getElementById('fileInput') as HTMLInputElement) {
        (document.getElementById('fileInput') as HTMLInputElement).value = '';
      }
      
      // 3 saniye sonra başarı mesajını gizle
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Koleksiyon oluşturma hatası:', error);
      setErrorMessage('Koleksiyon oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Sayfa içeriği
  const content = (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Koleksiyon Ekle</h1>
        
        <Link 
          href="/admin/koleksiyonlar" 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow-sm transition-colors"
        >
          Geri Dön
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              {successMessage}
            </div>
            <Link 
              href="/admin/koleksiyonlar" 
              className="text-sm font-medium text-green-800 hover:underline"
            >
              Koleksiyonlar sayfasına dön
            </Link>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Başlık
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Koleksiyon başlığı"
              disabled={isSubmitting || isUploading}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-1">
              Sanatçı Adı
            </label>
            <input
              type="text"
              id="artistName"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Sanatçı adı"
              disabled={isSubmitting || isUploading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görsel
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <div>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mx-auto h-64 w-auto rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setPreviewUrl(null);
                        if (document.getElementById('fileInput') as HTMLInputElement) {
                          (document.getElementById('fileInput') as HTMLInputElement).value = '';
                        }
                      }}
                      className="mt-2 px-2 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200"
                      disabled={isSubmitting || isUploading}
                    >
                      Görseli Kaldır
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="fileInput"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Dosya Yükle</span>
                        <input
                          id="fileInput"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                          disabled={isSubmitting || isUploading}
                        />
                      </label>
                      <p className="pl-1">veya sürükle bırak</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF (maksimum 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin/koleksiyonlar')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting || isUploading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isUploading ? 'Yükleniyor...' : 'Kaydediliyor...'}
                </>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  return <AdminLayout>{content}</AdminLayout>;
} 