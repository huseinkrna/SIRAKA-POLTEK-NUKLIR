// src/components/history/TimelineCard.jsx
import { useState } from 'react';

export default function TimelineCard({ data, isReversed }) {
  const [showTechData, setShowTechData] = useState(false);
  const techPanelId = `tech-panel-${data.id}`;

  return (
    <article 
      className={`flex flex-col md:flex-row ${isReversed ? 'md:flex-row-reverse' : ''} gap-8 items-center py-12 border-b border-gray-700/80 last:border-0`}
    >
      {/* Kolom Gambar */}
      <div className="w-full md:w-1/2">
        <div className="relative group overflow-hidden rounded-xl shadow-2xl bg-gray-900 border border-gray-700/50">
          <img 
            src={data.imagePath} 
            alt={data.imageAlt} 
            loading="lazy"
            className="w-full h-auto object-cover transform transition duration-500 group-hover:scale-[1.03]"
          />
          {/* Efek hover diubah agar tidak mengganggu kontras gambar */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300 aria-hidden='true'"></div>
        </div>
      </div>

      {/* Kolom Teks & Logika Progressive Disclosure */}
      <div className="w-full md:w-1/2 space-y-5">
        <span className="text-sm font-bold tracking-widest text-blue-300 uppercase letter-spacing-wide">
          {data.phaseLabel}
        </span>
        <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
          {data.title}
        </h3>
        {/* Rasio kontras diperbaiki: menggunakan text-gray-200, bukan gray-400 */}
        <p className="text-gray-200 leading-relaxed text-lg">
          {data.description}
        </p>

        {/* Tombol Toggle Aksesibel WCAG */}
        <div className="pt-4">
          <button 
            onClick={() => setShowTechData(!showTechData)}
            aria-expanded={showTechData}
            aria-controls={techPanelId}
            className="inline-flex items-center gap-2 text-base font-semibold text-blue-300 hover:text-blue-100 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 p-1 -ml-1"
          >
            <span aria-hidden="true" className="text-xl inline-block w-4 text-center">
              {showTechData ? '−' : '+'}
            </span>
            {showTechData ? 'Tutup Spesifikasi Teknis' : 'Lihat Spesifikasi Teknis'}
          </button>
          
          {/* Panel Teknis Tersembunyi */}
          <div 
            id={techPanelId}
            role="region"
            aria-label={`Spesifikasi teknis untuk ${data.title}`}
            className={`mt-4 bg-gray-800 border-l-4 border-blue-500 rounded-r-lg transition-all duration-300 ease-in-out ${
              showTechData ? 'opacity-100 max-h-[500px] p-5' : 'opacity-0 max-h-0 p-0 overflow-hidden'
            }`}
          >
            <p className="text-base text-blue-100 font-mono leading-relaxed">
              {data.technicalData}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}