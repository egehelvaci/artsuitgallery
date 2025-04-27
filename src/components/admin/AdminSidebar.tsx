'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Sanat Eserleri', href: '/admin/artworks', icon: '🖼️' },
    { name: 'Sanatçılar', href: '/admin/sanatcilar', icon: '👨‍🎨' },
    { name: 'Kategoriler', href: '/admin/categories', icon: '🏷️' },
    { name: 'Siparişler', href: '/admin/orders', icon: '📦' },
    { name: 'Ayarlar', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <aside
      className={`bg-indigo-800 text-white transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && (
          <div className="font-bold text-xl">Art Suit Admin</div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="mt-8">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-md ${
                  pathname === item.href
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-100 hover:bg-indigo-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 