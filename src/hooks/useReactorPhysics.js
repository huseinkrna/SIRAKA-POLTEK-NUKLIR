import { useRef } from 'react';

// ============================================================
// KONSTANTA FISIKA REAKTOR KARTINI (TRIGA Mark II, 100 kW)
// ============================================================
const LAMBDA = 1e-5; // Waktu generasi neutron prompt [s]
const P0 = 100000;    // Daya nominal Reaktor Kartini [W]
const SOURCE = 1e-5;  // Sumber neutron startup kecil

// DATA NEUTRON TERTUNDA – 6 KELOMPOK (U-235)
const BETA_I   = [0.000215, 0.001424, 0.001274, 0.002568, 0.000748, 0.000273];
const LAMBDA_I = [0.0124,   0.0305,   0.1115,   0.301,    1.138,    3.01   ];
const BETA     = 0.006502; // Total β

const RHO_EXCESS_CORE = 0.0060; // Baseline reaktivitas awal teras
const WORTH_REG       = 0.0090; // Nilai maksimum reaktivitas Batang Regulating

// POLINOM INTEGRAL DIFERENSIAL (Hanya untuk Batang Regulating)
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
const H_TOTAL = integrateH0(1.0);

// HITUNG REAKTIVITAS BERSIH (rho_net) - FIXED VERSION
function calculateRho(safe_pct, shim_pct, reg_pct) {
  // 1. SCRAM MUTLAK
  if (safe_pct <= 0.05) {
    return -0.0250; 
  }

  // 2. Kunci subkritis jika Shim Rod belum mencapai syarat minimum (50%)
  if (shim_pct < 0.50) {
    return -0.0100;
  }

  // Baseline dasar reaktor subkritis (saat Regulating di bawah)
  let rho_base = RHO_EXCESS_CORE - WORTH_REG; // 0.0060 - 0.0090 = -0.0030

  // Tambahan kecil jika Shim ditarik melampaui batas minimum 50%
  if (shim_pct >= 0.50) {
    rho_base += 0.0004; 
  }

  // 3. Batang Regulating (Integral Kurva S)
  const xn_reg = 1 - reg_pct;
  const absorb_reg = WORTH_REG * (integrateH0(xn_reg) / H_TOTAL);
  const rho_reg = WORTH_REG - absorb_reg; 

  // Total Reaktivitas Bersih
  return rho_base + rho_reg;
}

export const useReactorPhysics = () => {
  const RHO_SHUTDOWN = -0.0250;
  const N_INIT = (SOURCE * LAMBDA) / Math.abs(RHO_SHUTDOWN);

  const physicsState = useRef({
    n: N_INIT,
    C: BETA_I.map((bi, i) => (bi / (LAMBDA_I[i] * LAMBDA)) * N_INIT),
    time: 0
  });

  const reactorODE = (state, rho) => {
    const n = Math.max(state.n, 0);
    let sumLC = 0;
    for (let i = 0; i < 6; i++) sumLC += LAMBDA_I[i] * state.C[i];

    const dn = SOURCE + ((rho - BETA) / LAMBDA) * n + sumLC;
    const dC = BETA_I.map((bi, i) => (bi / LAMBDA) * n - LAMBDA_I[i] * state.C[i]);
    return { dn, dC };
  };

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

  const stepSimulation = (rods, dt_real = 0.05) => {
    let currentSafe = rods.safe;
    let currentShim = rods.shim;
    let currentReg  = rods.regulate;

    if (currentSafe <= 5) {
      currentSafe = 0;
      currentShim = 0;
      currentReg  = 0;
    }

    const rho = calculateRho(currentSafe / 100, currentShim / 100, currentReg / 100);
    let s = { ...physicsState.current };

    if (currentSafe === 0) {
      s.n = Math.max(N_INIT, s.n * 0.5); // Efek SCRAM melorot instan
    }

    const SUB_STEPS = 500;
    const dt = dt_real / SUB_STEPS;

    for (let step = 0; step < SUB_STEPS; step++) {
      const k1 = reactorODE(s, rho);
      const k2 = reactorODE(addState(s, k1, dt / 2), rho);
      const k3 = reactorODE(addState(s, k2, dt / 2), rho);
      const k4 = reactorODE(addState(s, k3, dt), rho);
      s = combineRK4(s, k1, k2, k3, k4, dt);

      if (!isFinite(s.n) || isNaN(s.n) || s.n < 0) {
        s.n = N_INIT;
      }
    }

    physicsState.current = { ...s, time: physicsState.current.time + dt_real };

    return {
      time:             physicsState.current.time,
      dayaRelatif:        s.n,
      dayaWatt:           s.n * P0,
      reaktivitas:        rho,
      prekursor:          s.C,
    };
  };

  const resetSimulation = () => {
    physicsState.current = {
      n: N_INIT,
      C: BETA_I.map((bi, i) => (bi / (LAMBDA_I[i] * LAMBDA)) * N_INIT),
      time: 0
    };
  };

  return { stepSimulation, resetSimulation, constants: { P0, N_INIT } };
};