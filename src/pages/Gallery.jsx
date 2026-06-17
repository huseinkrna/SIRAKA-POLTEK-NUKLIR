// src/pages/Gallery.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { galleryItems } from '../data/galleryData';

export default function Gallery() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true); // untuk transisi
  const totalItems = galleryItems.length;

  // Efek fade saat index berubah
  useEffect(() => {
    setFade(false);
    const timer = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
  const nextIndex = (currentIndex + 1) % totalItems;

  const currentItem = galleryItems[currentIndex];
  const prevItem = galleryItems[prevIndex];
  const nextItem = galleryItems[nextIndex];

  const getCaption = (item) => {
    return item.caption[lang === 'ID' ? 'id' : 'en'];
  };

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden">
      
      {/* Header - fixed height */}
      <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border bg-card">
        <h1 className="text-2xl font-bold text-primary">
          {lang === 'ID' ? 'Galeri Reaktor Kartini' : 'Kartini Reactor Gallery'}
        </h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          {lang === 'ID' ? 'Kembali' : 'Back'}
        </button>
      </header>

      {/* Konten Gallery - mengambil sisa tinggi layar */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-hidden">
        <div className="relative w-full max-w-6xl flex flex-col items-center justify-center h-full">
          
          {/* Tombol panah kiri/kanan (desktop) */}
          <button
            onClick={goToPrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
            aria-label="Previous"
          >
            ◀
          </button>
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
            aria-label="Next"
          >
            ▶
          </button>

          {/* Tiga kolom gambar: prev, current, next */}
          <div className="flex items-center justify-center gap-4 w-full h-full max-h-[70vh]">
            
            {/* Preview kiri (desktop) */}
            <div 
              className="hidden md:block w-1/4 h-full opacity-40 hover:opacity-70 transition cursor-pointer"
              onClick={goToPrev}
            >
              <div className="w-full h-full rounded-lg overflow-hidden bg-black">
                <img 
                  src={prevItem.image} 
                  alt={getCaption(prevItem)}
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '1193/772' }}
                />
              </div>
            </div>

            {/* Gambar utama */}
            <div className="relative w-full md:w-1/2 h-full flex flex-col items-center justify-center">
              <div className="w-full h-full rounded-lg overflow-hidden bg-black shadow-2xl">
                <img 
                  src={currentItem.image} 
                  alt={getCaption(currentItem)}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
                  style={{ aspectRatio: '1193/772' }}
                />
              </div>
              {/* Tombol panah mobile di dalam area gambar */}
              <button
                onClick={goToPrev}
                className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
              >
                ◀
              </button>
              <button
                onClick={goToNext}
                className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
              >
                ▶
              </button>

              {/* Caption */}
              <div className="mt-3 text-center flex-shrink-0">
                <p className="text-base md:text-lg font-semibold">
                  {getCaption(currentItem)}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {currentIndex + 1} / {totalItems}
                </p>
              </div>
            </div>

            {/* Preview kanan (desktop) */}
            <div 
              className="hidden md:block w-1/4 h-full opacity-40 hover:opacity-70 transition cursor-pointer"
              onClick={goToNext}
            >
              <div className="w-full h-full rounded-lg overflow-hidden bg-black">
                <img 
                  src={nextItem.image} 
                  alt={getCaption(nextItem)}
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '1193/772' }}
                />
              </div>
            </div>
          </div>

          {/* Thumbnail strip di bawah */}
          <div className="flex-shrink-0 w-full flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                  idx === currentIndex ? 'border-primary' : 'border-transparent hover:border-gray-500'
                }`}
              >
                <img 
                  src={item.image} 
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}