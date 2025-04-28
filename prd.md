# Sanat Galerisi Web Sitesi - PRD (Product Requirements Document)

## Proje Tanımı

Sanat galerisi konseptinde geliştirilecek olan bu web sitesi; sanatçılar, Koleksiyon ve anasayfa olmak üzere üç temel sayfadan oluşacaktır. Site sahibi ilerleyen süreçte yeni sanatçılar ve Koleksiyon ekleyebilecek ve mevcut içerikleri güncelleyebilecektir.

## Teknolojiler
- **Frontend:** Next.js (TypeScript)
- **Backend:** API Routes (Next.js)
- **Veritabanı:** Neon (PostgreSQL)
- **Dosya Depolama:** Tebi.io (fotoğraf ve video için)
- **Deployment:** Vercel
- **Dil:** Sadece Türkçe

---

## Yapılacaklar ✅

### Genel Altyapı
- [ ] Next.js + TypeScript projesi oluşturulacak
- [ ] Neon veritabanı bağlantısı sağlanacak
- [ ] Tebi.io entegrasyonu yapılacak (API Key ve Bucket yapılandırması)
- [ ] `dotenv` ile çevresel değişkenler yapılandırılacak
- [ ] SSR (Server Side Rendering) + ISR (Incremental Static Regeneration) stratejisi belirlenecek

### Sayfa ve Bileşen Yapısı
#### 1. Anasayfa (`/`)
- [ ] Hero alanı
- [ ] Galeriden öne çıkan Koleksiyon
- [ ] Öne çıkan sanatçılar
- [ ] Site hakkında kısa açıklama
- [ ] Footer

#### 2. Koleksiyon Sayfası (`/Koleksiyon`)
- [ ] 1.6GB'lık koleksiyon verileri `load more` ya da `pagination` ile sunulacak
- [ ] Koleksiyon detay sayfası (`/Koleksiyon/[slug]`)
- [ ] Tebi.io bağlantısı üzerinden resim/video gösterimi

#### 3. Sanatçılar Sayfası (`/sanatcilar`)
- [ ] En az 10 sanatçı gösterilecek
- [ ] Sanatçı detay sayfası olacak (`/sanatcilar/[slug]`)
- [ ] Her sanatçının biyografi ve eser listesi olacak

### Admin Panel
- [ ] Giriş ekranı
- [ ] Sanatçı ekleme/güncelleme/silme
- [ ] Koleksiyon ekleme/güncelleme/silme
- [ ] Görsel ve video yükleme (Tebi.io entegrasyonlu, frontend üzerinden yapılacak)
- [ ] Sürükle-bırak sıralama (koleksiyon/sanatçı için opsiyonel)

### Vercel Uyumlu Medya Yükleme
- [ ] 25MB sınırına takılmamak için:
  - [ ] Dosya yükleme işlemleri sadece frontend'de yapılacak
  - [ ] Tebi.io'ya doğrudan `fetch` veya `axios` ile `PUT` isteği atılacak
  - [ ] Backend tarafında bu işlemler yapılmayacak
  - [ ] Progress bar ve hata yönetimi eklenecek

### Veritabanı Yapısı (Neon)
- [ ] `artists` tablosu (id, name, slug, biography, image_url, created_at, updated_at)
- [ ] `collections` tablosu (id, title, slug, description, media_urls[], created_at, updated_at)
- [ ] `artworks` tablosu (id, artist_id, title, description, image_url, created_at)

### Diğer
- [ ] SEO dostu `<title>`, `<meta>` etiketleri
- [ ] JSON-LD yapılandırması (sanatçılar için)
- [ ] Mobil uyumlu tasarım (Tailwind CSS ile)
- [ ] Lazy loading (resim/video için)
- [ ] Kullanıcıya hata ve başarı mesajları gösterimi

---

## Yapılanlar 📌





