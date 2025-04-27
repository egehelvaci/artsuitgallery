import { PrismaClient } from '../src/generated/prisma';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Örnek veriler oluşturuluyor...');

  // Admin kullanıcısı oluştur
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@artsuitgallery.com' },
    update: {},
    create: {
      email: 'admin@artsuitgallery.com',
      name: 'Admin User',
      password: adminPassword,
    },
  });
  
  console.log('Admin kullanıcısı oluşturuldu:', admin.email);

  // Örnek dünyaca ünlü sanatçılar oluştur
  const artists = [
    {
      name: 'Pablo Picasso',
      slug: 'picasso',
      biography: 'Pablo Picasso, 20. yüzyılın en tanınmış ve etkili sanatçılarından biridir.',
      artworks: [
        'https://example.com/picasso1.jpg',
        'https://example.com/picasso2.jpg',
        'https://example.com/picasso3.jpg',
      ],
    },
    {
      name: 'Vincent van Gogh',
      slug: 'van-gogh',
      biography: 'Vincent van Gogh, Post-Empresyonizm\'in en önemli temsilcilerinden Hollandalı bir ressamdır.',
      artworks: [
        'https://example.com/vangogh1.jpg',
        'https://example.com/vangogh2.jpg',
      ],
    },
    {
      name: 'Frida Kahlo',
      slug: 'frida-kahlo',
      biography: 'Frida Kahlo, Meksikalı ressam, genellikle kendi yaşamından ve acılarından ilham alan otoportreler çizmiştir.',
      artworks: [
        'https://example.com/frida1.jpg',
        'https://example.com/frida2.jpg',
        'https://example.com/frida3.jpg',
      ],
    },
  ];

  // Sanatçıları oluştur
  for (const artistData of artists) {
    const artist = await prisma.artist.upsert({
      where: { slug: artistData.slug },
      update: artistData,
      create: artistData,
    });
    console.log(`Sanatçı oluşturuldu: ${artist.name}`);
  }

  // Koleksiyonlar oluştur (kendi sanatçılarımızın eserleri)
  const collections = [
    {
      title: 'Modern Sanat Eserleri',
      slug: 'modern-sanat-eserleri',
      artist_name: 'Ali Yılmaz',
      imageUrl: 'https://example.com/modern1.jpg',
    },
    {
      title: 'Soyut Çalışmalar',
      slug: 'soyut-calismalar',
      artist_name: 'Zeynep Kaya',
      imageUrl: 'https://example.com/abstract1.jpg',
    },
    {
      title: 'Doğa Manzaraları',
      slug: 'doga-manzaralari',
      artist_name: 'Ahmet Demir',
      imageUrl: 'https://example.com/nature1.jpg',
    },
    {
      title: 'Şehir Çizimleri',
      slug: 'sehir-cizimleri',
      artist_name: 'Ayşe Yıldız',
      imageUrl: 'https://example.com/city1.jpg',
    },
    {
      title: 'Kültürel Yansımalar',
      slug: 'kulturel-yansimalar',
      artist_name: 'Mehmet Öz',
      imageUrl: 'https://example.com/culture1.jpg',
    },
  ];

  // Koleksiyonları oluştur
  for (const collectionData of collections) {
    const collection = await prisma.collection.upsert({
      where: { slug: collectionData.slug },
      update: collectionData,
      create: collectionData,
    });

    console.log(`Koleksiyon oluşturuldu: ${collection.title}`);
  }

  console.log('Seed işlemi tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 