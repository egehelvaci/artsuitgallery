import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-semibold mb-3 md:mb-4">Art Suites Gallery</h3>
            <p className="text-gray-400 text-sm md:text-base">
              Modern sanat eserleri ve sanatçıların yer aldığı dijital sanat galerisi.
            </p>
          </div>
          
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-semibold mb-3 md:mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/koleksiyon" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">
                  Koleksiyon
                </Link>
              </li>
              <li>
                <Link href="/sanatcilar" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">
                  Sanatçılar
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 md:mb-4">İletişim</h3>
            <a 
              href="https://maps.google.com/?q=Geriş Mah. Çökertme Cad. No:111 Bodrum/Muğla" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors flex items-start mb-2 text-sm md:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="flex-1">Geriş Mah. Çökertme Cad. No:111 Bodrum/Muğla</span>
            </a>
            <a 
              href="tel:+905337380260" 
              className="text-gray-400 hover:text-white transition-colors flex items-center text-sm md:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +905337380260
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p className="text-sm md:text-base">&copy; {currentYear} Art Suites Gallery. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 