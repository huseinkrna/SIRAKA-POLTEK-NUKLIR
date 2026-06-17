import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line as ChartLine } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

export default function FullChart({ historyData = [], currentData }) {
  const [periode, setPeriode] = useState('∞');

  // Logic untuk sliding window agar grafik terus bergerak
  const latestTime = historyData.length > 0 ? historyData[historyData.length - 1].time : 0;
  const timeWindow = 120;
  const filteredData = historyData.filter(d => d.time > (latestTime - timeWindow));

  useEffect(() => {
    if (historyData.length > 1) {
      const current = historyData[historyData.length - 1];
      const previous = historyData[historyData.length - 2];
      
      if (current.dayaRelatif !== previous.dayaRelatif && current.dayaRelatif > 0 && previous.dayaRelatif > 0) {
        const dt = current.time - previous.time;
        const logRatio = Math.log(current.dayaRelatif / previous.dayaRelatif);
        if (Math.abs(logRatio) > 1e-6) {
          const calcT = dt / logRatio;
          setPeriode(Math.abs(calcT) > 1000 || calcT < -1000 ? '∞' : calcT.toFixed(2));
        } else {
          setPeriode('∞');
        }
      } else {
        setPeriode('∞');
      }
    } else {
      setPeriode('∞');
    }
  }, [historyData]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, 
    elements: { point: { radius: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false } 
    },
    scales: {
      x: { 
        type: 'linear',
        grid: { color: '#374151', drawBorder: false },
        ticks: { 
          color: '#6B7280', 
          font: { size: 8 },
          callback: (value) => Math.round(value) + 's'
        } 
      },
      y: { 
        min: 0,
        grid: { color: '#374151', drawBorder: false },
        ticks: { color: '#9CA3AF', font: { size: 9 } }
      }
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg border border-gray-700 p-4 flex flex-col">
      <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-gray-700 pb-2 flex justify-between items-center">
        <span>Panel Analisis Kinetika Reaktor</span>
        {currentData && (
          <span className="text-xs text-gray-400 font-mono">
            Daya Saat Ini: <span className="text-cyan-400 font-bold">{currentData.dayaWatt.toFixed(1)} W</span>
          </span>
        )}
      </h2>

      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 min-h-0">
        
        {/* DAYA AKTUAL */}
        <div className="bg-black border border-gray-800 rounded relative group p-3 flex flex-col">
          <h3 className="text-xs font-bold text-blue-400 uppercase mb-2">Daya Aktual vs Waktu</h3>
          <div className="flex-1 relative w-full h-full"><ChartLine options={commonOptions} data={{datasets: [{data: filteredData.map(d => ({ x: d.time, y: d.dayaWatt })), borderColor: '#3B82F6', borderWidth: 2, tension: 0.1}]}} /></div>
          <div className="hidden group-hover:block absolute top-10 left-4 right-4 bg-gray-800 text-gray-300 text-xs p-3 rounded shadow-xl border border-blue-600 z-50">
            Menunjukkan perubahan daya termal reaktor dalam satuan Watt (W) terhadap waktu secara real-time.
          </div>
        </div>

        {/* REAKTIVITAS */}
        <div className="bg-black border border-gray-800 rounded relative group p-3 flex flex-col">
          <h3 className="text-xs font-bold text-orange-400 uppercase mb-2">Profil Reaktivitas (ρ)</h3>
          <div className="flex-1 relative w-full h-full"><ChartLine options={commonOptions} data={{datasets: [{data: filteredData.map(d => ({ x: d.time, y: d.reaktivitas })), borderColor: '#F97316', borderWidth: 2, tension: 0.1}]}} /></div>
          <div className="hidden group-hover:block absolute top-10 left-4 right-4 bg-gray-800 text-gray-300 text-xs p-3 rounded shadow-xl border border-orange-600 z-50">
            Reaktivitas (ρ) menunjukkan kondisi reaktor, apakah daya stabil, meningkat, atau menurun. Saat ρ = 0, reaktor berada dalam keadaan seimbang dan daya tetap stabil. Jika reaktivitas meningkat melebihi Beta Efektif (β), reaktor dapat memasuki kondisi Prompt Critical, yaitu saat daya meningkat sangat cepat sehingga sistem keselamatan harus segera menghentikan reaksi untuk menjaga keamanan.
          </div>
        </div>

        {/* PREKURSOR */}
        <div className="bg-black border border-gray-800 rounded relative group p-3 flex flex-col">
          <h3 className="text-xs font-bold text-purple-400 uppercase mb-2">Konsentrasi Prekursor (C1-C6)</h3>
          <div className="flex-1 relative w-full h-full"><ChartLine options={commonOptions} data={{datasets: [0,1,2,3,4,5].map(i => ({ data: filteredData.map(d => ({ x: d.time, y: d.prekursor[i] })), borderColor: ['#EF4444', '#F59E0B', '#EAB308', '#22C55E', '#06B6D4', '#A855F7'][i], borderWidth: 1.5, tension: 0.1 }))}} /></div>
          <div className="hidden group-hover:block absolute bottom-10 left-4 right-4 bg-gray-800 text-gray-300 text-xs p-3 rounded shadow-xl border border-purple-600 z-50">
            Kelompok isotop hasil fisi yang menghasilkan neutron tunda. Neutron tunda berfungsi sebagai "rem alami" reaktor karena membantu memperlambat perubahan daya, sehingga reaktor dapat dikendalikan dengan aman.
          </div>
        </div>

        {/* PERIODE */}
        <div className="bg-black border border-gray-800 rounded relative group p-3 flex flex-col justify-center items-center">
          <h3 className="text-xs font-bold text-red-400 uppercase mb-2">Periode Reaktor (T)</h3>
          <div className="text-5xl font-mono font-bold text-white tracking-widest">{periode} <span className="text-xl text-gray-500">s</span></div>
          <div className="hidden group-hover:block absolute bottom-10 left-4 right-4 bg-gray-800 text-gray-300 text-xs p-3 rounded shadow-xl border border-red-600 z-50">
            Periode reaktor (T) adalah waktu yang dibutuhkan daya reaktor untuk bertambah sekitar 2,7 kali lipat. Semakin kecil nilainya, semakin cepat daya meningkat. Jika T kurang dari 3 detik, kenaikan daya dianggap terlalu cepat dan berpotensi berbahaya. Nilai negatif menunjukkan bahwa daya reaktor sedang menurun.
          </div>
        </div>
      </div>
    </div>
  );
}