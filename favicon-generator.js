const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  try {
    const inputImage = 'public/temp-logo.jpg';
    const publicDir = 'public';
    
    // favicon.ico (32x32)
    await sharp(inputImage)
      .resize(32, 32)
      .toFile(path.join(publicDir, 'temp-favicon-32.png'));
    
    // favicon-16x16.png
    await sharp(inputImage)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    
    // favicon-32x32.png
    await sharp(inputImage)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
    // android-chrome-192x192.png
    await sharp(inputImage)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'android-chrome-192x192.png'));
    
    // android-chrome-512x512.png
    await sharp(inputImage)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'android-chrome-512x512.png'));
    
    // apple-touch-icon.png
    await sharp(inputImage)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log('Favicon dosyaları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Hata:', error);
  }
}

generateFavicons(); 