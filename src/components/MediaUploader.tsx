'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, FileText } from 'lucide-react';
import { uploadFile } from '@/lib/tebi';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

export interface MediaUploaderProps {
  /** Yükleme tamamlandığında çağrılacak fonksiyon */
  onUploadComplete?: (urls: string[]) => void;
  /** Yükleme hatası oluştuğunda çağrılacak fonksiyon */
  onError?: (error: Error) => void;
  /** Maksimum dosya boyutu (MB) */
  maxSize?: number;
  /** Kabul edilen dosya tipleri */
  acceptedFileTypes?: string[];
  /** Çoklu dosya yüklemeye izin verilsin mi */
  multiple?: boolean;
  /** Dosyalar için klasör yolu */
  folder?: string;
  /** Önizleme gösterilsin mi */
  showPreview?: boolean;
  /** Bileşen sınıfı */
  className?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadComplete,
  onError,
  maxSize = 10, // Varsayılan maksimum 10MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  multiple = false,
  folder = 'uploads',
  showPreview = true,
  className,
}) => {
  // Durum değişkenleri
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  
  // File input referansı
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dosya seçme işleyicisi
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const selectedFiles = Array.from(files);
    const validFiles: File[] = [];
    const newPreviews: { file: File; preview: string }[] = [];
    
    // Dosya doğrulama
    for (const file of selectedFiles) {
      // Dosya boyutu kontrolü
      if (file.size > maxSize * 1024 * 1024) {
        onError?.(new Error(`Dosya boyutu çok büyük: ${file.name}. Maksimum boyut: ${maxSize}MB.`));
        continue;
      }
      
      // Dosya türü kontrolü
      if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(file.type)) {
        onError?.(new Error(`Desteklenmeyen dosya türü: ${file.type}. Kabul edilen türler: ${acceptedFileTypes.join(', ')}.`));
        continue;
      }
      
      validFiles.push(file);
      
      // Resim dosyaları için önizleme oluştur
      if (showPreview && file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newPreviews.push({ file, preview });
      } else {
        // Resim olmayan dosyalar için varsayılan önizleme
        newPreviews.push({ file, preview: '' });
      }
    }
    
    if (validFiles.length === 0) return;
    
    // Çoklu yükleme kontrolü
    if (!multiple && validFiles.length > 1) {
      onError?.(new Error('Çoklu dosya yükleme kapalı. Lütfen tek dosya seçin.'));
      return;
    }
    
    // Önizlemeleri güncelle
    setPreviews(newPreviews);
    
    // Yüklemeyi başlat
    setIsUploading(true);
    setProgress(new Array(validFiles.length).fill(0));
    
    const uploadPromises = validFiles.map((file, index) => {
      return uploadFile(
        file,
        folder,
        (progressValue) => {
          setProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = progressValue;
            return newProgress;
          });
        }
      );
    });
    
    try {
      const results = await Promise.all(uploadPromises);
      const fileUrls = results.map(result => result.fileUrl);
      
      // Yükleme tamamlandığında callback
      onUploadComplete?.(fileUrls);
      
      // Durumu sıfırla
      setIsUploading(false);
      setPreviews([]);
      setProgress([]);
      
      // Input değerini sıfırla
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setIsUploading(false);
      onError?.(error as Error);
    }
  }, [maxSize, acceptedFileTypes, multiple, folder, onUploadComplete, onError, showPreview]);
  
  // Dosya seçme diyalogunu aç
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Dosya sürükleme işleyicileri
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };
  
  // Dosya önizlemelerini temizle
  const clearPreview = (index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      
      // URL nesnesini temizle
      if (newPreviews[index].preview) {
        URL.revokeObjectURL(newPreviews[index].preview);
      }
      
      // Önizlemeyi kaldır
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };
  
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Dosya yükleme alanı */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-40 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700",
          isUploading && "pointer-events-none opacity-60"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptedFileTypes.join(',')}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={isUploading}
        />
        
        <Upload className="w-10 h-10 mb-2 text-gray-500 dark:text-gray-400" />
        
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold">Dosya yüklemek için tıklayın</span> veya sürükleyip bırakın
        </p>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {acceptedFileTypes.join(', ')} - Maksimum {maxSize}MB
          {multiple ? ' - Çoklu dosya yükleyebilirsiniz' : ''}
        </p>
      </div>
      
      {/* Yükleme ilerleme çubukları */}
      {isUploading && previews.length > 0 && (
        <div className="space-y-2">
          {previews.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between mb-1 text-xs">
                  <span className="font-medium truncate max-w-[200px]">{item.file.name}</span>
                  <span>{progress[index]}%</span>
                </div>
                <Progress value={progress[index]} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Dosya önizlemeleri */}
      {showPreview && !isUploading && previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {previews.map((item, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border dark:border-gray-700">
              {item.preview ? (
                // Resim dosyası önizlemesi
                <div className="relative aspect-square">
                  <img 
                    src={item.preview} 
                    alt={item.file.name} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                // Diğer dosyalar için önizleme
                <div className="flex flex-col items-center justify-center aspect-square bg-gray-100 dark:bg-gray-800 p-2">
                  {item.file.type.includes('image/') ? (
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-500" />
                  )}
                  <span className="mt-2 text-xs truncate max-w-full text-center">
                    {item.file.name}
                  </span>
                </div>
              )}
              
              {/* Kaldır butonu */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearPreview(index);
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Yükleme butonu (önizleme olduğunda ve yükleme başlamadığında) */}
      {!isUploading && previews.length > 0 && (
        <Button 
          type="button" 
          onClick={() => handleFileSelect(null)}
          variant="outline"
          className="ml-auto"
        >
          Yeni Dosya Seç
        </Button>
      )}
    </div>
  );
};

export default MediaUploader; 