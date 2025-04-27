'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Admin', email: 'admin@example.com' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Mobil görünümde dışarı tıklandığında sidebar'ı kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      if (sidebar && !sidebar.contains(event.target as Node) && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSidebarOpen]);

  // Kullanıcı çıkış yapma işlemi
  const handleLogout = async () => {
    if (isLoggingOut) return; // Eğer zaten çıkış yapılıyorsa, işlemi tekrar başlatma
    
    try {
      setIsLoggingOut(true);
      setIsSidebarOpen(false); // Açık menüleri kapat
      
      // Kullanıcı arayüzünü bilgilendir
      toast.loading('Çıkış yapılıyor...', { duration: 1000 });
      
      // API isteği
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Tarayıcı tarafında veri temizliği yap
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
      
      // Cookie'leri de manuel olarak temizlemeye çalış
      document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'auth_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Başarılı çıkış
      toast.success('Çıkış başarılı');
      
      // Yönlendirme yap
      setTimeout(() => {
        router.push('/admin/login');
      }, 500);
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu', error);
      toast.error('Çıkış yapılırken bir hata oluştu');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Sanatçılar', 
      href: '/admin/sanatcilar', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: 'Koleksiyonlar', 
      href: '/admin/koleksiyonlar', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobil navbar */}
      <div className="lg:hidden bg-white shadow-sm z-10 relative">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Art Suit Gallery
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                {user.name?.charAt(0)}
              </div>
            </button>
            
            {isSidebarOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                <Link href="/admin/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobil sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          
          {/* Sidebar içeriği */}
          <div id="mobile-sidebar" className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-indigo-700 to-purple-800 text-white">
            {/* Kapatma butonu */}
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center px-4 py-5">
              <span className="text-xl font-bold">Art Suit Admin</span>
            </div>
            
            {/* Menü */}
            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-md ${
                      pathname === item.href || pathname?.startsWith(item.href + '/')
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600'
                    }`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <span className="mr-4">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Kullanıcı bilgisi */}
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
                  {user.name?.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">{user.name}</p>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-indigo-200 hover:text-white"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-indigo-700 to-purple-800 text-white flex flex-col">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center px-4 py-6 border-b border-indigo-800">
            <span className="text-xl font-bold">Art Suit Gallery</span>
          </div>
          
          {/* Menü */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    pathname === item.href || pathname?.startsWith(item.href + '/')
                      ? 'bg-white/10 text-white'
                      : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-4">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Kullanıcı bilgisi */}
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex items-center w-full">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
                {user.name?.charAt(0)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-base font-medium text-white truncate">{user.name}</p>
                <p className="text-sm text-indigo-200 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 rounded-full hover:bg-white/10"
                title="Çıkış Yap"
              >
                <svg className="w-5 h-5 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Ana içerik */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Üst Bar */}
          <header className="bg-white shadow-sm z-10">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {navigation.find(item => pathname === item.href || pathname?.startsWith(item.href + '/'))?.name || 'Admin Panel'}
              </h1>
              
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                
                <span className="h-6 border-l border-gray-300"></span>
                
                <div className="relative">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="flex items-center text-gray-700 focus:outline-none"
                  >
                    <span className="mr-2 text-sm">{user.name}</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {user.name?.charAt(0)}
                    </div>
                  </button>
                  
                  {isSidebarOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                      <Link href="/admin/profil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* İçerik */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 