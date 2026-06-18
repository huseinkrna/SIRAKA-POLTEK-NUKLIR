// src/pages/HistoryTour.jsx
import { useNavigate } from 'react-router-dom';
import TimelineCard from '../components/history/TimelineCard';
import { historyData } from '../data/historyData';

export default function HistoryTour() {
  const navigate = useNavigate();

  return (
    // Ganti bg dan text
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      
      {/* Hero Section */}
      <header className="relative h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img 
            src="/assets/images/sejarah/kondisi-gedung-jadi.jpg" 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-foreground tracking-tight drop-shadow-lg">
            Menembus <span className="text-primary">Waktu</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
            Eksplorasi rekam jejak teknologi Reaktor Kartini sebelum kamu mengambil alih kendali di masa depan.
          </p>
        </div>
      </header>

      {/* Timeline Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        {historyData.map((item, index) => (
          <TimelineCard 
            key={item.id} 
            data={item} 
            isReversed={index % 2 !== 0} 
          />
        ))}
      </section>

      {/* CTA Section */}
      <section className="relative py-24 border-t border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-10">
          <div className="inline-block" aria-hidden="true">
            <span className="bg-primary/10 border border-primary/30 text-primary text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              Fase 4: Simulasi
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
            Sejarah Telah Ditulis. <br className="hidden md:block"/> Sekarang Giliranmu.
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Selama lebih dari 4 dekade, konsol analog ini dikendalikan oleh para ahli menggunakan instrumen fisik. Buktikan pemahamanmu dengan mencoba arsitektur digitalnya.
          </p>
          
          <div className="mt-14 mb-14 max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border bg-card">
            <img 
              src="/assets/images/sejarah/06-ruang-kendali-lawas.jpeg" 
              alt="Tampilan konsol kendali fisik Reaktor Kartini di masa lalu"
              className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-500"
            />
          </div>

          <button 
            onClick={() => navigate('/simulator')}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-foreground transition-all duration-200 bg-primary rounded-xl hover:bg-primary/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transform hover:-translate-y-1"
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