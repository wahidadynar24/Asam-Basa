import React, { useState } from 'react';
import { THEORY_MATERIALS } from '../data/materialsData';
import NavigationButtons from '../components/NavigationButtons';

export default function Explain({ onPrev, onNext }) {
  const [activeTab, setActiveTab] = useState('theories');

  return (
    <div className="page-container page-explain">
      {/* Header Tahap Explain */}
      <div className="stage-header">
        <span className="stage-pill pill-explain">Tahap 3: Explain (Penjelasan Konsep)</span>
        <h2 className="stage-title">Memahami Konsep Inti Asam-Basa</h2>
        <p className="stage-lead">
          Pelajari konsep ilmiah di balik hasil eksplorasi laboratorium dalam bentuk kartu ringkas, diagram visual, dan perbandingan interaktif.
        </p>
      </div>

      {/* Navigasi Tab Topik Materi */}
      <div className="explain-topic-tabs">
        {THEORY_MATERIALS.map((topic) => {
          const isActive = topic.id === activeTab;
          return (
            <button
              key={topic.id}
              type="button"
              className={`topic-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(topic.id)}
            >
              <span className="topic-tab-icon">{topic.icon}</span>
              <span className="topic-tab-title">{topic.title}</span>
            </button>
          );
        })}
      </div>

      {/* Konten Materi Sesuai Tab Aktif */}
      <div className="explain-content-area">
        {/* TOPIK 1: 3 TEORI ASAM BASA */}
        {activeTab === 'theories' && (
          <div className="explain-section fade-in">
            <div className="section-intro-box">
              <h3>Perkembangan 3 Teori Asam-Basa Kimia</h3>
              <p>
                Konsep asam-basa berkembang dari lingkup sempit (pelarut air) hingga lingkup luas (ikatan elektron). Setiap teori melengkapi teori sebelumnya:
              </p>
            </div>

            <div className="theory-cards-grid">
              {THEORY_MATERIALS[0].cards.map((card, idx) => (
                <div key={idx} className="theory-card">
                  <div className="theory-card-header">
                    <span className="theory-index">0{idx + 1}</span>
                    <div>
                      <h4 className="theory-card-title">{card.name}</h4>
                      <span className="theory-scientist">Penemu: {card.scientist}</span>
                    </div>
                  </div>

                  <div className="core-concept-pill">
                    Fokus Utama: <strong>{card.coreConcept}</strong>
                  </div>

                  <div className="definition-box acid-def">
                    <span className="def-label">🔴 Definisi Asam:</span>
                    <p>{card.acidDef}</p>
                  </div>

                  <div className="definition-box base-def">
                    <span className="def-label">🔵 Definisi Basa:</span>
                    <p>{card.baseDef}</p>
                  </div>

                  <div className="example-box">
                    <span className="example-label">Contoh Reaksi:</span>
                    <pre className="reaction-pre">{card.example}</pre>
                  </div>

                  <div className="limitation-box">
                    <span>📌 <strong>Karakteristik Kunci:</strong> {card.limitation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOPIK 2: KESETIMBANGAN AIR & KW */}
        {activeTab === 'ions_equilibrium' && (
          <div className="explain-section fade-in">
            <div className="section-intro-box">
              <h3>{THEORY_MATERIALS[1].title}</h3>
              <p>{THEORY_MATERIALS[1].summary}</p>
            </div>

            <div className="water-eq-card">
              <div className="eq-highlight">
                <span className="eq-title">Reaksi Autoionisasi Air:</span>
                <div className="eq-formula-large">{THEORY_MATERIALS[1].equation}</div>
              </div>

              <div className="points-grid">
                {THEORY_MATERIALS[1].points.map((pt, idx) => (
                  <div key={idx} className="point-card">
                    <div className="point-badge">{idx + 1}</div>
                    <div>
                      <h5 className="point-label">{pt.label}</h5>
                      <p className="point-text">{pt.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="takeaway-box">
                <strong>Prinsip Penting:</strong> Di dalam larutan berair apapun, hasil kali ion <code>[H⁺] × [OH⁻]</code> selalu sama dengan <code>1,0 × 10⁻¹⁴</code> pada suhu 25°C. Jika ion [H⁺] bertambah banyak, maka ion [OH⁻] otomatis menyusut, dan sebaliknya!
              </div>
            </div>
          </div>
        )}

        {/* TOPIK 3: RUMUS PH, POH, DAN HUBUNGANNYA */}
        {activeTab === 'ph_scale' && (
          <div className="explain-section fade-in">
            <div className="section-intro-box">
              <h3>{THEORY_MATERIALS[2].title}</h3>
              <p>
                Karena konsentrasi ion hidrogen di alam berkisar sangat luas (antara 1 M hingga 10⁻¹⁴ M), para kimiawan menggunakan skala logaritma negatif agar mudah dicatat dengan angka 0 hingga 14.
              </p>
            </div>

            <div className="formulas-grid">
              {THEORY_MATERIALS[2].formulas.map((item, idx) => (
                <div key={idx} className="formula-card">
                  <div className="formula-badge">Rumus {idx + 1}</div>
                  <h4 className="formula-card-title">{item.title}</h4>
                  <div className="formula-highlight">{item.formula}</div>
                  <p className="formula-note">{item.note}</p>
                </div>
              ))}
            </div>

            {/* Ilustrasi Logaritma Sederhana */}
            <div className="log-explanation-card">
              <h4>💡 Mengapa nilai pH turun saat [H⁺] naik?</h4>
              <p>
                Karena rumus pH menggunakan tanda minus (<code>-log</code>), maka semakin pekat ion H⁺ (misal 10⁻¹ M dibandingkan 10⁻⁴ M), nilai eksponen minusnya semakin kecil. Jadi:
              </p>
              <div className="log-examples-row">
                <div className="log-ex-item">
                  <span>[H⁺] = 10⁻¹ M (0,1 M)</span>
                  <strong>➔ pH = 1 (Sangat Asam)</strong>
                </div>
                <div className="log-ex-item">
                  <span>[H⁺] = 10⁻⁷ M</span>
                  <strong>➔ pH = 7 (Netral)</strong>
                </div>
                <div className="log-ex-item">
                  <span>[H⁺] = 10⁻¹³ M</span>
                  <strong>➔ pH = 13 (Sangat Basa)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOPIK 4: KUAT VS LEMAH VS PEKAT */}
        {activeTab === 'strength_vs_concentration' && (
          <div className="explain-section fade-in">
            <div className="section-intro-box">
              <h3>{THEORY_MATERIALS[3].title}</h3>
              <p>
                Kesalahan paling sering terjadi adalah menyamakan konsep kekuatan (asam kuat) dengan kepekatan (asam pekat). Keduanya memiliki definisi yang sama sekali berbeda!
              </p>
            </div>

            <div className="comparison-cards-grid">
              <div className="comp-card card-strength">
                <div className="comp-badge badge-strength">Kekuatan Asam / Basa</div>
                <h4>Derajat Ionisasi (α)</h4>
                <p className="comp-lead">Berapa persen molekul yang berhasil terurai menjadi ion di air.</p>
                
                <div className="comp-detail-box">
                  <strong>⚡ Asam / Basa Kuat:</strong>
                  <p>Terionisasi sempurna 100% (α = 1). Reaksi satu arah (→).</p>
                  <code>HCl → H⁺ + Cl⁻</code>
                </div>

                <div className="comp-detail-box">
                  <strong>🍃 Asam / Basa Lemah:</strong>
                  <p>Hanya terionisasi sebagian kecil (α &lt; 1, Ka atau Kb). Reaksi kesetimbangan (⇌).</p>
                  <code>CH₃COOH ⇌ H⁺ + CH₃COO⁻</code>
                </div>
              </div>

              <div className="comp-card card-concentration">
                <div className="comp-badge badge-concentration">Kepekatan (Konsentrasi)</div>
                <h4>Jumlah Zat Terlarut (Molaritas / M)</h4>
                <p className="comp-lead">Berapa banyak mol zat yang dilarutkan ke dalam 1 liter larutan.</p>

                <div className="comp-detail-box">
                  <strong>💧 Larutan Pekat:</strong>
                  <p>Banyak zat terlarut dalam sedikit pelarut (misal 5 M, 10 M).</p>
                </div>

                <div className="comp-detail-box">
                  <strong>🌊 Larutan Encer:</strong>
                  <p>Sedikit zat terlarut dalam banyak pelarut (misal 0,001 M, 0,0001 M).</p>
                </div>

                <div className="warning-callout">
                  ⚠️ <strong>Contoh Nyata:</strong> Larutan CH₃COOH 10 M adalah <em>Asam Lemah yang Pekat</em>. Sebaliknya, larutan HCl 0,0001 M adalah <em>Asam Kuat yang Encer</em>!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigasi */}
      <NavigationButtons
        onPrev={onPrev}
        onNext={onNext}
        prevLabel="Kembali ke Explore"
        nextLabel="Lanjut ke Elaborate"
        nextSubtext="Tahap berikutnya: Memecahkan 3 masalah kontekstual asam-basa dalam kehidupan nyata."
      />
    </div>
  );
}
