import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyData } from '../data/historyData';
import { useLanguage } from '../context/LanguageContext'; // Import Hook Global

const overviewData = {
  id: 0,
  year: "Pengantar",
  title: "Reaktor Kartini",
  description: "Reaktor Kartini adalah reaktor nuklir tipe TRIGA Mark II yang berlokasi di Kawasan Sains dan Teknologi (KST) Batan, Yogyakarta. Mulai kritis pertama kali pada 25 Januari 1979, reaktor ini dinamai untuk menghormati pahlawan nasional R.A. Kartini. Sebagai pusat unggulan pendidikan dan riset nuklir di Asia-Pasifik, Reaktor Kartini berperan penting dalam pelatihan, produksi radioisotop, serta analisis aktivasi neutron (AAN).",
  hasToggle: false,
  images: {
    default: "/assets/images/sejarah/overview-kartini.png"
  }
};

const extendedHistoryData = [overviewData, ...historyData];

const HistoryTour = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const mainContentRef = useRef(null);
  
  // Tarik state bahasa dari Global Context
  const { lang } = useLanguage();

  const activeData = extendedHistoryData[activeIndex];

  const getSingleImage = () => {
    if (activeData.images?.default) return activeData.images.default;
    if (activeData.images?.sebelum) return activeData.images.sebelum;
    if (activeData.images?.sesudah) return activeData.images.sesudah;
    return null;
  };
  const currentImage = getSingleImage();

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [activeIndex]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  const progress = ((activeIndex + 1) / extendedHistoryData.length) * 100;

  // Kamus UI Statis untuk Multibahasa
  const uiContent = {
    ID: {
      skip: "Langsung ke konten utama",
      subtitle: "- Simulator Reaktor Kartini",
      back: "Beranda",
      noImage: "Gambar tidak tersedia",
      sim: "Simulasi",
      ariaSim: "Buka Simulator Reaktor"
    },
    EN: {
      skip: "Skip to main content",
      subtitle: "- Kartini Reactor Simulator",
      back: "Home",
      noImage: "Image not available",
      sim: "Simulation",
      ariaSim: "Open Reactor Simulator"
    }
  };

  return (
    <div className="relative h-screen w-full bg-black text-white font-sans overflow-hidden">
      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-green-600 focus:text-black focus:p-3 focus:rounded-lg">
        {uiContent[lang].skip}
      </a>

      {/* Background layer */}
      <div className="absolute inset-0 z-0 transition-all duration-700">
        {currentImage && (
          <img
            key={currentImage}
            src={currentImage}
            alt=""
            className="w-full h-full object-cover scale-105 blur-sm transition-transform duration-1000"
            onError={(e) => (e.target.style.display = 'none')}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/80 to-black/90 backdrop-blur-[2px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 h-16 md:h-20 flex justify-between items-center px-6 md:px-12 border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <h1 className="text-sm md:text-base font-bold tracking-wide text-green-400 uppercase">
          SIRAKA <span className="text-gray-400 font-normal">{uiContent[lang].subtitle}</span>
        </h1>
        <button
          onClick={() => navigate('/')}
          className="text-xs md:text-sm uppercase tracking-wider font-semibold text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2 py-1"
          aria-label={uiContent[lang].back}
        >
          {uiContent[lang].back}
        </button>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        className="relative z-10 flex-1 flex items-center min-h-0 px-6 md:px-12 py-4"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          
          {/* Kolom Teks */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-white/10 shadow-2xl animate-fade-in-up max-h-[70vh] overflow-y-auto no-scrollbar">
            <span className="text-green-400 font-mono text-xs md:text-sm tracking-wider block mb-1">
              {activeData.year}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase leading-snug text-white drop-shadow-lg break-words">
              {activeData.title}
            </h2>
            <div className="w-12 h-0.5 bg-green-500 rounded-full my-3"></div>
            <div className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed">
              <p className="whitespace-normal text-sm md:text-base">{activeData.description}</p>
            </div>
          </div>

          {/* Kolom Gambar */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-green-500/30 shadow-2xl shadow-green-500/10 bg-gray-900/50 backdrop-blur-sm group">
              {currentImage ? (
                <img
                  key={currentImage}
                  src={currentImage}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={`Visual ${activeData.title}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="hidden absolute inset-0 items-center justify-center bg-gray-900/80 text-gray-400 text-sm text-center p-4">
                <span>{uiContent[lang].noImage}</span>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-green-500/20 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -top-3 -left-3 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </main>

      {/* Timeline Navigation */}
      <nav
        className="relative z-20 bg-black/60 backdrop-blur-xl border-t border-white/10 py-3 px-6 md:px-12 shrink-0"
        aria-label="Garis waktu sejarah Reaktor Kartini"
      >
        <div className="max-w-7xl mx-auto">
          <div className="w-full bg-gray-800 rounded-full h-1 mb-3 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-1">
            {extendedHistoryData.map((item, index) => {
              const isActive = activeIndex === index;
              const tahunSingkat = item.year.split(' - ')[0];
              const labelAkses = `${item.title} (${item.year})`;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="group flex flex-col items-center shrink-0 focus:outline-none min-w-[60px]"
                  aria-label={`Lihat sejarah: ${labelAkses}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={`text-[10px] md:text-xs font-bold transition-all ${
                      isActive
                        ? 'text-green-400 scale-110'
                        : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  >
                    {tahunSingkat}
                  </span>
                  <div className="relative flex items-center justify-center mt-1">
                    <div
                      className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-green-500 shadow-lg shadow-green-500/50 scale-125'
                          : 'bg-gray-700 group-hover:bg-gray-500'
                      }`}
                    ></div>
                    {isActive && (
                      <div className="absolute w-5 h-5 md:w-6 md:h-6 border border-green-500 rounded-full animate-ping opacity-60"></div>
                    )}
                  </div>
                  <span className="sr-only">{labelAkses}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Tombol Simulasi */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => navigate('/simulator')}
          className="bg-green-600 hover:bg-green-500 text-black font-bold py-2.5 px-5 rounded-full shadow-xl transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black text-xs md:text-sm uppercase tracking-wide flex items-center gap-2"
          aria-label={uiContent[lang].ariaSim}
        >
          <span>⚛️</span> {uiContent[lang].sim}
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        
        *:focus-visible {
          outline: 2px solid #22c55e;
          outline-offset: 2px;
          border-radius: 6px;
        }
        
        body, p, button, a {
          font-size: 1rem;
        }
        
        .break-words {
          word-break: break-word;
          overflow-wrap: break-word;
        }
        
        .h-screen {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        
        main {
          flex: 1;
          min-height: 0;
        }
      `}</style>
    </div>
  );
};

export default HistoryTour;