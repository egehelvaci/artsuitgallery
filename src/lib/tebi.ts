/**
 * Tebi.io için yardımcı fonksiyonlar
 * 
 * Bu dosya, Tebi.io (S3 uyumlu object storage) ile etkileşim için gerekli fonksiyonları içerir.
 * Dosya yükleme işlemi frontend'de gerçekleştirilecek, backend'e yük bindirmemek için.
 */

import { v4 as uuidv4 } from 'uuid';

// Tebi.io API bilgileri
const TEBI_ACCESS_KEY = process.env.NEXT_PUBLIC_TEBI_ACCESS_KEY || '';
const TEBI_SECRET_KEY = process.env.NEXT_PUBLIC_TEBI_SECRET_KEY || '';
const TEBI_ENDPOINT = (process.env.NEXT_PUBLIC_TEBI_ENDPOINT || 'https://s3.tebi.io')
  .replace(/h+ttps:\/\//i, 'https://') // hhttps:// veya https:// gibi sorunları düzeltir
  .replace(/^(?!https?:\/\/)/, 'https://'); // https:// veya http:// ile başlamıyorsa ekler
const TEBI_BUCKET = process.env.NEXT_PUBLIC_TEBI_BUCKET_NAME || 'artsuitgallery';

// Tebi.io konfigürasyon nesnesi
export const tebiConfig = {
  region: 'auto',
  endpoint: TEBI_ENDPOINT,
  accessKey: TEBI_ACCESS_KEY,
  secretKey: TEBI_SECRET_KEY,
  bucketName: TEBI_BUCKET
};

// Yükleme hatası türü
interface UploadError extends Error {
  code?: string;
  message: string;
}

/**
 * Dosyayı Tebi.io'ya yükle
 * @param file Yüklenecek dosya
 * @param folder Yüklenecek klasör (varsayılan: 'uploads')
 * @param onProgress İlerleme durumunu takip eden callback (0-100 arası)
 * @returns Yüklenen dosya URL'si ve anahtarı
 */
export async function uploadFile(
  file: File, 
  folder: string = 'uploads', 
  onProgress?: (progress: number) => void
): Promise<{ fileUrl: string; key: string }> {
  try {
    // Dosya türünden uzantıyı çıkar
    const extension = file.name.split('.').pop() || '';
    
    // Benzersiz dosya adı oluştur
    const fileName = `${uuidv4()}.${extension}`;
    
    // Depolama yolunu oluştur (klasör/dosya-adı.uzantı)
    const key = `${folder}/${fileName}`;
    
    console.log("Dosya yükleme yolu ve bilgileri:", {
      key,
      extension,
      fileName,
      folder,
      type: file.type,
      size: file.size
    });
    
    // Form verisi oluştur
    const formData = new FormData();
    
    // Tebi.io için gerekli alanları ekle
    formData.append('acl', 'public-read'); // ACL ayarı - dosyayı herkes görebilir
    formData.append('key', key);
    formData.append('Content-Type', file.type);
    formData.append('file', file);
    
    console.log("Yükleme başlıyor:", TEBI_ENDPOINT, TEBI_BUCKET);
    
    // Yükleme işlemi
    const response = await fetch(`${TEBI_ENDPOINT}/${TEBI_BUCKET}`, {
      method: 'POST',
      body: formData,
    });
    
    // Hata kontrolü
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Tebi.io yükleme hatası:", errorText);
      throw new Error(`Yükleme hatası: ${response.status} ${errorText}`);
    }
    
    // Tebi.io tarafından sunulan URL formatında dosya URL'sini oluştur
    const fileUrl = `${TEBI_ENDPOINT}/${TEBI_BUCKET}/${key}`;
    console.log("Dosya başarıyla yüklendi:", fileUrl);
    
    return { fileUrl, key };
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    throw error;
  }
}

/**
 * Tebi.io'dan dosya sil
 * @param key Silinecek dosyanın anahtarı
 * @returns İşlem başarılı ise true, değilse false
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${TEBI_ENDPOINT}/${TEBI_BUCKET}/${key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TEBI_ACCESS_KEY}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    throw error;
  }
}

/**
 * Tebi.io'daki bir dosyanın URL'sini oluştur
 * @param key Dosya anahtarı
 * @returns Dosya URL'si
 */
export function getFileUrl(key: string): string {
  return `${TEBI_ENDPOINT}/${TEBI_BUCKET}/${key}`;
}

/**
 * Tebi.io'da bir klasörün içeriğini listele
 * @param prefix Listelenecek klasör yolu
 * @returns Dosya listesi
 */
export async function listFiles(prefix: string = ''): Promise<{ key: string; size: number; lastModified: Date }[]> {
  try {
    const response = await fetch(`${TEBI_ENDPOINT}/${TEBI_BUCKET}?list-type=2&prefix=${prefix}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEBI_ACCESS_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Dosya listeleme hatası: ${response.status}`);
    }
    
    const data = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    
    const contents = xmlDoc.getElementsByTagName('Contents');
    const files = [];
    
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      const key = content.getElementsByTagName('Key')[0]?.textContent || '';
      const size = parseInt(content.getElementsByTagName('Size')[0]?.textContent || '0', 10);
      const lastModified = new Date(content.getElementsByTagName('LastModified')[0]?.textContent || '');
      
      files.push({ key, size, lastModified });
    }
    
    return files;
  } catch (error) {
    console.error('Dosya listeleme hatası:', error);
    throw error;
  }
}

/**
 * Verilen URL'yi Tebi.io dosya anahtarına dönüştür
 * @param url Tebi.io dosya URL'si
 * @returns Dosya anahtarı
 */
export function urlToKey(url: string): string {
  if (!url.includes(TEBI_ENDPOINT) || !url.includes(TEBI_BUCKET)) {
    throw new Error('Geçersiz Tebi.io URL\'si');
  }
  
  const bucketPrefix = `${TEBI_ENDPOINT}/${TEBI_BUCKET}/`;
  return url.replace(bucketPrefix, '');
} 