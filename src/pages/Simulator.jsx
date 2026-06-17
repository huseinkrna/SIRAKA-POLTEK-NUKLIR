// src/pages/Simulator.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Komponen
import Core3D from '../components/simulator/Core3D';
import CrossSection3D from '../components/simulator/CrossSection3D';
import FullChart from '../components/simulator/FullChart';
import { useReactorPhysics } from '../hooks/useReactorPhysics';

export default function Simulator() {
  const navigate = useNavigate();
  const [activePOV, setActivePOV] = useState('main');
  const [warning, setWarning] = useState('');
  const [tutorialStep, setTutorialStep] = useState(1);
  const [showAlert, setShowAlert] = useState(false);

  const { stepSimulation } = useReactorPhysics();

  const [rods, setRods] = useState({ safe: 0.0, shim: 0.0, regulate: 0.0 });
  const [simData, setSimData] = useState({
    time: 0,
    dayaRelatif: 1.0,
    dayaWatt: 0.1,
    reaktivitas: 0,
    prekursor: [0, 0, 0, 0, 0, 0],
  });
  const [chartHistory, setChartHistory] = useState([]);

  const activeKeys = useRef(new Set());
  const [uiKeys, setUiKeys] = useState({});
  const alarmAudio = useRef(null);
  const isScrammedRef = useRef(false);
  const tripTimeRef = useRef(null);
  const [isTripUI, setIsTripUI] = useState(false);

  // Inisialisasi Audio
  useEffect(() => {
    alarmAudio.current = new Audio('/assets/alarm.mp3');
    alarmAudio.current.loop = true;
  }, []);

  // --- Handler untuk TRIP & RESET (tanpa setState di dalam effect) ---
  const handleTrip = useCallback(() => {
    setIsTripUI(true);
    setShowAlert(true);
    alarmAudio.current?.play().catch(() => {});
  }, []);

  const handleReset = useCallback(() => {
    setIsTripUI(false);
    setShowAlert(false);
    if (alarmAudio.current) {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
    }
  }, []);

  // Efek untuk mengatur audio berdasarkan status trip (hanya side effect)
  useEffect(() => {
    if (isTripUI) {
      // Audio sudah diputar oleh handleTrip, tidak perlu diputar lagi
      // Tapi jika audio berhenti karena sesuatu, kita bisa memastikan
      if (alarmAudio.current && alarmAudio.current.paused) {
        alarmAudio.current.play().catch(() => {});
      }
    } else {
      // Saat isTripUI false, pastikan audio mati
      if (alarmAudio.current && !alarmAudio.current.paused) {
        alarmAudio.current.pause();
        alarmAudio.current.currentTime = 0;
      }
    }
  }, [isTripUI]);

  // LOGIKA GAME LOOP & KEYBOARD
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.code === 'Space') e.preventDefault();
      activeKeys.current.add(e.code);
      setUiKeys((prev) => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e) => {
      activeKeys.current.delete(e.code);
      setUiKeys((prev) => ({ ...prev, [e.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      if (tutorialStep !== 0) return;

      const keys = activeKeys.current;
      const hasActionKey = ['KeyQ', 'KeyA', 'KeyW', 'KeyS', 'KeyE', 'KeyD'].some((k) =>
        keys.has(k)
      );

      if (hasActionKey && !keys.has('Space')) {
        setWarning('Tahan SPACE terlebih dahulu untuk mengontrol batang kendali!');
        return;
      }
      setWarning('');

      setRods((prev) => {
        let nS = prev.safe;
        let nSh = prev.shim;
        let nR = prev.regulate;

        const speed = 1.845;
        const scramSpeed = 5.0;

        if (isScrammedRef.current) {
          const timeSinceTrip = Date.now() - tripTimeRef.current;
          if (timeSinceTrip > 1500) {
            nS = Math.max(0, nS - scramSpeed);
            nSh = Math.max(0, nSh - scramSpeed);
            nR = Math.max(0, nR - scramSpeed);
          }
        } else {
          if (keys.has('Space')) {
            if (keys.has('KeyQ')) nS = Math.min(100, nS + speed);
            if (keys.has('KeyA')) nS = Math.max(0, nS - speed);

            if (nS >= 99.9) {
              if (keys.has('KeyW')) nSh = Math.min(100, nSh + speed);
              if (keys.has('KeyS')) nSh = Math.max(0, nSh - speed);
            } else if (keys.has('KeyW') || keys.has('KeyS')) {
              setWarning('INTERLOCK: Safe Rod harus 100%!');
            }

            if (nSh >= 45 && nSh <= 55) {
              if (keys.has('KeyE')) nR = Math.min(100, nR + speed);
              if (keys.has('KeyD')) nR = Math.max(0, nR - speed);
            } else if (keys.has('KeyE') || keys.has('KeyD')) {
              setWarning('INTERLOCK: Shim Rod harus di posisi ~50%!');
            }
          }
        }

        const res = stepSimulation({ safe: nS, shim: nSh, regulate: nR }, 0.05);

        // Pemicu TRIP
        if (res.dayaWatt >= 110000 && !isScrammedRef.current) {
          isScrammedRef.current = true;
          tripTimeRef.current = Date.now();
          handleTrip(); // menggunakan handler
        }

        // Reset SCRAM
        if (
          isScrammedRef.current &&
          nS === 0 &&
          nSh === 0 &&
          nR === 0 &&
          res.dayaWatt < 110000
        ) {
          isScrammedRef.current = false;
          tripTimeRef.current = null;
          handleReset(); // menggunakan handler
        }

        setChartHistory((prevHistory) => {
          const nextHistory = [
            ...prevHistory,
            {
              time: parseFloat(res.time.toFixed(1)),
              dayaWatt: res.dayaWatt,
              reaktivitas: res.reaktivitas,
              dayaRelatif: res.dayaRelatif,
              prekursor: res.prekursor,
            },
          ];
          if (nextHistory.length > 2400) {
            nextHistory.shift();
          }
          return nextHistory;
        });

        setSimData(res);
        return { safe: nS, shim: nSh, regulate: nR };
      });
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [tutorialStep, stepSimulation, handleTrip, handleReset]);

  const calculatePosition = (v) => 9 + (v / 100) * 19;
  const statusReaktor = isTripUI
    ? 'SCRAM'
    : simData.dayaWatt > 1.5
    ? 'CRITICAL'
    : 'SHUTDOWN';

  const formatDayaText = (watt) => {
    if (watt < 0.01) return '0.0';
    if (watt < 1) return watt.toFixed(4);
    return watt.toFixed(1);
  };

  return (
    <div className="h-screen w-full bg-gray-950 flex flex-col font-sans text-white overflow-hidden p-0">
      {/* POP-UP TUTORIAL INTERAKTIF */}
      {tutorialStep > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-blue-500 p-6 rounded-xl max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-blue-400 mb-4 text-center">
              {tutorialStep === 1 ? 'Informasi Simulasi' : 'Langkah Operasi'}
            </h2>
            <div className="text-sm text-gray-300 space-y-4 text-justify">
              {tutorialStep === 1 ? (
                <>
                  <p>
                    Simulator Reaktor Kartini dikembangkan sebagai media
                    pembelajaran dan visualisasi operasi Reaktor Kartini, yaitu
                    reaktor riset tipe TRIGA Mark II berdaya 100 kW termal
                    dengan 68 elemen bakar, tiga batang kendali (Safety Rod,
                    Shim Rod, dan Regulating Rod), serta sistem pendingin air
                    tipe open pool.
                  </p>
                  <p>
                    Seluruh data yang ditampilkan merupakan hasil simulasi
                    numerik dan bukan data operasi reaktor secara real-time.
                    Perhitungan menggunakan Persamaan Kinetika Titik (PKE), enam
                    kelompok neutron tunda, serta model umpan balik reaktivitas
                    akibat perubahan temperatur bahan bakar dan densitas
                    pendingin.
                  </p>
                  <p>
                    Simulator ini dikembangkan berdasarkan penelitian
                    "Improvement of a Code-Based Kartini Reactor Simulator for
                    Education and Training" dan ditujukan untuk mendukung
                    kegiatan pendidikan, pelatihan, serta pemahaman prinsip
                    operasi dan keselamatan reaktor nuklir.
                  </p>
                  <p>
                    {' '}
                    <strong>Catatan :</strong> Simulator masih dalam tahap
                    pengembangan. Hasil simulasi merupakan pendekatan matematis
                    dan dapat berbeda dari kondisi operasi Reaktor Kartini yang
                    sebenarnya.{' '}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    1. <strong>Tarik Safe Rod ke 100%:</strong> Tahan [SPACE] +
                    Q. Ini adalah syarat wajib pengamanan sebelum reaktor bisa
                    beroperasi.
                  </p>
                  <p>
                    2. <strong>Kompensasi Shim Rod:</strong> Tahan [SPACE] + W.
                    Tarik hingga ~50%.
                  </p>
                  <p>
                    3. <strong>Operasional Regulating Rod:</strong> Tahan
                    [SPACE] + E. Naikkan secara perlahan. Ini digunakan untuk
                    mengatur daya reaktor secara lebih presisi.
                  </p>
                  <p>
                    4. <strong>Protokol SCRAM:</strong> Jika daya menembus 110kW
                    (110.000W), alarm aktif. Setelah jeda mekanis 1.5 detik,
                    semua batang akan dijatuhkan otomatis (SCRAM) ke batas 0%
                    untuk menghentikan reaksi fisi secara paksa.
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setTutorialStep(0)}
                className="text-gray-500 hover:text-white"
              >
                Skip
              </button>
              <button
                onClick={() => setTutorialStep(tutorialStep === 2 ? 0 : 2)}
                className="bg-blue-600 px-6 py-2 rounded font-bold hover:bg-blue-500 transition"
              >
                {tutorialStep === 2 ? 'Mulai Simulasi' : 'Selanjutnya'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP TRIP BERKEDIP & TOMBOL CLOSE */}
      {isTripUI && showAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[90] w-80 bg-red-600 border-4 border-white p-4 rounded shadow-2xl animate-pulse">
          <button
            onClick={() => setShowAlert(false)}
            className="absolute top-1 right-2 font-bold text-white hover:text-black bg-red-800 rounded px-2"
          >
            X
          </button>
          <h2 className="text-center font-black text-white text-lg tracking-tighter">
            ⚠ REACTOR SCRAM ⚠
          </h2>
          <p className="text-[0.65rem] text-center font-bold text-white uppercase mt-1">
            Automatic SCRAM Active
          </p>
        </div>
      )}

      {/* HEADER */}
      <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 justify-between flex-shrink-0">
        <h1 className="text-lg font-bold text-blue-400">
          Simulator Reaktor Kartini
        </h1>
        <button
          onClick={() => navigate('/')}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold"
        >
          Beranda
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-1 p-1 overflow-hidden">
        {/* KOLOM KIRI (Visual Simulator) */}
        <div className="col-span-8 bg-black relative flex items-center justify-center border border-gray-800 rounded">
          {/* TOMBOL BUKU PANDUAN */}
          <div className="absolute bottom-4 left-4 z-40">
            <button
              onClick={() => setTutorialStep(1)}
              className="flex items-center justify-center bg-blue-900/80 hover:bg-blue-700 text-blue-100 p-2 rounded-full border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all group backdrop-blur-sm"
              title="Buka Buku Panduan"
            >
              <span className="text-lg">📖</span>
              <span className="w-0 overflow-hidden group-hover:w-20 group-hover:ml-2 text-[0.6rem] font-bold text-left transition-all duration-300 whitespace-nowrap">
                Panduan
              </span>
            </button>
          </div>

          {activePOV === 'main' && (
            <div className="relative w-full max-w-3xl">
              <img
                src="/assets/images/reaktor-bg.png"
                alt="Reaktor"
                className="w-full opacity-90"
              />

              <div
                className="absolute w-[2.5%] bg-red-600 z-10 transition-none rounded-full shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                style={{
                  left: '13.5%',
                  bottom: `${calculatePosition(rods.safe)}%`,
                  height: '22%',
                }}
              ></div>
              <div
                className="absolute w-[2.5%] bg-red-600 z-10 transition-none rounded-full shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                style={{
                  left: '18.4%',
                  bottom: `${calculatePosition(rods.shim)}%`,
                  height: '22%',
                }}
              ></div>
              <div
                className="absolute w-[2.5%] bg-red-600 z-10 transition-none rounded-full shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                style={{
                  left: '23.3%',
                  bottom: `${calculatePosition(rods.regulate)}%`,
                  height: '22%',
                }}
              ></div>

              <div className="absolute top-[29.6%] left-[14.5%] text-[0.6rem] font-mono font-bold text-cyan-300 z-20 transform -translate-x-1/2">
                {rods.safe.toFixed(1)}%
              </div>
              <div className="absolute top-[29.6%] left-[19.8%] text-[0.6rem] font-mono font-bold text-cyan-300 z-20 transform -translate-x-1/2">
                {rods.shim.toFixed(1)}%
              </div>
              <div className="absolute top-[29.6%] left-[25.5%] text-[0.6rem] font-mono font-bold text-cyan-300 z-20 transform -translate-x-1/2">
                {rods.regulate.toFixed(1)}%
              </div>

              {/* HOTSPOT */}
              <div className="absolute top-[75%] left-[20%] group z-30">
                <span className="bg-gray-800 text-[0.5rem] px-1.5 py-0.5 rounded-full border border-gray-600 cursor-help font-bold text-blue-300">
                  ?
                </span>
                <div className="hidden group-hover:block absolute bottom-full left-0 w-48 bg-gray-900 border border-blue-500 p-2 rounded shadow-xl text-left mb-1 z-50">
                  <h3 className="text-blue-400 font-bold text-[0.65rem] mb-1">
                    Teras Reaktor
                  </h3>
                  <p className="text-[0.55rem] text-gray-300">
                    Lokasi bahan bakar (Uranium). Tempat terjadinya reaksi fisi
                    berantai dalam kolam air demineralisasi.
                  </p>
                </div>
              </div>

              <div className="absolute top-[10%] left-[20%] group z-30">
                <span className="bg-gray-800 text-[0.5rem] px-1.5 py-0.5 rounded-full border border-gray-600 cursor-help font-bold text-yellow-300">
                  ?
                </span>
                <div className="hidden group-hover:block absolute top-full left-0 mt-1 w-48 bg-gray-900 border border-yellow-500 p-2 rounded shadow-xl text-left z-50">
                  <h3 className="text-yellow-400 font-bold text-[0.65rem] mb-1">
                    Rod Drive Mechanism
                  </h3>
                  <p className="text-[0.55rem] text-gray-300">
                    Motor stepper penarik batang. Dilengkapi magnetic clutch
                    pelepas batang otomatis jika arus diputus (SCRAM).
                  </p>
                </div>
              </div>

              <div className="absolute top-[50%] left-[40%] group z-30">
                <span className="bg-gray-800 text-[0.5rem] px-1.5 py-0.5 rounded-full border border-gray-600 cursor-help font-bold text-orange-300">
                  ?
                </span>
                <div className="hidden group-hover:block absolute bottom-full left-0 w-48 bg-gray-900 border border-orange-500 p-2 rounded shadow-xl text-left mb-1 z-50">
                  <h3 className="text-orange-400 font-bold text-[0.65rem] mb-1">
                    Pipa Pendingin Primer
                  </h3>
                  <p className="text-[0.55rem] text-gray-300">
                    Sirkuit yang membawa panas sisa fisi menuju Heat Exchanger
                    agar tidak terjadi pelelehan teras.
                  </p>
                </div>
              </div>

              <div className="absolute top-[50%] left-[75%] group z-30">
                <span className="bg-gray-800 text-[0.5rem] px-1.5 py-0.5 rounded-full border border-gray-600 cursor-help font-bold text-cyan-300">
                  ?
                </span>
                <div className="hidden group-hover:block absolute bottom-full right-0 w-48 bg-gray-900 border border-cyan-500 p-2 rounded shadow-xl text-left mb-1 z-50">
                  <h3 className="text-cyan-400 font-bold text-[0.65rem] mb-1">
                    Pompa Sirkulasi
                  </h3>
                  <p className="text-[0.55rem] text-gray-300">
                    Menjamin aliran sirkulasi air konstan selama reaktor
                    beroperasi pada daya tinggi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePOV === 'core' && <Core3D />}
          {activePOV === 'cooling' && <CrossSection3D />}

          {activePOV === 'grafik' && (
            <FullChart historyData={chartHistory} currentData={simData} />
          )}

          {warning && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-500 px-4 py-1.5 rounded-full text-xs animate-pulse z-50">
              {warning}
            </div>
          )}
        </div>

        {/* KOLOM KANAN (Dashboard) */}
        <div className="col-span-4 bg-gray-900 flex flex-col p-2 space-y-2 h-full overflow-hidden">
          <div className="bg-gray-800 p-2 rounded border border-gray-700 flex-shrink-0">
            <h2 className="text-[0.6rem] font-bold text-gray-400 mb-1 uppercase">
              Camera POV
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setActivePOV('main')}
                className={`py-1.5 rounded text-[0.6rem] font-bold ${
                  activePOV === 'main' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                MAIN
              </button>
              <button
                onClick={() => setActivePOV('core')}
                className={`py-1.5 rounded text-[0.6rem] font-bold ${
                  activePOV === 'core' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                CORE 3D
              </button>
              <button
                onClick={() => setActivePOV('cooling')}
                className={`py-1.5 rounded text-[0.6rem] font-bold ${
                  activePOV === 'cooling' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                PENAMPANG
              </button>
              <button
                onClick={() => setActivePOV('grafik')}
                className={`py-1.5 rounded text-[0.6rem] font-bold ${
                  activePOV === 'grafik' ? 'bg-emerald-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                GRAFIK FULL
              </button>
            </div>
          </div>

          {/* KONTROL BATANG KENDALI */}
          <div className="bg-gray-800 p-2 rounded border border-gray-700 flex-shrink-0">
            <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
              <h2 className="text-[0.65rem] font-bold text-gray-400 uppercase">
                Kontrol Batang Kendali
              </h2>
              <div className="relative group cursor-help z-50">
                <span className="bg-gray-700 text-gray-300 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[0.55rem] font-bold border border-gray-500">
                  ?
                </span>
                <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-56 bg-gray-900 border border-blue-500 p-2 rounded shadow-xl text-left">
                  <p className="text-[0.55rem] text-gray-300 mb-1">
                    Intervensi Manual Operator. Gunakan kombinasi{' '}
                    <strong>SPACE + Huruf</strong>.
                  </p>
                  <ul className="text-[0.55rem] text-gray-400 list-disc list-inside">
                    <li>
                      <strong className="text-red-400">Safe:</strong> Batang
                      SCRAM.
                    </li>
                    <li>
                      <strong className="text-yellow-400">Shim:</strong>{' '}
                      Kompensator reaktivitas.
                    </li>
                    <li>
                      <strong className="text-green-400">Reg:</strong> Pengatur
                      halus daya.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              {/* Kolom Safe */}
              <div className="flex flex-col space-y-1">
                <span className="text-[0.55rem] font-bold text-gray-400 uppercase">
                  Safe (Q/A)
                </span>
                <button
                  onPointerDown={() => {
                    setUiKeys((p) => ({ ...p, KeyQ: true }));
                    activeKeys.current.add('Space');
                    activeKeys.current.add('KeyQ');
                  }}
                  onPointerUp={() => {
                    setUiKeys((p) => ({ ...p, KeyQ: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyQ');
                  }}
                  onPointerLeave={() => {
                    setUiKeys((p) => ({ ...p, KeyQ: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyQ');
                  }}
                  className={`rounded py-1.5 text-xs select-none transition-all duration-100 ${
                    uiKeys['KeyQ']
                      ? 'bg-blue-600 scale-90 shadow-inner'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ▲
                </button>
                <button
                  onPointerDown={() => {
                    setUiKeys((p) => ({ ...p, KeyA: true }));
                    activeKeys.current.add('Space');
                    activeKeys.current.add('KeyA');
                  }}
                  onPointerUp={() => {
                    setUiKeys((p) => ({ ...p, KeyA: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyA');
                  }}
                  onPointerLeave={() => {
                    setUiKeys((p) => ({ ...p, KeyA: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyA');
                  }}
                  className={`rounded py-1.5 text-xs select-none transition-all duration-100 ${
                    uiKeys['KeyA']
                      ? 'bg-blue-600 scale-90 shadow-inner'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ▼
                </button>
              </div>

              {/* Kolom Shim */}
              <div className="flex flex-col space-y-1">
                <span className="text-[0.55rem] font-bold text-gray-400 uppercase">
                  Shim (W/S)
                </span>
                <button
                  onPointerDown={() => {
                    setUiKeys((p) => ({ ...p, KeyW: true }));
                    activeKeys.current.add('Space');
                    activeKeys.current.add('KeyW');
                  }}
                  onPointerUp={() => {
                    setUiKeys((p) => ({ ...p, KeyW: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyW');
                  }}
                  onPointerLeave={() => {
                    setUiKeys((p) => ({ ...p, KeyW: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyW');
                  }}
                  className={`rounded py-1.5 text-xs select-none transition-all duration-100 ${
                    uiKeys['KeyW']
                      ? 'bg-blue-600 scale-90 shadow-inner'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ▲
                </button>
                <button
                  onPointerDown={() => {
                    setUiKeys((p) => ({ ...p, KeyS: true }));
                    activeKeys.current.add('Space');
                    activeKeys.current.add('KeyS');
                  }}
                  onPointerUp={() => {
                    setUiKeys((p) => ({ ...p, KeyS: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyS');
                  }}
                  onPointerLeave={() => {
                    setUiKeys((p) => ({ ...p, KeyS: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyS');
                  }}
                  className={`rounded py-1.5 text-xs select-none transition-all duration-100 ${
                    uiKeys['KeyS']
                      ? 'bg-blue-600 scale-90 shadow-inner'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ▼
                </button>
              </div>

              {/* Kolom Regulate */}
              <div className="flex flex-col space-y-1">
                <span className="text-[0.55rem] font-bold text-gray-400 uppercase">
                  Reg (E/D)
                </span>
                <button
                  onPointerDown={() => {
                    setUiKeys((p) => ({ ...p, KeyE: true }));
                    activeKeys.current.add('Space');
                    activeKeys.current.add('KeyE');
                  }}
                  onPointerUp={() => {
                    setUiKeys((p) => ({ ...p, KeyE: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyE');
                  }}
                  onPointerLeave={() => {
                    setUiKeys((p) => ({ ...p, KeyE: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyE');
                  }}
                  className={`rounded py-1.5 text-xs select-none transition-all duration-100 ${
                    uiKeys['KeyE']
                      ? 'bg-blue-600 scale-90 shadow-inner'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ▲
                </button>
                <button
                  onPointerDown={() => {
                    setUiKeys((p) => ({ ...p, KeyD: true }));
                    activeKeys.current.add('Space');
                    activeKeys.current.add('KeyD');
                  }}
                  onPointerUp={() => {
                    setUiKeys((p) => ({ ...p, KeyD: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyD');
                  }}
                  onPointerLeave={() => {
                    setUiKeys((p) => ({ ...p, KeyD: false }));
                    activeKeys.current.delete('Space');
                    activeKeys.current.delete('KeyD');
                  }}
                  className={`rounded py-1.5 text-xs select-none transition-all duration-100 ${
                    uiKeys['KeyD']
                      ? 'bg-blue-600 scale-90 shadow-inner'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          <div
            className={`p-2 rounded border text-center transition-colors flex-shrink-0 ${
              isTripUI ? 'bg-red-900 border-red-500' : 'bg-gray-800 border-gray-700'
            }`}
          >
            <h2 className="text-[0.55rem] text-gray-400 uppercase tracking-wider">
              Status Reaktor
            </h2>
            <div
              className={`text-xl font-black tracking-widest ${
                isTripUI
                  ? 'text-red-500'
                  : statusReaktor === 'CRITICAL'
                  ? 'text-emerald-400'
                  : 'text-gray-500'
              }`}
            >
              {statusReaktor}
            </div>
          </div>

          <div className="flex-1 bg-black rounded border border-gray-700 p-2 flex flex-col relative min-h-0">
            {/* HEADER DAYA AKTUAL + HOTSPOT RUMUS */}
            <div className="flex justify-between items-center mb-1 border-b border-gray-800 pb-1 flex-shrink-0">
              <h2 className="text-[0.65rem] font-bold text-cyan-400">
                Daya Aktual
              </h2>

              <div className="relative group cursor-help z-50">
                <span className="bg-gray-800 text-cyan-300 rounded-full w-4 h-4 flex items-center justify-center text-[0.55rem] font-bold border border-cyan-800 hover:bg-cyan-600 hover:text-white transition">
                  ?
                </span>
                <div className="hidden group-hover:block absolute right-0 bottom-full mb-2 w-56 bg-gray-900 border border-cyan-500 p-3 rounded-lg shadow-2xl text-left">
                  <h3 className="text-cyan-400 font-bold text-[0.65rem] mb-1">
                    Perhitungan Daya (P)
                  </h3>
                  <p className="text-[0.55rem] text-gray-300 mb-1">
                    Representasi energi termal yang dihasilkan oleh reaksi fisi
                    berantai.
                  </p>
                  <div className="bg-black p-1.5 rounded border border-gray-700 font-mono text-[0.6rem] text-emerald-300 mb-1">
                    P(t) = P(0) × n(t)
                  </div>
                  <p className="text-[0.55rem] text-gray-400">
                    <strong className="text-gray-300">P(0)</strong> = Daya
                    Nominal (100kW)
                    <br />
                    <strong className="text-gray-300">n(t)</strong> = Daya
                    relatif dari integrasi pers. differensial Point Kinetics.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <span
                className={`text-4xl font-mono font-bold ${
                  isTripUI ? 'text-red-500' : 'text-cyan-400'
                }`}
              >
                {formatDayaText(simData.dayaWatt)}{' '}
                <span className="text-sm text-gray-500">W</span>
              </span>
              <span className="text-[0.55rem] text-gray-500 mt-2 font-mono">
                Reaktivitas (ρ): {simData.reaktivitas.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}