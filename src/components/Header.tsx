'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'ANA SAYFA', href: '/' },
    { name: 'SANATÇILAR', href: '/sanatcilar' },
    { name: 'KOLEKSİYONLAR', href: '/koleksiyonlar' },
  ];

  return (
    <header className="bg-white py-4 shadow-sm">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="w-60 h-30 relative">
              <Image 
                src="https://s3.tebi.io/artsuitgallery/uploads/artists/1745277173679-logo.jpg"
                alt="Art Suites Gallery Logo"
                fill
                sizes="(max-width: 768px) 100vw, 192px"
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
                  ? 'text-[#8B0000] font-medium'
                  : 'text-gray-800 hover:text-[#8B0000]'
              } text-sm font-medium transition-colors tracking-wide`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 right-0 bg-white shadow-md md:hidden z-10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-gray-50 text-[#8B0000]'
                      : 'text-gray-800 hover:bg-gray-50 hover:text-[#8B0000]'
                  } block px-3 py-2 rounded-md text-base font-medium`}
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