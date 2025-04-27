# Art Suit Gallery - Sanat Galerisi Web Sitesi

Art Suit Gallery, modern sanat eserlerini ve sanatçıları sergilemek için tasarlanmış bir web sitesidir. Next.js ve TypeScript kullanılarak geliştirilmiştir.

## Teknolojiler

- **Frontend:** Next.js (TypeScript)
- **Backend:** API Routes (Next.js)
- **Veritabanı:** Neon (PostgreSQL)
- **Dosya Depolama:** Tebi.io (fotoğraf ve video için)
- **Deployment:** Vercel

## Özellikler

- Ana sayfa, koleksiyonlar ve sanatçılar sayfaları
- Sanatçıların biyografilerini ve eserlerini görüntüleme
- Koleksiyonları ve sanat eserlerini görüntüleme
- Admin paneli ile sanatçı, koleksiyon ve eser yönetimi
- Güvenli kimlik doğrulama
- Frontend'den doğrudan Tebi.io'ya medya yükleme (Vercel 25MB sınırını aşmamak için)
- Responsive tasarım (mobil, tablet ve masaüstü)

## Kurulum

### Gereken Yazılımlar

- Node.js (v18 veya üzeri)
- npm veya yarn

### Adımlar

1. Repoyu klonlayın:
   ```bash
   git clone https://github.com/kullanici/artsuitgallery.git
   cd artsuitgallery
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env` dosyasını oluşturun:
   ```
   # Veritabanı
   DATABASE_URL="postgresql://kullanici:sifre@neon-db-host:5432/veritabani?sslmode=require"

   # NextAuth
   NEXTAUTH_SECRET="gizli-anahtar-buraya"
   NEXTAUTH_URL="http://localhost:3000"

   # Tebi.io - Medya Depolama
   NEXT_PUBLIC_TEBI_ENDPOINT="https://tebi-endpoint"
   NEXT_PUBLIC_TEBI_ACCESS_KEY="tebi-access-key-buraya"
   NEXT_PUBLIC_TEBI_SECRET_KEY="tebi-secret-key-buraya"
   NEXT_PUBLIC_TEBI_BUCKET_NAME="sanat-galerisi-bucket"

   # JWT Token
   JWT_SECRET="jwt-secret-buraya"
   ```

4. Prisma veritabanı şemasını senkronize edin:
   ```bash
   npx prisma db push
   ```

5. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## Kullanım

### Admin Paneli

- Admin paneline `/admin` yolundan erişebilirsiniz
- Varsayılan giriş bilgileri:
  - E-posta: `admin@artsuitgallery.com`
  - Şifre: `password123`

### Sanatçı ve Koleksiyon Yönetimi

1. Admin panelinde oturum açın
2. "Sanatçılar" veya "Koleksiyonlar" menüsüne gidin
3. Yeni eklemek için "Yeni Ekle" butonunu kullanın
4. Düzenlemek için listelenen öğenin "Düzenle" butonunu kullanın

### Dosya Yükleme

- Sanatçı veya koleksiyon eklerken/düzenlerken dosya yükleme alanını kullanabilirsiniz
- Dosyalar doğrudan frontend'den Tebi.io'ya yüklenir, böylece Vercel'in 25MB sınırı aşılmaz

## Canlı Demo

Site şu adreste canlı olarak görüntülenebilir: [https://artsuitgallery.vercel.app](https://artsuitgallery.vercel.app)



DATABASE_URL="postgresql://neondb_owner:npg_wYBnTOp45sdk@ep-gentle-salad-a2x0bd78-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"  
# NextAuth  
NEXTAUTH_SECRET="9c8a8f99d1926d3a0ed1b72043b0f7a234b3a7a149cdb2b0ffde6c03d5ad27d4"  
NEXTAUTH_URL="http://localhost:3000"  
# Tebi.io - Medya Depolama  
NEXT_PUBLIC_TEBI_ENDPOINT="https://s3.tebi.io"  
NEXT_PUBLIC_TEBI_ACCESS_KEY="0AlK8hps15wf3pqg"  
NEXT_PUBLIC_TEBI_SECRET_KEY="bJpzhQ5LBpWD6HyIMjEBg0hNKgQdY2oESYGcBwYB"  
NEXT_PUBLIC_TEBI_BUCKET_NAME="artsuitgallery"  
# JWT Token  
JWT_SECRET="art-suit-gallery-secret-key" 
