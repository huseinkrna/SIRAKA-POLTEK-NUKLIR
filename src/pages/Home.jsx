// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useEffect } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const content = {
    ID: {
      welcome: "Halo, Selamat Datang!",
      subtitle: "simulator reaktor kartini",
      btnSim: "Simulasi",
      btnGallery: "Galeri",
      btnTour: "Ikuti Tur"
    },
    EN: {
      welcome: "Hello, Welcome!",
      subtitle: "kartini reactor simulator",
      btnSim: "Simulation",
      btnGallery: "Gallery",
      btnTour: "Take a Tour"
    }
  };

  const activeLang = (lang === 'ID' || lang === 'EN') ? lang : 'ID';
  const text = content[activeLang];

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/assets/images/Cover.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Tombol Toggle Bahasa */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
        <span className={`text-sm font-bold ${activeLang === 'ID' ? 'text-white' : 'text-gray-500'}`}>Ind</span>
        <div 
          onClick={() => setLang(activeLang === 'ID' ? 'EN' : 'ID')}
          className="relative w-14 h-7 bg-gray-600/50 backdrop-blur-md rounded-full cursor-pointer p-1 transition-all"
        >
          <div 
            className={`absolute w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 transform ${
              activeLang === 'EN' ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </div>
        <span className={`text-sm font-bold ${activeLang === 'EN' ? 'text-white' : 'text-gray-500'}`}>Ing</span>
      </div>

      {/* Konten Utama */}
      <div className="z-10 text-center text-white px-4">
        <h2 className="text-xl md:text-3xl font-medium mb-2 tracking-wide drop-shadow-lg">
          {text.welcome}
        </h2>
        
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-2 drop-shadow-2xl">
          SIRAKA
        </h1>
        
        <p className="text-lg md:text-2xl tracking-[0.3em] uppercase mb-12 font-light drop-shadow-md">
          {text.subtitle}
        </p>
        
        {/* === TOMBOL DENGAN URUTAN BARU === */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          
          {/* 1. Ikuti Tur (tombol biasa) */}
          <button 
            onClick={() => navigate('/tour')}
            className="w-44 border-2 border-white text-white px-6 py-2.5 font-semibold hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm text-sm"
          >
            {text.btnTour}
          </button>
          
          {/* 2. Simulasi (tombol utama, lebih besar & menonjol) */}
          <button 
            onClick={() => navigate('/simulator')}
            className="w-56 md:w-64 bg-white text-black px-8 py-4 font-bold text-lg rounded-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300"
          >
            {text.btnSim}
          </button>
          
          {/* 3. Galeri (tombol biasa) */}
          <button 
            onClick={() => navigate('/gallery')}
            className="w-44 border-2 border-purple-400 text-purple-300 px-6 py-2.5 font-semibold hover:bg-purple-400 hover:text-black transition-all duration-300 backdrop-blur-sm text-sm"
          >
            {text.btnGallery}
          </button>
          
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
    </div>
  );
};

export default Home;