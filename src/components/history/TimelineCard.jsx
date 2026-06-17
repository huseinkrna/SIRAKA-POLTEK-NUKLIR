// src/components/history/TimelineCard.jsx
import { useState } from 'react';

export default function TimelineCard({ data, isReversed }) {
  const [showTechData, setShowTechData] = useState(false);
  const techPanelId = `tech-panel-${data.id}`;

  return (
    <article 
      className={`flex flex-col md:flex-row ${isReversed ? 'md:flex-row-reverse' : ''} gap-8 items-center py-12 border-b border-border last:border-0`}
    >
      {/* Kolom Gambar */}
      <div className="w-full md:w-1/2">
        <div className="relative group overflow-hidden rounded-xl shadow-2xl bg-card border border-border">
          <img 
            src={data.imagePath} 
            alt={data.imageAlt} 
            loading="lazy"
            className="w-full h-auto object-cover transform transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>
        </div>
      </div>

      {/* Kolom Teks */}
      <div className="w-full md:w-1/2 space-y-5">
        <span className="text-sm font-bold tracking-widest text-primary uppercase">
          {data.phaseLabel}
        </span>
        <h3 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
          {data.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {data.description}
        </p>

        <div className="pt-4">
          <button 
            onClick={() => setShowTechData(!showTechData)}
            aria-expanded={showTechData}
            aria-controls={techPanelId}
            className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:text-primary/80 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background p-1 -ml-1"
          >
            <span aria-hidden="true" className="text-xl inline-block w-4 text-center">
              {showTechData ? '−' : '+'}
            </span>
            {showTechData ? 'Tutup Spesifikasi Teknis' : 'Lihat Spesifikasi Teknis'}
          </button>
          
          <div 
            id={techPanelId}
            role="region"
            aria-label={`Spesifikasi teknis untuk ${data.title}`}
            className={`mt-4 bg-muted border-l-4 border-primary rounded-r-lg transition-all duration-300 ease-in-out ${
              showTechData ? 'opacity-100 max-h-[500px] p-5' : 'opacity-0 max-h-0 p-0 overflow-hidden'
            }`}
          >
            <p className="text-base text-foreground font-mono leading-relaxed">
              {data.technicalData}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}