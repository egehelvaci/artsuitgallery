import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section - Modernleştirilmiş */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://s3.tebi.io/artsuitgallery/pexels-atlasworld-1674049.jpg"
            alt="Art Suites Gallery Hero"
            fill
            priority
            className="object-cover"
            style={{filter: "brightness(0.8) contrast(1.1)"}}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        {/* Sanatsal Dekoratif Elemanlar */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[1]">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gray-500/10 blur-3xl"></div>
          <div className="absolute top-40 right-10 w-80 h-80 rounded-full bg-gray-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gray-500/10 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-100 mb-6 tracking-tight">
              ART SUITES GALLERY
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              SANAT GALERİSİNE HOŞ GELDİNİZ
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/koleksiyonlar" 
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/20 transition-all hover:scale-105"
              >
                Koleksiyonları Keşfet
              </Link>
              <Link 
                href="/sanatcilar" 
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/20 transition-all hover:scale-105"
              >
                Sanatçıları Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Bölümleri - Modernleştirilmiş */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-[url('/texture.svg')] opacity-5 mix-blend-multiply pointer-events-none"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="relative inline-block">
                Sanat Dünyasını Keşfedin
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-pink-500"></span>
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Modern sanatın büyüleyici dünyasında bir yolculuğa çıkın ve sanatseverlerin dikkatini çeken koleksiyonlarımızı inceleyin.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Sanatçılar - Modernleştirilmiş */}
            <div className="group">
              <div className="w-full h-96 bg-gray-200 mb-6 overflow-hidden relative rounded-2xl shadow-xl">
                <Image
                  src="https://s3.tebi.io/artsuitgallery/pablo-picasso-hayati-eserleri-ve-bilinmeyenleri-5.jpg"
                  alt="Pablo Picasso"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h2 className="text-3xl font-bold text-white mb-2">İLHAM VEREN SANATÇILAR</h2>
                  <Link
                    href="/sanatcilar"
                    className="inline-flex items-center text-amber-300 font-medium group-hover:translate-x-2 transition-transform"
                  >
                    Tüm Sanatçılar
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Koleksiyonlar - Modernleştirilmiş */}
            <div className="group">
              <div className="w-full h-96 bg-gray-200 mb-6 overflow-hidden relative rounded-2xl shadow-xl">
                <Image
                  src="https://s3.tebi.io/artsuitgallery/pexels-prismattco-2372978.jpg"
                  alt="Sanat Koleksiyonu"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h2 className="text-3xl font-bold text-white mb-2">KOLEKSİYONLAR</h2>
                  <Link
                    href="/koleksiyonlar"
                    className="inline-flex items-center text-amber-300 font-medium group-hover:translate-x-2 transition-transform"
                  >
                    Tüm Koleksiyonlar
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Hakkında Bölümü - Modernleştirilmiş */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-64 h-64 rounded-full bg-indigo-100 blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-64 h-64 rounded-full bg-amber-100 blur-3xl opacity-70"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-xl border border-white/50">
            <h2 className="text-4xl font-bold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-pink-600">
                Art Suites Gallery Hakkında
              </span>
            </h2>
            <p className="text-gray-700 mb-10 text-lg leading-relaxed">
              Art Suites Gallery, çağdaş sanatın en etkileyici örneklerini bir araya getiren 
              dijital bir sanat platformudur. Amacımız, sanatçıları ve eserlerini geniş 
              kitlelere ulaştırarak sanat sevgisini yaygınlaştırmaktır.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white mb-4 shadow-lg">
                  <span className="text-xl font-bold">10+</span>
                </div>
                <p className="text-amber-900 font-medium">Sanatçı</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 text-white mb-4 shadow-lg">
                  <span className="text-xl font-bold">50+</span>
                </div>
                <p className="text-indigo-900 font-medium">Koleksiyon</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white mb-4 shadow-lg">
                  <span className="text-xl font-bold">1000+</span>
                </div>
                <p className="text-pink-900 font-medium">Eser</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
