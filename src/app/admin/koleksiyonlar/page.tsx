'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

// Koleksiyon tipi
interface Collection {
  id: string;
  title: string;
  artist_name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

// Client Content bileşeni
function CollectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ 
    total: 0, 
    page: Number(searchParams.get('page') || '1'), 
    pageSize: 10, 
    pageCount: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  // Koleksiyonı yükle
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        
        // URL parametrelerini oluştur
        const params = new URLSearchParams();
        params.append('page', pagination.page.toString());
        params.append('pageSize', pagination.pageSize.toString());
        params.append('orderBy', 'createdAt');
        params.append('orderDirection', 'desc');
        
        // Arama terimi varsa ekle
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        const response = await fetch(`/api/collections?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Koleksiyon yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setCollections(data);
          setPagination({ total: data.length, page: 1, pageSize: data.length, pageCount: 1 });
        } else if (data.collections) {
          setCollections(data.collections);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error('Koleksiyonı getirme hatası:', err);
        setError('Koleksiyon yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollections();
  }, [pagination.page, searchTerm]);

  // URL'yi güncelle
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (pagination.page > 1) {
      params.set('page', pagination.page.toString());
    }
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    const url = `/admin/koleksiyonlar${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(url, { scroll: false });
  }, [pagination.page, searchTerm, router]);

  // Arama işlemi
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Arama yaparken ilk sayfaya dön
    setPagination({...pagination, page: 1});
  };

  // Sayfa değiştirme
  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pageCount) return;
    setPagination({...pagination, page: newPage});
  };

  // Koleksiyon silme
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu koleksiyonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Koleksiyon silinirken bir hata oluştu');
      }
      
      // UI'dan kaldır
      setCollections(collections.filter(collection => collection.id !== id));
      setPagination({
        ...pagination,
        total: pagination.total - 1
      });
      
    } catch (error) {
      console.error('Koleksiyon silme hatası:', error);
      alert('Koleksiyon silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };
  
  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Koleksiyon</h1>
        
        <div className="flex space-x-2">
          <Link 
            href="/admin/koleksiyonlar/toplu-ekle" 
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm transition-colors"
          >
            Toplu Ekle
          </Link>
          
          <Link 
            href="/admin/koleksiyonlar/ekle" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors"
          >
            Yeni Koleksiyon Ekle
          </Link>
        </div>
      </div>
      
      {/* Arama formu */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sanatçı adına göre ara..."
            className="flex-1 border border-gray-300 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-md transition-colors"
          >
            Ara
          </button>
        </form>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-10 h-10 border-t-4 border-indigo-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Koleksiyon yükleniyor...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {collections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm 
                ? `"${searchTerm}" için sonuç bulunamadı.` 
                : "Henüz koleksiyon eklenmemiş. Yeni bir koleksiyon eklemek için 'Yeni Koleksiyon Ekle' butonuna tıklayın."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Görsel
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sanatçı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturulma Tarihi
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {collections.map((collection: Collection) => (
                    <tr key={collection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={collection.imageUrl} 
                            alt={collection.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{collection.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{collection.artist_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(collection.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/admin/koleksiyonlar/duzenle/${collection.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => handleDelete(collection.id)}
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
          )}
          
          {/* Sayfalama */}
          {pagination.pageCount > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Toplam <span className="font-medium">{pagination.total}</span> koleksiyon bulundu
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pageCount) }, (_, i) => {
                    // Sayfa mantığı
                    let pageToShow;
                    if (pagination.pageCount <= 5) {
                      pageToShow = i + 1;
                    } else {
                      if (pagination.page <= 3) {
                        pageToShow = i + 1;
                      } else if (pagination.page >= pagination.pageCount - 2) {
                        pageToShow = pagination.pageCount - 4 + i;
                      } else {
                        pageToShow = pagination.page - 2 + i;
                      }
                    }
                    
                    return (
                      <button
                        key={pageToShow}
                        onClick={() => changePage(pageToShow)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          pageToShow === pagination.page
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageToShow}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pageCount}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Ana sayfa bileşeni
export default function CollectionsAdminPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
        <CollectionsContent />
      </Suspense>
    </AdminLayout>
  );
} 