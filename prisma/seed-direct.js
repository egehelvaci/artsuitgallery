const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Örnek veriler oluşturuluyor...');

  // Admin kullanıcısı oluştur
  const adminPassword = await bcrypt.hash('admin123', 10);
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

  // Örnek sanatçılar oluştur
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

  // Koleksiyon oluştur
  const collections = [
    {
      title: 'Modern Sanat Eserleri',
      slug: 'modern-sanat-eserleri',
      artist_name: 'Pablo Picasso',
      artistSlug: 'picasso', // Bağlantı için
      mediaUrl: 'https://example.com/modern1.jpg',
      mediaType: 'IMAGE',
    },
    {
      title: 'Picasso Video Koleksiyonu',
      slug: 'picasso-video-koleksiyonu',
      artist_name: 'Pablo Picasso',
      artistSlug: 'picasso', // Bağlantı için
      mediaUrl: 'https://example.com/picasso-video.mp4',
      mediaType: 'VIDEO',
    },
    {
      title: 'Post-Empresyonist Koleksiyon',
      slug: 'post-empresyonist-koleksiyon',
      artist_name: 'Vincent van Gogh',
      artistSlug: 'van-gogh', // Bağlantı için
      mediaUrl: 'https://example.com/post1.jpg',
      mediaType: 'IMAGE',
    },
    {
      title: 'Van Gogh Natürmortları',
      slug: 'van-gogh-naturmortlari',
      artist_name: 'Vincent van Gogh',
      artistSlug: 'van-gogh', // Bağlantı için
      mediaUrl: 'https://example.com/vangogh-nature.jpg',
      mediaType: 'IMAGE',
    },
    {
      title: 'Meksika Sanat Koleksiyonu',
      slug: 'meksika-sanat-koleksiyonu',
      artist_name: 'Frida Kahlo',
      artistSlug: 'frida-kahlo', // Bağlantı için
      mediaUrl: 'https://example.com/meksika1.jpg',
      mediaType: 'IMAGE',
    },
  ];

  // Koleksiyonı oluştur
  for (const collectionData of collections) {
    const { artistSlug, ...collectionFields } = collectionData;
    
    // İlgili sanatçıyı bul
    const artist = await prisma.artist.findUnique({
      where: { slug: artistSlug },
    });

    if (!artist) {
      console.log(`Sanatçı bulunamadı: ${artistSlug}`);
      continue;
    }

    // Koleksiyonu oluştur
    const collection = await prisma.collection.upsert({
      where: { slug: collectionFields.slug },
      update: {
        ...collectionFields,
        artist: {
          connect: { id: artist.id },
        },
      },
      create: {
        ...collectionFields,
        artist: {
          connect: { id: artist.id },
        },
      },
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