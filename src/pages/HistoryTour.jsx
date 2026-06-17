// src/pages/HistoryTour.jsx
import { useNavigate } from 'react-router-dom';
import TimelineCard from '../components/history/TimelineCard';
import { historyData } from '../data/historyData';

export default function HistoryTour() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#0F172A] text-gray-50 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* FASE 1: THE HOOK (Hero Section) */}
      <header className="relative h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img 
            src="/assets/images/sejarah/01-gedung-utara.jpeg" 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/70 via-[#0F172A]/90 to-[#0F172A]"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-white tracking-tight drop-shadow-lg">
            Menembus <span className="text-blue-400">Waktu.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-light leading-relaxed max-w-3xl mx-auto">
            Eksplorasi rekam jejak teknologi Reaktor Kartini sebelum kamu mengambil alih kendali di masa depan.
          </p>
        </div>
      </header>

      {/* FASE 2 & 3: EDUKASI & VALIDASI (Timeline Section) */}
      <section 
        aria-label="Linimasa Sejarah Reaktor Kartini"
        className="max-w-6xl mx-auto px-6 py-24"
      >
        {historyData.map((item, index) => (
          <TimelineCard 
            key={item.id} 
            data={item} 
            isReversed={index % 2 !== 0} 
          />
        ))}
      </section>

      {/* FASE 4: CALL TO ACTION (Jembatan ke Simulator) */}
      <section 
        aria-labelledby="cta-heading"
        className="relative py-24 bg-black border-t border-gray-800"
      >
        <div className="max-w-5xl mx-auto px-6 text-center space-y-10">
          <div className="inline-block" aria-hidden="true">
            <span className="bg-blue-900/50 border border-blue-500/30 text-blue-300 text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              Fase 4: Simulasi
            </span>
          </div>
          
          <h2 id="cta-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Sejarah Telah Ditulis. <br className="hidden md:block"/> Sekarang Giliranmu.
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Selama lebih dari 4 dekade, konsol analog ini dikendalikan oleh para ahli menggunakan instrumen fisik. Buktikan pemahamanmu dengan mencoba arsitektur digitalnya.
          </p>
          
          <div className="mt-14 mb-14 max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-gray-900">
            <img 
              src="/assets/images/sejarah/06-ruang-kendali-lawas.jpeg" 
              alt="Tampilan konsol kendali fisik Reaktor Kartini di masa lalu"
              className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-500"
            />
          </div>

          <button 
            onClick={() => navigate('/simulator')}
            aria-label="Mulai masuk ke halaman Simulator Kartini"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transform hover:-translate-y-1"
          >
            Mulai Simulator Kartini
            <svg aria-hidden="true" className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

    </main>
  );
}