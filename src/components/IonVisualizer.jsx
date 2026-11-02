import React, { useMemo } from 'react';

export default function IonVisualizer({ solution, calculation }) {
  const { type, H_conc, OH_conc, pH, colorHex, alpha, nature } = calculation;

  // Hitung partikel visual dan jumlah teramati secara dinamis
  const { particles, countH, countOH, countMolecule } = useMemo(() => {
    const list = [];
    let hCount = 0;
    let ohCount = 0;
    let molCount = 0;

    if (type === 'HCl') {
      // Asam kuat: terurai sempurna, banyak H+ dan Cl-
      const intensity = Math.min(18, Math.max(4, Math.round(calculation.concentration * 18)));
      hCount = intensity;
      ohCount = Math.max(0, 1 - Math.floor(intensity / 6));
      for (let i = 0; i < hCount; i++) {
        list.push({ id: `h-${i}`, type: 'H+', label: 'H⁺', class: 'ion-h', animIndex: i % 4 });
        list.push({ id: `cl-${i}`, type: 'Cl-', label: 'Cl⁻', class: 'ion-cl', animIndex: (i + 1) % 4 });
      }
      if (ohCount > 0) {
        list.push({ id: 'oh-0', type: 'OH-', label: 'OH⁻', class: 'ion-oh', animIndex: 2 });
      }
    } else if (type === 'CH3COOH') {
      // Asam lemah: hanya 1-3 ion H+ dan CH3COO-, mayoritas molekul utuh CH3COOH
      const totalUnits = Math.min(14, Math.max(5, Math.round(calculation.concentration * 14)));
      hCount = Math.max(1, Math.min(3, Math.round(totalUnits * 0.18)));
      molCount = totalUnits - hCount;
      ohCount = 0;

      for (let i = 0; i < hCount; i++) {
        list.push({ id: `h-${i}`, type: 'H+', label: 'H⁺', class: 'ion-h', animIndex: i % 4 });
        list.push({ id: `act-${i}`, type: 'CH3COO-', label: 'CH₃COO⁻', class: 'ion-acetate', animIndex: (i + 2) % 4 });
      }
      for (let i = 0; i < molCount; i++) {
        list.push({ id: `mol-${i}`, type: 'CH3COOH', label: 'CH₃COOH (Utuh)', class: 'molecule-neutral', animIndex: (i + 1) % 4 });
      }
    } else if (type === 'NaOH') {
      // Basa kuat: terurai sempurna, banyak OH- dan Na+
      const intensity = Math.min(18, Math.max(4, Math.round(calculation.concentration * 18)));
      ohCount = intensity;
      hCount = Math.max(0, 1 - Math.floor(intensity / 6));
      for (let i = 0; i < ohCount; i++) {
        list.push({ id: `oh-${i}`, type: 'OH-', label: 'OH⁻', class: 'ion-oh', animIndex: i % 4 });
        list.push({ id: `na-${i}`, type: 'Na+', label: 'Na⁺', class: 'ion-na', animIndex: (i + 1) % 4 });
      }
      if (hCount > 0) {
        list.push({ id: 'h-0', type: 'H+', label: 'H⁺', class: 'ion-h', animIndex: 3 });
      }
    } else if (type === 'NH3') {
      // Basa lemah: hanya 1-3 ion OH- dan NH4+, mayoritas molekul utuh NH3
      const totalUnits = Math.min(14, Math.max(5, Math.round(calculation.concentration * 14)));
      ohCount = Math.max(1, Math.min(3, Math.round(totalUnits * 0.18)));
      molCount = totalUnits - ohCount;
      hCount = 0;

      for (let i = 0; i < ohCount; i++) {
        list.push({ id: `oh-${i}`, type: 'OH-', label: 'OH⁻', class: 'ion-oh', animIndex: i % 4 });
        list.push({ id: `nh4-${i}`, type: 'NH4+', label: 'NH₄⁺', class: 'ion-nh4', animIndex: (i + 2) % 4 });
      }
      for (let i = 0; i < molCount; i++) {
        list.push({ id: `mol-${i}`, type: 'NH3', label: 'NH₃ (Utuh)', class: 'molecule-neutral', animIndex: (i + 1) % 4 });
      }
    } else {
      // H2O murni: seimbang 1 H+ dan 1 OH- di antara banyak molekul H2O
      hCount = 1;
      ohCount = 1;
      molCount = 8;
      list.push({ id: 'h-0', type: 'H+', label: 'H⁺', class: 'ion-h', animIndex: 0 });
      list.push({ id: 'oh-0', type: 'OH-', label: 'OH⁻', class: 'ion-oh', animIndex: 2 });
      for (let i = 0; i < molCount; i++) {
        list.push({ id: `h2o-${i}`, type: 'H2O', label: 'H₂O', class: 'molecule-h2o', animIndex: (i + 1) % 4 });
      }
    }

    // Posisi acak deterministik dan variasi animasi melayang
    const mapped = list.map((item, idx) => {
      const top = 16 + ((idx * 29 + 17) % 67);
      const left = 10 + ((idx * 37 + 23) % 78);
      const delay = (idx % 8) * 0.35;
      const duration = 2.4 + (idx % 5) * 0.5;
      return { ...item, top, left, delay, duration };
    });

    return { particles: mapped, countH: hCount, countOH: ohCount, countMolecule: molCount };
  }, [type, calculation.concentration]);

  return (
    <div className="beaker-visualizer-card">
      <div className="beaker-visualizer-header">
        <div className="visualizer-title-wrap">
          <span className="visualizer-tag">Mikroskopis Larutan</span>
          <h4 className="visualizer-heading">Beaker Tabung Kimia &amp; Dinamika Ion</h4>
        </div>
        <span className="nature-badge" style={{ borderColor: colorHex, color: colorHex }}>
          {nature}
        </span>
      </div>

      {/* Monitor Dinamis Perubahan Jumlah Ion H+ dan OH- */}
      <div className="ion-count-monitor">
        <div className="ion-monitor-header">
          <span className="ion-monitor-title">📊 Perubahan Jumlah Partikel Ion Teramati:</span>
          <span className="ion-monitor-status">
            {countH > countOH ? 'Dominan H⁺ (Asam)' : countOH > countH ? 'Dominan OH⁻ (Basa)' : 'Seimbang H⁺ = OH⁻ (Netral)'}
          </span>
        </div>
        <div className="ion-bars-container">
          <div className="ion-bar-item">
            <div className="ion-bar-label">
              <span className="ion-indicator-dot dot-h"></span>
              <span className="ion-name">Ion Hidrogen (H⁺):</span>
              <strong className="ion-qty">{countH} ion partikel</strong>
            </div>
            <div className="ion-bar-track">
              <div 
                className="ion-bar-fill fill-h"
                style={{ width: `${Math.min(100, (countH / 18) * 100)}%` }}
              />
            </div>
          </div>

          <div className="ion-bar-item">
            <div className="ion-bar-label">
              <span className="ion-indicator-dot dot-oh"></span>
              <span className="ion-name">Ion Hidroksida (OH⁻):</span>
              <strong className="ion-qty">{countOH} ion partikel</strong>
            </div>
            <div className="ion-bar-track">
              <div 
                className="ion-bar-fill fill-oh"
                style={{ width: `${Math.min(100, (countOH / 18) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="beaker-stage">
        {/* Wadah Beaker Lab */}
        <div className="glass-beaker">
          {/* Garis takaran beaker */}
          <div className="beaker-ticks">
            <span className="tick">250 ml</span>
            <span className="tick">200 ml</span>
            <span className="tick">150 ml</span>
            <span className="tick">100 ml</span>
          </div>

          {/* Cairan dengan warna indikator universal */}
          <div 
            className="beaker-liquid"
            style={{ 
              backgroundColor: `${colorHex}33`,
              borderTop: `4px solid ${colorHex}`
            }}
          >
            {/* Permukaan cairan berombak */}
            <div className="liquid-wave" style={{ backgroundColor: `${colorHex}55` }}></div>

            {/* Partikel ion mikroskopis yang bergerak abstrak melayang secara dinamis */}
            {particles.map((p) => (
              <div
                key={p.id}
                className={`ion-badge ${p.class} anim-drift-${p.animIndex}`}
                style={{
                  top: `${p.top}%`,
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`
                }}
              >
                {p.label}
              </div>
            ))}
          </div>

          <div className="beaker-base-shadow"></div>
        </div>
      </div>

      {/* Legenda Partikel & Interpretasi */}
      <div className="ion-legend">
        <div className="legend-item">
          <span className="legend-dot dot-h"></span>
          <span className="legend-text">Ion H⁺ (Asam)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-oh"></span>
          <span className="legend-text">Ion OH⁻ (Basa)</span>
        </div>
        {type === 'HCl' && (
          <div className="legend-item">
            <span className="legend-dot dot-cl"></span>
            <span className="legend-text">Ion Cl⁻</span>
          </div>
        )}
        {type === 'CH3COOH' && (
          <>
            <div className="legend-item">
              <span className="legend-dot dot-acetate"></span>
              <span className="legend-text">Ion CH₃COO⁻</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-molecule"></span>
              <span className="legend-text">CH₃COOH (Molekul Utuh)</span>
            </div>
          </>
        )}
        {type === 'NaOH' && (
          <div className="legend-item">
            <span className="legend-dot dot-na"></span>
            <span className="legend-text">Ion Na⁺</span>
          </div>
        )}
        {type === 'NH3' && (
          <>
            <div className="legend-item">
              <span className="legend-dot dot-nh4"></span>
              <span className="legend-text">Ion NH₄⁺</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-molecule"></span>
              <span className="legend-text">NH₃ (Molekul Utuh)</span>
            </div>
          </>
        )}
        {type === 'H2O' && (
          <div className="legend-item">
            <span className="legend-dot dot-h2o"></span>
            <span className="legend-text">H₂O (Molekul Pelarut Air)</span>
          </div>
        )}
      </div>

      {/* Catatan Edukasi Mikroskopis */}
      <div className="ion-insight-box">
        {type === 'HCl' && (
          <p>
            💡 <strong>Asam Kuat Monoprotik:</strong> Seluruh molekul HCl terurai 100% (α = 1,0) menjadi ion H⁺ dan Cl⁻. Semakin tinggi konsentrasi, jumlah ion H⁺ bertambah pesat tanpa ada molekul HCl utuh yang tersisa!
          </p>
        )}
        {type === 'CH3COOH' && (
          <p>
            💡 <strong>Asam Lemah Monoprotik:</strong> Hanya sekitar <strong>{(alpha * 100).toFixed(2)}%</strong> molekul yang terurai menjadi ion H⁺ dan CH₃COO⁻. Meskipun konsentrasi dinaikkan, mayoritas asam asetat tetap berupa molekul utuh.
          </p>
        )}
        {type === 'NaOH' && (
          <p>
            💡 <strong>Basa Kuat Monoprotik:</strong> NaOH terdisosiasi sempurna 100% (α = 1,0) menjadi ion Na⁺ dan OH⁻. Semakin tinggi konsentrasi, jumlah ion OH⁻ meningkat tajam mendominasi larutan.
          </p>
        )}
        {type === 'NH3' && (
          <p>
            💡 <strong>Basa Lemah Monoprotik:</strong> Amonia mengikat proton dari air menghasilkan ion OH⁻ dan NH₄⁺ hanya sebagian kecil (α ≈ <strong>{(alpha * 100).toFixed(2)}%</strong>). Mayoritas amonia tetap berada dalam wujud molekul NH₃ utuh.
          </p>
        )}
        {type === 'H2O' && (
          <p>
            💡 <strong>Netralitas Air:</strong> Jumlah ion [H⁺] sama persis dengan [OH⁻] (1,0 × 10⁻⁷ M pada 25°C). Keseimbangan ion hidrogen dan hidroksida inilah yang mendefinisikan pH netral 7,00.
          </p>
        )}
      </div>
    </div>
  );
}
