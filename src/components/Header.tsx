'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Sayfa kaydırıldığında header görünümünü değiştir
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobil menü açıkken arka plan kaydırmayı engelleyen efekt
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navigation = [
    { name: 'ANA SAYFA', href: '/' },
    { name: 'SANATÇILAR', href: '/sanatcilar' },
    { name: 'KOLEKSİYON', href: '/koleksiyon' },
  ];

  return (
    <header className={`bg-white dark:bg-gray-900 py-3 shadow-sm sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <nav className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="w-40 md:w-60 h-20 relative">
              <Image 
                src="https://s3.tebi.io/artsuitgallery/uploads/artists/1745277173679-logo.jpg"
                alt="Art Suites Gallery Logo"
                fill
                sizes="(max-width: 768px) 120px, 192px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'text-[#8B0000] dark:text-[#ff6b6b] font-medium'
                  : 'text-gray-800 dark:text-gray-200 hover:text-[#8B0000] dark:hover:text-[#ff6b6b]'
              } text-sm font-medium transition-colors tracking-wide`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-200 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>

        {/* Mobile Menu - Tam ekran versiyonu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 md:hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-40 h-20 relative">
                  <Image 
                    src="https://s3.tebi.io/artsuitgallery/uploads/artists/1745277173679-logo.jpg"
                    alt="Art Suites Gallery Logo"
                    fill
                    sizes="120px"
                    className="object-contain"
                  />
                </div>
              </Link>
              <button
                className="text-gray-700 dark:text-gray-200 focus:outline-none"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Menüyü Kapat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'text-[#8B0000] dark:text-[#ff6b6b] font-medium'
                      : 'text-gray-800 dark:text-gray-200 hover:text-[#8B0000] dark:hover:text-[#ff6b6b]'
                  } py-5 text-center text-xl font-medium transition-colors`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header; 