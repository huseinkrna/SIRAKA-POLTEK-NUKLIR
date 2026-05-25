import { useRef } from 'react';

// ============================================================
// KONSTANTA FISIKA REAKTOR KARTINI (TRIGA Mark II, 100 kW)
// Referensi: BATAN / Pusat Sains dan Teknologi Akselerator, Yogyakarta
// ============================================================

// Waktu generasi neutron prompt [s]
// TRIGA Mark II ~ 40–50 µs; digunakan 45 µs sesuai literatur Kartini
const LAMBDA = 4.5e-5;

// Daya nominal Reaktor Kartini [W]
const P0 = 100_000; // 100 kW

// Sumber neutron startup (ternormalisasi terhadap P0)
// Setara dengan sumber Am-Be atau Pu-Be fisik dalam unit normalisasi
const SOURCE = 1e-10;

// ============================================================
// DATA NEUTRON TERTUNDA – 6 KELOMPOK (U-235, Keepin 1965 / IAEA)
// ============================================================
const BETA_I   = [0.000215, 0.001424, 0.001274, 0.002568, 0.000748, 0.000273];
const LAMBDA_I = [0.0124,   0.0305,   0.1115,   0.301,    1.138,    3.01   ];
const BETA     = BETA_I.reduce((a, b) => a + b, 0); // β_total ≈ 0.006502

// ============================================================
// REAKTIVITAS LEBIH TERAS (Excess Core Reactivity) [Δk/k]
// Kelebihan reaktivitas bahan bakar segar Kartini pada BOL.
// Batang kendali berfungsi mengkompensasi kelebihan ini.
// RHO_EXCESS_CORE > WORTH_TOTAL → margin padam negatif (subkritis) ✓
// ============================================================
const RHO_EXCESS_CORE = 0.0630; // ≈ 9.69 $

// ============================================================
// NILAI REAKTIVITAS TOTAL TIAP BATANG KENDALI [Δk/k]
// Berdasarkan kurva kalibrasi eksperimental Reaktor Kartini.
// Margin padam = RHO_EXCESS_CORE − (SAFE + SHIM + REG)
//              = 0.0630 − 0.0720 = −0.0090 Δk/k  (≈ −1.38 $)  ✓
// ============================================================
const WORTH_SAFE = 0.0350; // Batang Pengaman   ≈ 5.38 $
const WORTH_SHIM = 0.0280; // Batang Kompensasi ≈ 4.31 $
const WORTH_REG  = 0.0090; // Batang Pengatur   ≈ 1.38 $

// ============================================================
// POLINOM REAKTIVITAS DIFERENSIAL BATANG KENDALI
//
//   h0(xn) = dρ/dxn  [a.u.]
//
// Derajat 5, hasil fit kurva kalibrasi eksperimental Reaktor Kartini.
// xn = kedalaman insersi ternormalisasi ∈ [0, 1]:
//   xn = 0  →  batang sepenuhnya KELUAR  (absorpsi nol)
//   xn = 1  →  batang sepenuhnya MASUK   (absorpsi maksimum)
//
// CATATAN: Fungsi ini adalah DIFERENSIAL (dρ/dxn), bukan reaktivitas
// total. Untuk mendapat reaktivitas total pada posisi xn, gunakan
// integrasi → lihat integrateH0() di bawah.
// ============================================================
function h0(xn) {
  const x = Math.max(0, Math.min(1, xn));
  return (
    -129.16 * x ** 5 +
     279.95 * x ** 4 -
     215.04 * x ** 3 +
      58.294 * x ** 2 +
       1.3702 * x
    - 0.0029
  );
}

// ============================================================
// INTEGRAL REAKTIVITAS BATANG (antiturunan analitik dari h0)
//
//   H(xn) = ∫₀^xn h0(t) dt
//
// Memberikan REAKTIVITAS TOTAL yang diserap pada kedalaman insersi xn.
// Digunakan (bukan h0 langsung) untuk menghitung reaktivitas batang. ← PERBAIKAN UTAMA
// ============================================================
function integrateH0(xn) {
  const x = Math.max(0, Math.min(1, xn));
  return (
    (-129.16 / 6)  * x ** 6 +
     (279.95 / 5)  * x ** 5 +
    (-215.04 / 4)  * x ** 4 +
     ( 58.294 / 3) * x ** 3 +
     (  1.3702 / 2) * x ** 2 +
      (-0.0029)     * x
  );
}

// H_TOTAL = H(1) = ∫₀¹ h0(x) dx ≈ 0.8165
// Faktor normalisasi bentuk kurva reaktivitas (polinom tidak ternormalisasi)
const H_TOTAL = integrateH0(1.0);

// ============================================================
// REAKTIVITAS BERSIH TOTAL DARI 3 BATANG KENDALI
//
//   ρ_net = ρ_kelebihan_teras  −  Σ absorpsi_batang_i
//
// Konvensi posisi UI (0–100 %):
//   0%   → batang MASUK penuh  (xn_insersi = 1, absorpsi maksimum)
//   100% → batang KELUAR penuh (xn_insersi = 0, absorpsi nol)
//
// Interpretasi ρ_net:
//   ρ < 0   →  subkritis  (k_eff < 1, daya turun)
//   ρ = 0   →  kritis     (k_eff = 1, daya stabil)
//   0 < ρ < β → superkritis tertunda (daya naik terkontrol)
//   ρ ≥ β   →  superkritis prompt    (BAHAYA – prompt critical)
// ============================================================
function calculateRho(safe_pct, shim_pct, reg_pct) {
  // Ubah posisi UI [0,1] → kedalaman insersi [1,0]
  const xn_safe = 1 - safe_pct;
  const xn_shim = 1 - shim_pct;
  const xn_reg  = 1 - reg_pct;

  const absorb_safe = WORTH_SAFE * integrateH0(xn_safe) / H_TOTAL;
  const absorb_shim = WORTH_SHIM * integrateH0(xn_shim) / H_TOTAL;
  const absorb_reg  = WORTH_REG  * integrateH0(xn_reg)  / H_TOTAL;

  return RHO_EXCESS_CORE - absorb_safe - absorb_shim - absorb_reg;
}

// ============================================================
// HOOK UTAMA: useReactorPhysics
// ============================================================
export const useReactorPhysics = () => {

  // --- Kondisi shutdown (semua batang masuk penuh) ---
  // ρ_shutdown = 0.0630 − 0.0350 − 0.0280 − 0.0090 = −0.0090 Δk/k
  const RHO_SHUTDOWN = RHO_EXCESS_CORE - WORTH_SAFE - WORTH_SHIM - WORTH_REG;

  // Populasi neutron awal dari multiplikasi sumber (steady-state subkritis):
  //   n₀ · |ρ_shutdown| / Λ = SOURCE  →  n₀ = SOURCE · Λ / |ρ_shutdown|
  const N_INIT = (SOURCE * LAMBDA) / Math.abs(RHO_SHUTDOWN);

  function buildInitState(n) {
    return {
      n,
      // Konsentrasi prekursor pada kondisi tunak: Cᵢ = (βᵢ / λᵢΛ) · n
      C: BETA_I.map((bi, i) => (bi / (LAMBDA_I[i] * LAMBDA)) * n),
      time: 0
    };
  }

  const physicsState = useRef(buildInitState(N_INIT));

  // ============================================================
  // PERSAMAAN KINETIKA TITIK (Point Kinetics Equations – PKE)
  //
  //   dn/dt  = [(ρ − β) / Λ] · n  +  Σᵢ λᵢ Cᵢ  +  S
  //   dCᵢ/dt = (βᵢ / Λ) · n  −  λᵢ Cᵢ
  //
  // Keterangan:
  //   n   – populasi neutron ternormalisasi (n = 1 → daya P₀ = 100 kW)
  //   Cᵢ  – konsentrasi prekursor kelompok i
  //   S   – laju sumber neutron eksternal (ternormalisasi)
  // ============================================================
  const reactorODE = (state, rho) => {
    const n = Math.max(state.n, 0); // populasi neutron tidak boleh negatif

    let sumLC = 0;
    for (let i = 0; i < 6; i++) sumLC += LAMBDA_I[i] * state.C[i];

    const dn = SOURCE + ((rho - BETA) / LAMBDA) * n + sumLC;
    const dC = BETA_I.map((bi, i) => (bi / LAMBDA) * n - LAMBDA_I[i] * state.C[i]);
    return { dn, dC };
  };

  // Fungsi bantu integrasi RK4
  const addState = (s, d, h) => ({
    n: s.n + d.dn * h,
    C: s.C.map((c, i) => c + d.dC[i] * h)
  });

  const combineRK4 = (s, k1, k2, k3, k4, dt) => ({
    n: s.n + (dt / 6) * (k1.dn + 2 * k2.dn + 2 * k3.dn + k4.dn),
    C: s.C.map((c, i) =>
      c + (dt / 6) * (k1.dC[i] + 2 * k2.dC[i] + 2 * k3.dC[i] + k4.dC[i])
    )
  });

  // ============================================================
  // LANGKAH SIMULASI – Integrasi Runge-Kutta Orde 4 (RK4)
  //
  // Parameter:
  //   rods    – { safe: 0–100, shim: 0–100, regulate: 0–100 } [%]
  //   dt_real – interval waktu nyata per frame [s] (default: 0.05 s)
  //
  // Setiap frame dibagi menjadi 500 sub-langkah untuk akurasi
  // numerik saat reaktivitas berubah cepat (mis. dekat prompt critical).
  // ============================================================
  const stepSimulation = (rods, dt_real = 0.05) => {
    const rho = calculateRho(rods.safe / 100, rods.shim / 100, rods.regulate / 100);
    let s = { ...physicsState.current };

    const SUB_STEPS = 500;
    const dt = dt_real / SUB_STEPS;

    for (let step = 0; step < SUB_STEPS; step++) {
      const k1 = reactorODE(s, rho);
      const k2 = reactorODE(addState(s, k1, dt / 2), rho);
      const k3 = reactorODE(addState(s, k2, dt / 2), rho);
      const k4 = reactorODE(addState(s, k3, dt), rho);
      s = combineRK4(s, k1, k2, k3, k4, dt);

      // Jaga kestabilan numerik: cegah overflow / nilai tidak valid
      if (!isFinite(s.n) || isNaN(s.n) || s.n < 0) {
        s.n = N_INIT;
      }
    }

    physicsState.current = { ...s, time: physicsState.current.time + dt_real };

    return {
      time:               physicsState.current.time,  // [s]
      dayaRelatif:        s.n,                        // n/n₀ (ternormalisasi)
      dayaWatt:           s.n * P0,                   // [W]
      reaktivitas:        rho,                        // Δk/k
      reaktivitasDolar:   rho / BETA,                 // [$]  (1 $ = β)
      reaktivitasPCM:     rho * 1e5,                  // [pcm] (1 pcm = 10⁻⁵ Δk/k)
      reaktivitasBeta:    rho / BETA,                 // alias reaktivitasDolar
      prekursor:          s.C,                        // array 6 kelompok
      isSubkritis:        rho < 0,
      isKritis:           Math.abs(rho) < 1e-5,
      isSuperKritis:      rho > 0 && rho < BETA,
      isPromptKritis:     rho >= BETA,                // ⚠ kondisi bahaya
    };
  };

  // ============================================================
  // RESET SIMULASI ke kondisi shutdown (semua batang masuk)
  // ============================================================
  const resetSimulation = () => {
    physicsState.current = buildInitState(N_INIT);
  };

  // Ekspor konstanta fisika untuk keperluan display UI
  return {
    stepSimulation,
    resetSimulation,
    constants: {
      BETA,
      LAMBDA,
      P0,
      H_TOTAL,
      WORTH_SAFE,
      WORTH_SHIM,
      WORTH_REG,
      RHO_EXCESS_CORE,
      RHO_SHUTDOWN,
      N_INIT,
    }
  };
};