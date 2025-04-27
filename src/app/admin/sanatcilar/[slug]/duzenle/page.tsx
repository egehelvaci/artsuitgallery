'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function EditArtistPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    biography: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Next.js 15 ile params bir Promise olduğu için React.use() ile erişmek gerekiyor
  const slug = React.use(params).slug;

  // Sanatçı bilgilerini yükle
  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await fetch(`/api/artists/${slug}`);
        
        if (!response.ok) {
          throw new Error('Sanatçı bilgileri alınamadı');
        }
        
        const data = await response.json();
        setArtist(data);
        setFormData({
          name: data.name,
          slug: data.slug,
          biography: data.biography || '',
        });
      } catch (err) {
        console.error('Sanatçı bilgileri yüklenirken hata:', err);
        setError('Sanatçı bilgileri yüklenirken bir hata oluştu');
      }
    };

    fetchArtist();
  }, [slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleClearPreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setSelectedFile(null);
    
    const fileInput = document.getElementById('artwork-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !artist) return;
    
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      console.log("Dosya yükleme başlıyor...", selectedFile.name, "Sanatçı:", artist.slug);
      
      // FormData oluştur
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('artistSlug', artist.slug);
      
      // Simüle edilmiş ilerleme göstergesi
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 90) {
          setUploadProgress(progress);
        }
      }, 300);
      
      // Server-side API'ye gönder
      const response = await fetch('/api/upload/artwork', {
        method: 'POST',
        body: formData,
      });
      
      // İlerleme göstergesini durdur
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log("API yanıtı alındı:", response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = 'Dosya yüklenirken bir hata oluştu';
        try {
          const errorData = await response.json();
          console.error("API hata detayları:", errorData);
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonError) {
          console.error('Hata yanıtı JSON olarak ayrıştırılamadı:', jsonError);
          errorMessage = `Sunucu hatası: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log("API başarılı yanıt:", responseData);
      
      // Sanatçı bilgilerini güncelle
      if (responseData.artist) {
        setArtist(responseData.artist);
      } else {
        // API artist bilgilerini dönmediyse, sanatçıyı güncellenmiş 
        // resimlerle yeniden yükle
        try {
          console.log("Sanatçı bilgileri güncelleniyor...");
          const artistResponse = await fetch(`/api/artists/${slug}`);
          
          if (!artistResponse.ok) {
            console.error("Sanatçı yükleme hatası:", artistResponse.status, artistResponse.statusText);
            throw new Error("Sanatçı bilgileri güncellenemedi");
          }
          
          const updatedArtist = await artistResponse.json();
          console.log("Güncellenmiş sanatçı bilgileri:", updatedArtist);
          setArtist(updatedArtist);
        } catch (err) {
          console.error('Sanatçı bilgileri güncellenirken hata:', err);
        }
      }
      
      // Temizle
      handleClearPreview();
      
    } catch (err) {
      console.error('Dosya yüklenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Dosya yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveArtwork = async (index: number) => {
    if (!artist) return;
    
    try {
      const response = await fetch(`/api/artists/${artist.slug}/artwork/${index}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        let errorMessage = 'Görsel silinirken bir hata oluştu';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          console.error('Hata yanıtı JSON olarak ayrıştırılamadı:', jsonError);
          errorMessage = `Sunucu hatası: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      try {
        const updatedArtist = await response.json();
        setArtist(updatedArtist);
      } catch (jsonError) {
        console.error('Sanatçı verileri ayrıştırılamadı:', jsonError);
        
        // JSON hatası olursa tekrar sanatçı verilerini getir
        try {
          const refreshResponse = await fetch(`/api/artists/${artist.slug}`);
          if (refreshResponse.ok) {
            const refreshedArtist = await refreshResponse.json();
            setArtist(refreshedArtist);
          }
        } catch (refreshErr) {
          console.error('Sanatçı bilgileri yenilenirken hata:', refreshErr);
        }
      }
      
    } catch (err) {
      console.error('Görsel silinirken hata:', err);
      setError(err instanceof Error ? err.message : 'Görsel silinirken bir hata oluştu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/artists/${artist.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = 'Sanatçı güncellenirken bir hata oluştu';
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

      // Güncellenen sanatçı verilerini çek
      try {
        const updatedArtistResponse = await response.json();
        setArtist(updatedArtistResponse);
      } catch (jsonError) {
        console.error('Sanatçı verileri ayrıştırılamadı:', jsonError);
        // JSON hatası olsa da başarılı kabul ediyoruz
      }
      
      router.push('/admin/sanatcilar');
      router.refresh();
    } catch (err) {
      console.error('Sanatçı güncellenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Sanatçı güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!artist && !error) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800">
            {artist ? `${artist.name} Düzenle` : 'Sanatçı Düzenle'}
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Geri Dön
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  İsim
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Örnek: "vincent-van-gogh" (sadece küçük harfler, rakamlar ve tire)
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Biyografi
                </label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-md ${
                    loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium text-gray-800 mb-4">Sanatçı Görselleri</h2>
            
            {/* Mevcut görseller */}
            {artist && artist.artworks && artist.artworks.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {artist.artworks.map((artwork, index) => (
                  <div key={index} className="relative group aspect-square shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative w-full h-full">
                      <img 
                        src={artwork} 
                        alt={`${artist.name} görsel ${index + 1}`}
                        className="w-full h-full object-contain rounded-md border border-gray-300 bg-gray-50"
                        style={{ aspectRatio: '1/1' }}
                        loading="lazy"
                        onError={(e) => {
                          // Yükleme hatası durumunda varsayılan görsel göster
                          e.currentTarget.src = "/placeholder-image.png";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveArtwork(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 text-center">
                <p className="text-gray-500">Henüz görsel eklenmemiş</p>
              </div>
            )}
            
            {/* Yeni görsel yükleme */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Yeni Görsel Ekle
              </label>
              
              {/* Önizleme */}
              {previewImage && (
                <div className="relative w-48 h-48 mb-3">
                  <img 
                    src={previewImage} 
                    alt="Görsel önizleme" 
                    className="w-full h-full object-contain rounded-md border border-gray-300 bg-gray-50" 
                    style={{ aspectRatio: '1/1' }}
                  />
                  <button
                    type="button"
                    onClick={handleClearPreview}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Dosya yükleme alanı */}
              <div className="flex items-center space-x-3">
                <label className="block cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                  <span>Görsel Seç</span>
                  <input
                    id="artwork-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                
                {selectedFile && !previewImage && (
                  <span className="text-sm text-gray-600">
                    {selectedFile.name}
                  </span>
                )}
                
                {selectedFile && (
                  <>
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={uploading}
                      className={`px-3 py-1 text-white rounded-md ${
                        uploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {uploading ? 'Yükleniyor...' : 'Yükle'}
                    </button>
                    
                    {uploading && (
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {uploadProgress}%
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 