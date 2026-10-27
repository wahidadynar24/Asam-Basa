import React, { useState, useMemo } from 'react';
import { SOLUTIONS_DATA } from '../data/solutionsData';
import { calculateSolution, formatScientific } from '../utils/chemistry';
import PHScaleBar from '../components/PHScaleBar';
import IonVisualizer from '../components/IonVisualizer';
import NavigationButtons from '../components/NavigationButtons';

export default function Explore({ onPrev, onNext, onExploreRecord }) {
  const [selectedSolutionKey, setSelectedSolutionKey] = useState('HCl');
  const [concentration, setConcentration] = useState(0.1);

  const activeSolution = SOLUTIONS_DATA[selectedSolutionKey];

  // Hitung parameter larutan secara dinamis
  const calculation = useMemo(() => {
    const calc = calculateSolution(selectedSolutionKey, concentration);
    if (onExploreRecord) {
      onExploreRecord(selectedSolutionKey, calc);
    }
    return calc;
  }, [selectedSolutionKey, concentration]);

  // Handler ganti larutan
  const handleSelectSolution = (key) => {
    setSelectedSolutionKey(key);
    if (key === 'H2O') {
      setConcentration(1.0);
    } else if (concentration === 1.0 && key !== 'H2O') {
      setConcentration(0.1);
    }
  };

  return (
    <div className="page-container page-explore">
      {/* Header Tahap Explore */}
      <div className="stage-header">
        <span className="stage-pill pill-explore">Tahap 2: Explore (Eksplorasi)</span>
        <h2 className="stage-title">Laboratorium Virtual &amp; Simulasi pH Larutan</h2>
        <p className="stage-lead">
          Pilih larutan uji, geser konsentrasi larutan, dan amati secara langsung bagaimana perubahan nilai <strong>pH</strong>, <strong>pOH</strong>, serta sebaran mikroskopis ion <strong>H⁺</strong> dan <strong>OH⁻</strong>.
        </p>
      </div>

      {/* Kontrol Utama: Pemilihan Larutan */}
      <section className="explore-control-card">
        <div className="control-section-header">
          <span className="control-label">1. Pilih Larutan Uji:</span>
        </div>
        <div className="solution-selector-grid">
          {Object.values(SOLUTIONS_DATA).map((sol) => {
            const isSelected = sol.id === selectedSolutionKey;
            return (
              <button
                key={sol.id}
                type="button"
                className={`solution-card-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectSolution(sol.id)}
              >
                <div className="sol-formula">{sol.formula}</div>
                <div className="sol-name">{sol.name}</div>
                <span className={`sol-type-badge type-${sol.category}`}>{sol.type}</span>
              </button>
            );
          })}
        </div>

        {/* Kontrol Slider Konsentrasi */}
        <div className="concentration-control-box">
          <div className="conc-header">
            <span className="control-label">2. Atur Konsentrasi Molaritas Larutan [M]:</span>
            <div className="conc-display">
              <span className="conc-val">{concentration.toFixed(3)} M</span>
            </div>
          </div>

          <div className="slider-wrapper">
            <input
              type="range"
              min="0.001"
              max="1.0"
              step="0.005"
              value={concentration}
              disabled={activeSolution.isFixedConc}
              onChange={(e) => setConcentration(parseFloat(e.target.value))}
              className="conc-range-slider"
            />
            <div className="slider-labels">
              <span>0,001 M (Encer)</span>
              <span>0,100 M (Sedang)</span>
              <span>1,000 M (Pekat)</span>
            </div>
          </div>

          {/* Tombol Preset Cepat */}
          {!activeSolution.isFixedConc ? (
            <div className="preset-buttons">
              <span className="preset-label">Preset Cepat:</span>
              {[0.001, 0.01, 0.05, 0.1, 0.5, 1.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`btn-preset ${Math.abs(concentration - val) < 0.001 ? 'active' : ''}`}
                  onClick={() => setConcentration(val)}
                >
                  {val} M
                </button>
              ))}
            </div>
          ) : (
            <div className="fixed-conc-notice">
              ℹ️ Air murni (H₂O) merupakan pelarut murni dengan konsentrasi autoionisasi konstan (Kw = 1,0 × 10⁻¹⁴).
            </div>
          )}
        </div>
      </section>

      {/* Grid Dashboard Hasil Perhitungan Dinamis */}
      <section className="simulation-dashboard">
        {/* 4 Kartu Parameter Kunci */}
        <div className="metrics-grid">
          {/* Card pH */}
          <div className="metric-card metric-ph">
            <div className="metric-header">
              <span className="metric-title">Derajat Keasaman</span>
              <span className="metric-symbol">pH</span>
            </div>
            <div className="metric-main-value" style={{ color: calculation.colorHex }}>
              {calculation.pH.toFixed(2)}
            </div>
            <div className="metric-subtext">
              Rumus: <code>-log [H⁺]</code>
            </div>
          </div>

          {/* Card pOH */}
          <div className="metric-card metric-poh">
            <div className="metric-header">
              <span className="metric-title">Derajat Kebasaan</span>
              <span className="metric-symbol">pOH</span>
            </div>
            <div className="metric-main-value">
              {calculation.pOH.toFixed(2)}
            </div>
            <div className="metric-subtext">
              Rumus: <code>14 - pH</code>
            </div>
          </div>

          {/* Card [H+] */}
          <div className="metric-card metric-h">
            <div className="metric-header">
              <span className="metric-title">Konsentrasi Ion Hidrogen</span>
              <span className="metric-symbol">[H⁺]</span>
            </div>
            <div className="metric-sci-value">
              {formatScientific(calculation.H_conc)}
            </div>
            <div className="metric-subtext">
              {calculation.H_conc > 1e-7 ? 'Dominan Asam' : calculation.H_conc < 1e-7 ? 'Minoritas' : 'Seimbang'}
            </div>
          </div>

          {/* Card [OH-] */}
          <div className="metric-card metric-oh">
            <div className="metric-header">
              <span className="metric-title">Konsentrasi Ion Hidroksida</span>
              <span className="metric-symbol">[OH⁻]</span>
            </div>
            <div className="metric-sci-value">
              {formatScientific(calculation.OH_conc)}
            </div>
            <div className="metric-subtext">
              {calculation.OH_conc > 1e-7 ? 'Dominan Basa' : calculation.OH_conc < 1e-7 ? 'Minoritas' : 'Seimbang'}
            </div>
          </div>
        </div>

        {/* Skala pH Bar */}
        <PHScaleBar currentPH={calculation.pH} />

        {/* Visualisasi Beaker & Ion Mikroskopis */}
        <div className="lab-stage-layout">
          <IonVisualizer solution={activeSolution} calculation={calculation} />

          {/* Kartu Reaksi Kimia & Analisis Singkat */}
          <div className="chemical-info-card">
            <div className="info-card-header">
              <span className="info-icon">🧪</span>
              <div>
                <span className="info-tag">{activeSolution.type}</span>
                <h4 className="info-title">{activeSolution.name} ({activeSolution.formula})</h4>
              </div>
            </div>

            <div className="equation-box">
              <span className="equation-label">Persamaan Reaksi Ionisasi:</span>
              <div className="equation-code">{activeSolution.reaction}</div>
            </div>

            <div className="property-summary">
              <div className="prop-row">
                <span className="prop-key">Sifat Larutan:</span>
                <span className="prop-val font-bold" style={{ color: calculation.categoryColor }}>
                  {calculation.nature}
                </span>
              </div>
              <div className="prop-row">
                <span className="prop-key">Derajat Ionisasi (α):</span>
                <span className="prop-val">
                  {calculation.alpha >= 1.0 ? '1,0 (100% sempurna)' : (calculation.alpha * 100).toFixed(2) + '% (sebagian)'}
                </span>
              </div>
              <div className="prop-row">
                <span className="prop-key">Penerapan Sehari-hari:</span>
                <span className="prop-val">{activeSolution.commonUse}</span>
              </div>
            </div>

            <div className="guiding-observation-box">
              <h5>🔎 Amati Hubungan Penting Ini:</h5>
              <ul className="observation-bullets">
                <li>
                  Saat konsentrasi <strong>{activeSolution.formula}</strong> dinaikkan, perhatikan arah pergeseran nilai pH dan pOH.
                </li>
                <li>
                  Perhatikan bahwa selalu berlaku: <code>pH + pOH = 14,00</code> pada semua kondisi!
                </li>
                {activeSolution.id === 'CH3COOH' && (
                  <li>
                    Bandingkan CH₃COOH 0,1 M (pH ~2,87) dengan HCl 0,1 M (pH 1,00). Mengapa berbeda padahal konsentrasinya sama? Kita akan bahas di tahap Explain!
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Navigasi */}
      <NavigationButtons
        onPrev={onPrev}
        onNext={onNext}
        prevLabel="Kembali ke Engage"
        nextLabel="Lanjut ke Explain"
        nextSubtext="Tahap berikutnya: Mempelajari teori Arrhenius, Brønsted-Lowry, Lewis, dan rumus perhitungan."
      />
    </div>
  );
}
