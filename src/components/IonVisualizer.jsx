import React, { useMemo } from 'react';

export default function IonVisualizer({ solution, calculation }) {
  const { type, H_conc, OH_conc, pH, colorHex, alpha, nature } = calculation;

  // Hitung jumlah partikel visual yang representatif di dalam beaker (maksimal ~36 partikel)
  const particles = useMemo(() => {
    const list = [];
    let countH = 0;
    let countOH = 0;
    let countMolecule = 0;

    if (type === 'HCl') {
      // Asam kuat: terurai sempurna, banyak H+ dan Cl-
      // Semakin pekat konsentrasi, semakin banyak ion
      const intensity = Math.min(18, Math.max(4, Math.round(calculation.concentration * 18)));
      countH = intensity;
      countOH = Math.max(0, 1 - Math.floor(intensity / 6));
      for (let i = 0; i < countH; i++) {
        list.push({ id: `h-${i}`, type: 'H+', label: 'H⁺', class: 'ion-h' });
        list.push({ id: `cl-${i}`, type: 'Cl-', label: 'Cl⁻', class: 'ion-cl' });
      }
      if (countOH > 0) {
        list.push({ id: 'oh-0', type: 'OH-', label: 'OH⁻', class: 'ion-oh' });
      }
    } else if (type === 'CH3COOH') {
      // Asam lemah: hanya sedikit H+ dan CH3COO-, mayoritas molekul utuh CH3COOH
      const totalUnits = Math.min(14, Math.max(5, Math.round(calculation.concentration * 14)));
      // Hanya 1-3 ion H+ yang terionisasi karena Ka kecil
      countH = Math.max(1, Math.min(3, Math.round(totalUnits * 0.15)));
      countMolecule = totalUnits - countH;

      for (let i = 0; i < countH; i++) {
        list.push({ id: `h-${i}`, type: 'H+', label: 'H⁺', class: 'ion-h' });
        list.push({ id: `act-${i}`, type: 'CH3COO-', label: 'CH₃COO⁻', class: 'ion-acetate' });
      }
      for (let i = 0; i < countMolecule; i++) {
        list.push({ id: `mol-${i}`, type: 'CH3COOH', label: 'CH₃COOH (Utuh)', class: 'molecule-neutral' });
      }
    } else if (type === 'NaOH') {
      // Basa kuat: terurai sempurna, banyak OH- dan Na+
      const intensity = Math.min(18, Math.max(4, Math.round(calculation.concentration * 18)));
      countOH = intensity;
      countH = Math.max(0, 1 - Math.floor(intensity / 6));
      for (let i = 0; i < countOH; i++) {
        list.push({ id: `oh-${i}`, type: 'OH-', label: 'OH⁻', class: 'ion-oh' });
        list.push({ id: `na-${i}`, type: 'Na+', label: 'Na⁺', class: 'ion-na' });
      }
      if (countH > 0) {
        list.push({ id: 'h-0', type: 'H+', label: 'H⁺', class: 'ion-h' });
      }
    } else {
      // H2O murni: hanya ada 1 H+ dan 1 OH- di antara banyak molekul H2O
      countH = 1;
      countOH = 1;
      countMolecule = 8;
      list.push({ id: 'h-0', type: 'H+', label: 'H⁺', class: 'ion-h' });
      list.push({ id: 'oh-0', type: 'OH-', label: 'OH⁻', class: 'ion-oh' });
      for (let i = 0; i < countMolecule; i++) {
        list.push({ id: `h2o-${i}`, type: 'H2O', label: 'H₂O', class: 'molecule-h2o' });
      }
    }

    // Berikan posisi acak deterministik
    return list.map((item, idx) => {
      const top = 18 + ((idx * 29 + 17) % 65);
      const left = 12 + ((idx * 37 + 23) % 76);
      const delay = (idx % 6) * 0.4;
      return { ...item, top, left, delay };
    });
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

            {/* Partikel ion mikroskopis yang melayang */}
            {particles.map((p) => (
              <div
                key={p.id}
                className={`ion-badge ${p.class}`}
                style={{
                  top: `${p.top}%`,
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`
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
        {type === 'CH3COOH' && (
          <div className="legend-item">
            <span className="legend-dot dot-molecule"></span>
            <span className="legend-text">CH₃COOH (Molekul Utuh / Belum Terionisasi)</span>
          </div>
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
            💡 <strong>Asam Kuat Monoprotik:</strong> Seluruh molekul HCl terurai 100% (α = 1,0) menjadi ion H⁺ dan Cl⁻. Tidak ada molekul HCl utuh yang tersisa di dalam larutan!
          </p>
        )}
        {type === 'CH3COOH' && (
          <p>
            💡 <strong>Asam Lemah Monoprotik:</strong> Hanya sekitar <strong>{(alpha * 100).toFixed(2)}%</strong> molekul yang terurai menjadi ion H⁺ dan CH₃COO⁻. Mayoritas molekul asam asetat tetap utuh.
          </p>
        )}
        {type === 'NaOH' && (
          <p>
            💡 <strong>Basa Kuat Monoprotik:</strong> NaOH terdisosiasi sempurna 100% (α = 1,0) menjadi ion Na⁺ dan OH⁻. Konsentrasi ion OH⁻ sangat mendominasi air.
          </p>
        )}
        {type === 'H2O' && (
          <p>
            💡 <strong>Netralitas Air:</strong> Jumlah ion [H⁺] sama persis dengan [OH⁻] (1,0 × 10⁻⁷ M pada 25°C). Keseimbangan ion inilah yang mendefinisikan pH 7,00.
          </p>
        )}
      </div>
    </div>
  );
}
