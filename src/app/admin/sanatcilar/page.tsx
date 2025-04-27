'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import Image from 'next/image';
import { uploadFile, deleteFile } from '@/lib/tebi';

// Artist tipini doğrudan sayfada tanımlayalım
interface Artist {
  id: string;
  name: string;
  slug: string;
  biography?: string;
  artworks: string[];
  createdAt: string;
  updatedAt: string;
}

// Sanatçı tipi tanımı
type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export default function ArtistsPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <ArtistsContent />
      </Suspense>
    </AdminLayout>
  );
}

// SearchParams kullanan bileşen
function ArtistsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: 10,
    pageCount: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  
  // Görsel yükleme state'leri
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    biography: '',
  });

  // Arama parametrelerini alma
  const pageParam = searchParams.get('page') || '1';
  const currentPage = parseInt(pageParam, 10);
  const searchParam = searchParams.get('search') || '';

  // Sanatçıları getir
  const fetchArtists = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/artists?page=${page}&limit=10${searchParam ? `&search=${searchParam}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`Sanatçılar alınamadı: ${response.status} ${response.statusText}`);
      }
      
      try {
        const data = await response.json();
        setArtists(data.artists);
        setPagination({
          total: data.pagination.total,
          page: data.pagination.page,
          pageSize: data.pagination.pageSize,
          pageCount: data.pagination.pageCount,
        });
      } catch (jsonError) {
        console.error('Sanatçı verileri JSON olarak ayrıştırılamadı:', jsonError);
        throw new Error('Sanatçı verileri geçersiz formatta');
      }
    } catch (err) {
      console.error('Sanatçılar alınırken hata:', err);
      setError(err instanceof Error ? err.message : 'Sanatçılar alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde ve url parametreleri değiştiğinde veri getir
  useEffect(() => {
    setSearchQuery(searchParam);
    fetchArtists(currentPage);
  }, [pageParam, searchParam]);

  // Arama formu gönderildiğinde
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Aramayı URL'ye ekleyerek sayfayı güncelle
    const encodedSearch = encodeURIComponent(searchQuery);
    router.push(`/admin/sanatcilar?search=${encodedSearch}&page=1`);
  };

  // Sanatçı silme onayını göster
  const handleDeleteClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setShowDeleteModal(true);
  };

  // Sanatçı silme
  const handleDeleteArtist = async () => {
    if (!selectedArtist) return;
    
    try {
      // API'ye sanatçı slug'ı ile istek yap, ID ile değil
      const response = await fetch(`/api/artists/${selectedArtist.slug}`, {
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
      
      // Sanatçıyı listeden kaldır
      setArtists(artists.filter(artist => artist.id !== selectedArtist.id));
      
      // Modal'ı kapat
      setShowDeleteModal(false);
      setSelectedArtist(null);
      
      // Liste güncellenebilir, ancak basitlik açısından mevcut durumu koruyalım
      fetchArtists();
      
    } catch (err) {
      console.error('Sanatçı silinirken hata:', err);
      setError(err instanceof Error ? err.message : 'Sanatçı silinirken bir hata oluştu');
    }
  };

  // Sayfalama kontrolü
  const renderPagination = () => {
    return (
      <div className="flex justify-between items-center mt-6">
        <div>
          <p className="text-sm text-gray-700">
            Sayfa <span className="font-medium">{currentPage}</span> / <span className="font-medium">{pagination.pageCount}</span>
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/admin/sanatcilar?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ''}`)}
            disabled={currentPage <= 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Önceki
          </button>
          <button
            onClick={() => router.push(`/admin/sanatcilar?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ''}`)}
            disabled={currentPage >= pagination.pageCount}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sonraki
          </button>
        </div>
      </div>
    );
  };

  // Sayfa değiştirme
  const handlePageChange = (newPage: number) => {
    fetchArtists(newPage);
  };
  
  // Form input değişikliği
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // İsimden otomatik slug oluştur
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };
  
  // Sanatçı ekle
  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      const response = await fetch('/api/admin/artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          biography: formData.biography,
          artworks: [],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sanatçı eklenirken bir hata oluştu');
      }
      
      // Formu temizle ve modal'ı kapat
      setFormData({ name: '', slug: '', biography: '' });
      fetchArtists();
      
    } catch (err) {
      console.error('Sanatçı eklenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Sanatçı eklenirken bir hata oluştu');
    }
  };
  
  // Sanatçı düzenleme modalını aç
  const handleEditClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setFormData({
      name: artist.name,
      slug: artist.slug,
      biography: artist.biography || '',
    });
  };
  
  // Sanatçı güncelle
  const handleUpdateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedArtist) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      const response = await fetch(`/api/admin/artists/${selectedArtist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          biography: formData.biography,
          artworks: selectedArtist.artworks,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sanatçı güncellenirken bir hata oluştu');
      }
      
      // Modal'ı kapat
      setShowDeleteModal(false);
      setSelectedArtist(null);
      
      // Listeyi yenile
      fetchArtists();
      
    } catch (err) {
      console.error('Sanatçı güncellenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Sanatçı güncellenirken bir hata oluştu');
    }
  };
  
  // Dosya seçme işlemi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
  };
  
  // Dosya yükleme işlemi
  const handleFileUpload = async () => {
    if (!selectedFile || !selectedArtist) return;
    
    setUploadingFile(true);
    setError('');
    
    try {
      // Tebi.io'ya dosyayı yükle
      const { fileUrl, key } = await uploadFile(selectedFile);
      
      // Sanatçı eserlerini güncelle
      const newArtworks = [...selectedArtist.artworks, fileUrl];
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      // API'yi çağırarak sanatçı bilgilerini güncelle
      const response = await fetch(`/api/admin/artists/${selectedArtist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: selectedArtist.name,
          slug: selectedArtist.slug,
          biography: selectedArtist.biography,
          artworks: newArtworks,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Eser yüklenirken bir hata oluştu');
      }
      
      const updatedArtist = await response.json();
      setSelectedArtist(updatedArtist);
      
      // Temizle
      if (previewImage) URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
      setSelectedFile(null);
      
      // Input'u sıfırla
      const fileInput = document.getElementById('edit-artwork-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Dosya yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Dosya yüklenirken bir hata oluştu');
    } finally {
      setUploadingFile(false);
    }
  };
  
  // Görsel silme
  const handleRemoveArtwork = async (index: number) => {
    if (!selectedArtist) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      // Dosya URL'sini analiz ederek dosya anahtarını (key) çıkarmayı dene
      const artworkUrl = selectedArtist.artworks[index];
      
      // Tebi.io URL yapısını kontrol et ve dosya anahtarını çıkarmayı dene
      if (artworkUrl.includes('tebi.io') || artworkUrl.includes('/uploads/')) {
        try {
          // URL'den dosya yolunu çıkar
          const urlObj = new URL(artworkUrl);
          const pathParts = urlObj.pathname.split('/');
          
          // bucket/uploads/xyz.jpg formatında olacak
          const bucketIndex = pathParts.findIndex(part => part === process.env.NEXT_PUBLIC_TEBI_BUCKET_NAME);
          
          if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
            // Dosya anahtarı: uploads/xyz.jpg formatında
            const key = pathParts.slice(bucketIndex + 1).join('/');
            
            // Dosyayı Tebi.io'dan sil
            await deleteFile(key);
            console.log(`Dosya başarıyla silindi: ${key}`);
          }
        } catch (err) {
          console.warn('Tebi.io dosya silme hatası (devam edilecek):', err);
        }
      }
      
      // Sanatçı eserlerini güncelle
      const newArtworks = [...selectedArtist.artworks];
      newArtworks.splice(index, 1);
      
      const response = await fetch(`/api/admin/artists/${selectedArtist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: selectedArtist.name,
          slug: selectedArtist.slug,
          biography: selectedArtist.biography,
          artworks: newArtworks,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Eser silinirken bir hata oluştu');
      }
      
      const updatedArtist = await response.json();
      setSelectedArtist(updatedArtist);
      
    } catch (err) {
      console.error('Eser silinirken hata:', err);
      setError(err instanceof Error ? err.message : 'Eser silinirken bir hata oluştu');
    }
  };
  
  // Önizleme temizleme
  const handleClearPreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setSelectedFile(null);
    
    const fileInput = document.getElementById('edit-artwork-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // ArtistsContent içeriği
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Sanatçılar</h1>
        <Link
          href="/admin/sanatcilar/ekle"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Yeni Sanatçı Ekle
        </Link>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Arama Formu */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sanatçı ara..."
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition"
          >
            Ara
          </button>
        </form>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : artists.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            {searchQuery ? 'Arama sonucu bulunamadı.' : 'Henüz sanatçı bulunmuyor.'}
          </p>
        </div>
      ) : (
        <>
          {/* Sanatçı Tablosu */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İsim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eser Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eklenme Tarihi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {artists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{artist.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{artist.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{artist.artworks?.length || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">
                        {new Date(artist.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/sanatcilar/${artist.slug}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Detay
                      </Link>
                      <Link
                        href={`/admin/sanatcilar/${artist.slug}/duzenle`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(artist)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Sayfalama */}
          {pagination.pageCount > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Önceki
                </button>
                
                {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pageCount}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === pagination.pageCount
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sanatçı Silme Modal */}
      {showDeleteModal && selectedArtist && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Sanatçıyı Sil</h2>
            
            <p className="mb-6 text-gray-700">
              <strong>{selectedArtist.name}</strong> isimli sanatçıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
    </div>
  );
} 