import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useEffect } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();

  // Aktifkan dark mode default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Data Teks Multibahasa
  const content = {
    ID: {
      welcome: "Halo, Selamat Datang!",
      subtitle: "simulator reaktor kartini",
      btnSim: "Simulasi",
      btnTour: "Ikuti Tur"
    },
    EN: {
      welcome: "Hello, Welcome!",
      subtitle: "kartini reactor simulator",
      btnSim: "Simulation",
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
        
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <button 
            onClick={() => navigate('/simulator')}
            className="w-48 border-2 border-white px-8 py-3 font-bold hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
          >
            {text.btnSim}
          </button>
          
          <button 
            onClick={() => navigate('/tour')}
            className="w-48 bg-white text-black px-8 py-3 font-bold hover:bg-gray-200 transition-all duration-300 shadow-xl"
          >
            {text.btnTour}
          </button>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
    </div>
  );
};

export default Home;