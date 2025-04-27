'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AddArtistPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    biography: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Formveri gönderiliyor:", formData);

    try {
      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          artworks: []
        }),
      });

      // API yanıtını konsola yazdır
      const responseText = await response.text();
      console.log(`API yanıtı (${response.status}):`, responseText);

      // Yanıt başarılı değilse
      if (!response.ok) {
        let errorMessage = 'Sanatçı eklenirken bir hata oluştu';
        try {
          // Eğer JSON olarak ayrıştırılabiliyorsa
          const errorData = JSON.parse(responseText);
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonError) {
          console.error('Hata yanıtı JSON olarak ayrıştırılamadı:', jsonError);
          errorMessage = `Sunucu hatası: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // API yanıtını beklemeden yönlendirme yap
      router.push('/admin/sanatcilar');
      router.refresh();
    } catch (err) {
      console.error('Sanatçı eklenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Sanatçı eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800">Yeni Sanatçı Ekle</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Geri Dön
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                İsim
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Örnek: "vincent-van-gogh" (sadece küçük harfler, rakamlar ve tire)
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Biyografi
              </label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Not:</strong> Görsel yüklemek için önce sanatçıyı ekleyin, sonra düzenleme sayfasından görselleri yükleyebilirsiniz.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white rounded-md ${
                  loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? 'Ekleniyor...' : 'Sanatçıyı Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
} 