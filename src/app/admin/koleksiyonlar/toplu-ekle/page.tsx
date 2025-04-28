'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  artistName: string;
}

export default function BulkAddCollectionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  // Birden fazla dosya seçildiğinde
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newImages: ImageItem[] = [];
    
    Array.from(files).forEach(file => {
      // Dosya için rastgele bir id oluştur
      const id = Math.random().toString(36).substring(2, 9);
      
      // Dosya adından başlık ve sanatçı adını çıkarma
      let title = '';
      let artistName = '';
      
      try {
        const fileName = file.name;
        // Dosya uzantısını kaldır (.jpg, .png vb.)
        const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
        
        // Başlık olarak tam dosya adını kullan
        title = nameWithoutExtension;
        
        // Eğer başlıkta virgül varsa, virgülden önceki kısmı sanatçı adı olarak kullan
        if (title.includes(',')) {
          artistName = title.split(',')[0].trim();
        }
        // Alternatif olarak ayırıcı karakterleri kontrol et (tire veya alt çizgi)
        else if (nameWithoutExtension.includes(' - ')) {
          // SanatçıAdı - EserAdı formatı
          const [artistPart, titlePart] = nameWithoutExtension.split(' - ', 2);
          artistName = artistPart.trim();
        } 
        else if (nameWithoutExtension.includes('_')) {
          // SanatçıAdı_EserAdı formatı
          const [artistPart, titlePart] = nameWithoutExtension.split('_', 2);
          artistName = artistPart.trim();
        }
        else if (nameWithoutExtension.includes('-')) {
          // SanatçıAdı-EserAdı formatı
          const [artistPart, titlePart] = nameWithoutExtension.split('-', 2);
          artistName = artistPart.trim();
        }
        
        // Sanatçı adının başındaki sayıları ve tire işaretini kaldır
        if (artistName) {
          // Regex ile başındaki sayıları ve tire işaretini temizle (örn: "61-DENİZ AKTAŞ" -> "DENİZ AKTAŞ")
          artistName = artistName.replace(/^\d+\-/, '');
        }
      } catch (error) {
        console.error('Dosya adı ayrıştırma hatası:', error);
        // Hata durumunda varsayılan değerleri kullan
        title = file.name;
      }
      
      // Görsel önizleme URL'si oluştur
      const previewUrl = URL.createObjectURL(file);
      
      newImages.push({ id, file, previewUrl, title, artistName });
    });
    
    setImages(prev => [...prev, ...newImages]);
    
    // Input'u temizle (aynı dosyaları tekrar seçebilmek için)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Resim öğesini kaldır
  const removeImage = (id: string) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== id);
      
      // Önizleme URL'sini temizle (bellek sızıntısını önlemek için)
      const removedImage = prev.find(img => img.id === id);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.previewUrl);
      }
      
      return newImages;
    });
  };
  
  // Resim bilgilerini güncelle
  const updateImageInfo = (id: string, field: 'title' | 'artistName', value: string) => {
    setImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, [field]: value } : img
      )
    );

    // Başlıktan sanatçı adını otomatik çıkar
    if (field === 'title') {
      setImages(prev => 
        prev.map(img => {
          if (img.id === id) {
            const title = value;
            // Başlıktaki ilk virgüle kadar olan kısmı sanatçı adı olarak al
            if (title.includes(',')) {
              let artistName = title.split(',')[0].trim();
              // Sanatçı adının başındaki sayıları ve tire işaretini kaldır
              artistName = artistName.replace(/^\d+\-/, '');
              return { ...img, artistName };
            }
          }
          return img;
        })
      );
    }
  };
  
  // Tek dosya yükleme işlemi
  const uploadFile = async (file: File): Promise<string> => {
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
      throw error;
    }
  };
  
  // Tüm dosyaları yükle
  const uploadAllFiles = async () => {
    setIsUploading(true);
    setErrorMessage(null);
    
    const uploadResults: {id: string, imageUrl: string, error?: string}[] = [];
    
    try {
      // Her dosya için paralel yükleme başlat
      const uploadPromises = images.map(async (image) => {
        try {
          setUploadProgress(prev => ({ ...prev, [image.id]: 0 }));
          
          // Her 100ms'de bir ilerlemeyi simüle et (gerçek API'niz ilerleme raporu verebilirse, bunu onunla değiştirin)
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const currentProgress = prev[image.id] || 0;
              if (currentProgress < 90) {
                return { ...prev, [image.id]: currentProgress + 10 };
              }
              return prev;
            });
          }, 300);
          
          const imageUrl = await uploadFile(image.file);
          
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [image.id]: 100 }));
          
          return { id: image.id, imageUrl };
        } catch (error) {
          return { id: image.id, imageUrl: '', error: (error as Error).message };
        }
      });
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      setErrorMessage('Dosya yükleme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Toplu yükleme hatası:', error);
      return [];
    } finally {
      setIsUploading(false);
    }
  };
  
  // Koleksiyonı oluştur
  const createCollections = async (uploadedImages: {id: string, imageUrl: string, error?: string}[]) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    const results: {id: string, success: boolean, error?: string}[] = [];
    
    try {
      for (const uploadedImage of uploadedImages) {
        // Hata varsa atla
        if (uploadedImage.error) {
          results.push({ id: uploadedImage.id, success: false, error: uploadedImage.error });
          continue;
        }
        
        // İlgili image nesnesini bul
        const image = images.find(img => img.id === uploadedImage.id);
        if (!image) continue;
        
        try {
          // Koleksiyon oluştur
          const response = await fetch('/api/collections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: image.title,
              artist_name: image.artistName,
              imageUrl: uploadedImage.imageUrl,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Koleksiyon oluşturma hatası');
          }
          
          results.push({ id: image.id, success: true });
        } catch (error) {
          results.push({ id: image.id, success: false, error: (error as Error).message });
        }
      }
      
      return results;
    } catch (error) {
      setErrorMessage('Koleksiyon oluşturma işlemi sırasında bir hata oluştu.');
      console.error('Koleksiyon oluşturma hatası:', error);
      return [];
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Form doğrulama
    if (images.length === 0) {
      setErrorMessage('Lütfen en az bir görsel seçin.');
      return;
    }
    
    // Boş başlık veya sanatçı adı kontrolü
    const missingInfo = images.some(img => !img.title.trim() || !img.artistName.trim());
    if (missingInfo) {
      setErrorMessage('Lütfen tüm görselleriniz için başlık ve sanatçı adı girin.');
      return;
    }
    
    try {
      // 1. Tüm dosyaları yükle
      const uploadResults = await uploadAllFiles();
      
      // Yükleme hataları var mı kontrol et
      const hasUploadErrors = uploadResults.some(result => result.error);
      if (hasUploadErrors) {
        setErrorMessage('Bazı dosyalar yüklenemedi. Lütfen listeyi kontrol edin ve tekrar deneyin.');
        return;
      }
      
      // 2. Koleksiyonı oluştur
      const createResults = await createCollections(uploadResults);
      
      // Oluşturma sonuçlarını kontrol et
      const successCount = createResults.filter(result => result.success).length;
      const errorCount = createResults.filter(result => !result.success).length;
      
      if (successCount > 0 && errorCount === 0) {
        setSuccessMessage(`${successCount} koleksiyon başarıyla oluşturuldu.`);
        
        // Resimleri temizle
        images.forEach(img => URL.revokeObjectURL(img.previewUrl));
        setImages([]);
        
        // 3 saniye sonra başarı mesajını gizle
        setTimeout(() => {
          router.push('/admin/koleksiyonlar');
        }, 3000);
      } else if (successCount > 0 && errorCount > 0) {
        setSuccessMessage(`${successCount} koleksiyon oluşturuldu, ancak ${errorCount} koleksiyon oluşturulamadı.`);
      } else {
        setErrorMessage('Koleksiyon oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      setErrorMessage('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Sayfa içeriği
  const content = (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Toplu Koleksiyon Ekle</h1>
        
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
              Koleksiyon sayfasına dön
            </Link>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görseller
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Görselleri Seç</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFilesChange}
                      className="sr-only"
                      disabled={isSubmitting || isUploading}
                    />
                  </label>
                  <p className="pl-1">veya sürükle bırak</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG veya JPEG. Resim başına maksimum 5MB.
                </p>
                <p className="text-xs text-indigo-600">
                  İpucu: Dosya adınız otomatik olarak başlık alanına yerleştirilir. Eğer "SANATÇI ADI, diğer detaylar" gibi virgül içeren bir adlandırma kullanırsanız, virgülden önceki kısım otomatik olarak sanatçı adı alanına yerleştirilecektir. Dosya adında "61-DENİZ AKTAŞ" gibi başta sayı ve tire varsa, bunlar sanatçı adından otomatik olarak kaldırılacaktır.
                </p>
              </div>
            </div>
          </div>
          
          {images.length > 0 && (
            <div className="mt-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Yüklenecek Görseller ({images.length})</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Önizleme
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Başlık
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sanatçı Adı
                      </th>
                      {(isUploading || isSubmitting) && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                      )}
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {images.map(image => (
                      <tr key={image.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-16 w-16 rounded-md overflow-hidden">
                            <img src={image.previewUrl} alt={image.title} className="h-full w-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={image.title}
                            onChange={(e) => updateImageInfo(image.id, 'title', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Başlık"
                            disabled={isSubmitting || isUploading}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={image.artistName}
                            onChange={(e) => updateImageInfo(image.id, 'artistName', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Sanatçı Adı"
                            disabled={isSubmitting || isUploading}
                          />
                        </td>
                        {(isUploading || isSubmitting) && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {uploadProgress[image.id] > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-indigo-600 h-2.5 rounded-full" 
                                  style={{ width: `${uploadProgress[image.id]}%` }}
                                ></div>
                              </div>
                            )}
                            <div className="text-xs mt-1 text-gray-500">
                              {uploadProgress[image.id] === 100 ? 'Tamamlandı' : 
                               uploadProgress[image.id] > 0 ? `%${uploadProgress[image.id]}` : 
                               'Bekliyor'}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isSubmitting || isUploading}
                          >
                            Kaldır
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
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
              disabled={isSubmitting || isUploading || images.length === 0}
            >
              {isSubmitting || isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isUploading ? 'Yükleniyor...' : 'İşleniyor...'}
                </>
              ) : (
                'Koleksiyonı Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  return <AdminLayout>{content}</AdminLayout>;
} 