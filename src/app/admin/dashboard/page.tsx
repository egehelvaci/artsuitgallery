'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

// Tip tanımlamaları
interface DashboardStats {
  artistCount: number;
  collectionCount: number;
  storage: {
    used: string;
    total: string;
    percentage: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'artist' | 'collection';
  action: 'create' | 'update' | 'delete';
  title: string;
  timestamp: string;
  user: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    artistCount: 0,
    collectionCount: 0,
    storage: { used: '0 MB', total: '10 GB', percentage: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  // Verileri yükle
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // İstatistikleri getir
        const statsResponse = await fetch('/api/admin/dashboard/stats');
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
        
        // Demo aktiviteler (gerçek API entegrasyonu yapılabilir)
        setActivities([
          {
            id: '1',
            type: 'artist',
            action: 'create',
            title: 'Yeni Sanatçı: Pablo Picasso',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString('tr-TR'),
            user: 'Admin'
          },
          {
            id: '2',
            type: 'collection',
            action: 'update',
            title: 'Koleksiyon Güncellendi: Modern Sanat',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString('tr-TR'),
            user: 'Admin'
          }
        ]);
      } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // İkon bileşenleri
  const ArtistIcon = () => (
    <div className="rounded-full bg-indigo-100 p-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    </div>
  );

  const CollectionIcon = () => (
    <div className="rounded-full bg-emerald-100 p-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    </div>
  );

  const StorageIcon = () => (
    <div className="rounded-full bg-purple-100 p-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
      </svg>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Galeri yönetim paneline hoş geldiniz.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Sanatçı Sayısı */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm uppercase tracking-wider">Sanatçılar</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.artistCount}</p>
                  </div>
                  <ArtistIcon />
                </div>
                <div className="bg-indigo-50 px-5 py-2">
                  <Link href="/admin/sanatcilar" className="text-sm text-indigo-700 font-medium hover:underline">
                    Tüm sanatçıları görüntüle →
                  </Link>
                </div>
              </div>
              
              {/* Koleksiyon Sayısı */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm uppercase tracking-wider">Koleksiyon</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.collectionCount}</p>
                  </div>
                  <CollectionIcon />
                </div>
                <div className="bg-emerald-50 px-5 py-2">
                  <Link href="/admin/koleksiyonlar" className="text-sm text-emerald-700 font-medium hover:underline">
                    Tüm Koleksiyonı görüntüle →
                  </Link>
                </div>
              </div>
              
              {/* Depolama Kullanımı */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm uppercase tracking-wider">Depolama</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.storage.used}</p>
                    <p className="text-sm text-gray-500 mt-1">/ {stats.storage.total}</p>
                  </div>
                  <StorageIcon />
                </div>
                <div className="px-5 py-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full" 
                      style={{ width: `${stats.storage.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    %{stats.storage.percentage} kullanılıyor
                  </p>
                </div>
              </div>
            </div>
            
            {/* Hızlı İşlemler */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Hızlı İşlemler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/sanatcilar/ekle" className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
                  <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Yeni Sanatçı Ekle</h3>
                    <p className="text-sm text-gray-500 mt-1">Sanatçı profilini oluştur</p>
                  </div>
                </Link>
                
                <Link href="/admin/koleksiyonlar/ekle" className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-emerald-500">
                  <div className="bg-emerald-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Koleksiyon Ekle</h3>
                    <p className="text-sm text-gray-500 mt-1">Yeni koleksiyon oluştur</p>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Son Aktiviteler */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Son Aktiviteler</h2>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <li key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className={`rounded-full p-2 mr-4 ${
                          activity.type === 'artist' ? 'bg-indigo-100' : 'bg-emerald-100'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                            activity.type === 'artist' ? 'text-indigo-600' : 'text-emerald-600'
                          }`} viewBox="0 0 20 20" fill="currentColor">
                            {activity.action === 'create' && (
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            )}
                            {activity.action === 'update' && (
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            )}
                            {activity.action === 'delete' && (
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            )}
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{activity.user} · {activity.timestamp}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
} 