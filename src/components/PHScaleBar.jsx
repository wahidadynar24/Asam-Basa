import React from 'react';
import { getPHColor } from '../utils/chemistry';

const SCALE_POINTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export default function PHScaleBar({ currentPH = 7.0 }) {
  const percentage = Math.max(0, Math.min(100, (currentPH / 14) * 100));
  const currentColor = getPHColor(currentPH);

  let categoryLabel = 'Netral';
  if (currentPH < 3.5) categoryLabel = 'Asam Kuat';
  else if (currentPH < 6.8) categoryLabel = 'Asam Lemah';
  else if (currentPH <= 7.2) categoryLabel = 'Netral';
  else if (currentPH <= 10.5) categoryLabel = 'Basa Lemah';
  else categoryLabel = 'Basa Kuat';

  return (
    <div className="ph-scale-wrapper">
      <div className="ph-scale-header">
        <span className="scale-title">Indikator Skala pH Universal</span>
        <div className="ph-badge" style={{ backgroundColor: currentColor }}>
          <span className="ph-badge-num">pH {currentPH.toFixed(2)}</span>
          <span className="ph-badge-cat">({categoryLabel})</span>
        </div>
      </div>

      <div className="ph-track-container">
        {/* Pointer jarum penunjuk pH */}
        <div 
          className="ph-needle" 
          style={{ left: `${percentage}%`, borderColor: currentColor }}
        >
          <div className="needle-arrow" style={{ borderTopColor: currentColor }}></div>
          <div className="needle-dot" style={{ backgroundColor: currentColor }}></div>
        </div>

        {/* Bar gradien spektrum indikator universal */}
        <div className="ph-bar-gradient">
          {SCALE_POINTS.map((val) => (
            <div key={val} className="ph-bar-segment" style={{ backgroundColor: getPHColor(val) }}></div>
          ))}
        </div>

        {/* Angka skala 0-14 */}
        <div className="ph-numbers">
          {SCALE_POINTS.map((val) => (
            <span 
              key={val} 
              className={`ph-tick-num ${Math.round(currentPH) === val ? 'highlight' : ''}`}
            >
              {val}
            </span>
          ))}
        </div>
      </div>

      {/* Zona Keterangan */}
      <div className="ph-zones">
        <div className="zone-tag zone-acid">0 – 6: Daerah Asam ([H⁺] &gt; [OH⁻])</div>
        <div className="zone-tag zone-neutral">7: Netral ([H⁺] = [OH⁻])</div>
        <div className="zone-tag zone-base">8 – 14: Daerah Basa ([OH⁻] &gt; [H⁺])</div>
      </div>
    </div>
  );
}
