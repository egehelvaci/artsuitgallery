import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache'; 
import ArtistDetailClient from './components/ArtistDetailClient';
import { getArtistBySlug as fetchArtistFromDB } from '@/lib/prisma/artists';

// Sanatçı ve eserlerini içeren tip tanımı
interface Artist {
  id: string;
  name: string;
  slug: string;
  biography?: string;
  artworks: string[];
  createdAt: string;
  updatedAt: string;
}

// Sanatçı bilgilerini getirme fonksiyonu - doğrudan veritabanından çekerek
const getArtistBySlug = unstable_cache(
  async (slug: string): Promise<Artist | null> => {
    try {
      // Direkt Prisma fonksiyonunu kullanarak veritabanından çek
      const artist = await fetchArtistFromDB(slug);
      return artist;
    } catch (error) {
      console.error('Sanatçı detayları yüklenirken hata:', error);
      return null;
    }
  },
  ['artist-data'],
  { revalidate: 3600 }
);

// Dinamik meta veriler için generateMetadata fonksiyonu
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // API'den sanatçı bilgisini al
  const artist = await getArtistBySlug(params.slug);
  
  if (!artist) {
    return {
      title: 'Sanatçı Bulunamadı',
    };
  }

  return {
    title: `${artist.name} | Art Suites Gallery`,
    description: artist.biography 
      ? `${artist.name} - ${artist.biography.substring(0, 160)}...` 
      : `${artist.name} - Art Suites Gallery sanatçısı`,
    openGraph: {
      title: artist.name,
      description: artist.biography ? artist.biography.substring(0, 160) : `${artist.name} - Art Suites Gallery sanatçısı`,
      type: 'profile',
    },
  };
}

// Server component
export default async function ArtistDetailPage({ params }: { params: { slug: string } }) {
  const artist = await getArtistBySlug(params.slug);
  
  if (!artist) {
    notFound();
  }
  
  // Sanatçının artwork dizisi yoksa boş dizi kullan
  const artworks = artist.artworks || [];
  
  return <ArtistDetailClient artist={artist} artworks={artworks} />;
} 