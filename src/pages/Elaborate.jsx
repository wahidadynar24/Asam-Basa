import React, { useState } from 'react';
import { ELABORATE_CASES } from '../data/elaborateData';
import NavigationButtons from '../components/NavigationButtons';

export default function Elaborate({ onPrev, onNext, elaborateProgress, setElaborateProgress }) {
  const [activeCase, setActiveCase] = useState('beverages');

  // State untuk Kasus 1: Minuman
  const [beverageAnswer, setBeverageAnswer] = useState(elaborateProgress?.beverageAnswer || null);
  const [showBeverageFeedback, setShowBeverageFeedback] = useState(Boolean(elaborateProgress?.beverageAnswer));

  // State untuk Kasus 2: Game Klasifikasi
  const [categorizedItems, setCategorizedItems] = useState(elaborateProgress?.categorizedItems || {});
  const [selectedSubstanceId, setSelectedSubstanceId] = useState(null);

  // State untuk Kasus 3: Pengasaman Laut
  const [oceanAnswer, setOceanAnswer] = useState(elaborateProgress?.oceanAnswer || null);
  const [showOceanFeedback, setShowOceanFeedback] = useState(Boolean(elaborateProgress?.oceanAnswer));

  // Handler Kasus 1
  const handleAnswerBeverage = (optId) => {
    setBeverageAnswer(optId);
    setShowBeverageFeedback(true);
    setElaborateProgress((prev) => ({
      ...prev,
      beverageAnswer: optId,
      beveragePassed: optId === 'a'
    }));
  };

  // Handler Kasus 2: Klasifikasi Produk Rumah Tangga
  const handleAssignCategory = (substanceId, category) => {
    const updated = { ...categorizedItems, [substanceId]: category };
    setCategorizedItems(updated);
    setSelectedSubstanceId(null);

    // Cek apakah semua selesai
    const total = ELABORATE_CASES.classificationGame.substances.length;
    const answeredCount = Object.keys(updated).length;
    let correctCount = 0;
    ELABORATE_CASES.classificationGame.substances.forEach((sub) => {
      if (updated[sub.id] === sub.correctCategory) correctCount++;
    });

    setElaborateProgress((prev) => ({
      ...prev,
      categorizedItems: updated,
      classificationScore: `${correctCount}/${total}`,
      classificationComplete: answeredCount === total
    }));
  };

  // Handler Kasus 3
  const handleAnswerOcean = (optId) => {
    setOceanAnswer(optId);
    setShowOceanFeedback(true);
    setElaborateProgress((prev) => ({
      ...prev,
      oceanAnswer: optId,
      oceanPassed: optId === 'opt1'
    }));
  };

  return (
    <div className="page-container page-elaborate">
      {/* Header Tahap Elaborate */}
      <div className="stage-header">
        <span className="stage-pill pill-elaborate">Tahap 4: Elaborate (Penerapan Kontekstual)</span>
        <h2 className="stage-title">Menerapkan Konsep pada Fenomena Nyata</h2>
        <p className="stage-lead">
          Gunakan konsep kekuatan asam-basa, nilai pH, dan transfer ion yang telah kamu pelajari untuk memecahkan 3 tantangan permasalahan kontekstual di bawah ini.
        </p>
      </div>

      {/* Navigasi 3 Kasus Kontekstual */}
      <div className="elaborate-case-selector">
        <button
          type="button"
          className={`case-nav-btn ${activeCase === 'beverages' ? 'active' : ''}`}
          onClick={() => setActiveCase('beverages')}
        >
          <span className="case-icon">🥤</span>
          <span className="case-name">1. Keasaman Minuman</span>
          {elaborateProgress?.beveragePassed && <span className="case-done-badge">✓</span>}
        </button>

        <button
          type="button"
          className={`case-nav-btn ${activeCase === 'classification' ? 'active' : ''}`}
          onClick={() => setActiveCase('classification')}
        >
          <span className="case-icon">🧼</span>
          <span className="case-name">2. Klasifikasi Rumah Tangga</span>
          {elaborateProgress?.classificationComplete && <span className="case-done-badge">✓</span>}
        </button>

        <button
          type="button"
          className={`case-nav-btn ${activeCase === 'ocean' ? 'active' : ''}`}
          onClick={() => setActiveCase('ocean')}
        >
          <span className="case-icon">🌊</span>
          <span className="case-name">3. Pengasaman Laut</span>
          {elaborateProgress?.oceanPassed && <span className="case-done-badge">✓</span>}
        </button>
      </div>

      {/* Konten Kasus Aktif */}
      <div className="case-content-wrapper">
        {/* KASUS 1: MINUMAN & KESEHATAN GIGI */}
        {activeCase === 'beverages' && (
          <div className="case-card fade-in">
            <div className="case-header">
              <div className="case-badge-pill">Kasus 1</div>
              <h3>{ELABORATE_CASES.beverages.title}</h3>
              <p>{ELABORATE_CASES.beverages.intro}</p>
            </div>

            {/* Visualisasi Bar Keasaman Minuman */}
            <div className="beverage-list">
              {ELABORATE_CASES.beverages.items.map((bev) => (
                <div key={bev.id} className="beverage-item-row">
                  <div className="bev-info-col">
                    <span className="bev-name">{bev.name}</span>
                    <span className="bev-acid-type">Kandungan: {bev.acidType}</span>
                  </div>

                  <div className="bev-ph-bar-col">
                    <div className="bev-bar-track">
                      <div
                        className="bev-bar-fill"
                        style={{
                          width: `${(bev.pH / 14) * 100}%`,
                          backgroundColor: bev.color
                        }}
                      />
                    </div>
                    <span className="bev-ph-num font-bold" style={{ color: bev.color }}>
                      pH {bev.pH}
                    </span>
                  </div>

                  <div className="bev-effect-col">
                    <p>{bev.effect}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pertanyaan Kasus 1 */}
            <div className="case-question-box">
              <span className="q-badge">Tantangan Analisis</span>
              <h4>{ELABORATE_CASES.beverages.question.prompt}</h4>

              <div className="case-options-group">
                {ELABORATE_CASES.beverages.question.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`case-opt-btn ${beverageAnswer === opt.id ? 'selected' : ''}`}
                    onClick={() => handleAnswerBeverage(opt.id)}
                  >
                    <span className="opt-marker">{opt.id.toUpperCase()}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>

              {showBeverageFeedback && (
                <div className={`feedback-banner ${beverageAnswer === 'a' ? 'success' : 'error'}`}>
                  <strong>{beverageAnswer === 'a' ? '🎉 Jawaban Tepat!' : '⚠️ Kurang Tepat'}</strong>
                  <p>{ELABORATE_CASES.beverages.question.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KASUS 2: GAME KLASIFIKASI PRODUK RUMAH TANGGA */}
        {activeCase === 'classification' && (
          <div className="case-card fade-in">
            <div className="case-header">
              <div className="case-badge-pill">Kasus 2: Game Edukasi</div>
              <h3>{ELABORATE_CASES.classificationGame.title}</h3>
              <p>{ELABORATE_CASES.classificationGame.intro}</p>
            </div>

            {/* Daftar Bahan yang Perlu Dikelompokkan */}
            <div className="substance-shelf">
              <span className="shelf-label">Pilih Bahan Rumah Tangga:</span>
              <div className="substance-cards-row">
                {ELABORATE_CASES.classificationGame.substances.map((sub) => {
                  const assigned = categorizedItems[sub.id];
                  const isSelected = selectedSubstanceId === sub.id;

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      className={`substance-token ${isSelected ? 'active-select' : ''} ${assigned ? 'already-assigned' : ''}`}
                      onClick={() => setSelectedSubstanceId(sub.id)}
                    >
                      <span className="token-icon">{sub.icon}</span>
                      <span className="token-name">{sub.name}</span>
                      {assigned && (
                        <span className={`token-status status-${assigned}`}>
                          {assigned === 'acid' ? 'Asam' : assigned === 'neutral' ? 'Netral' : 'Basa'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kotak Instruksi Pilihan */}
            {selectedSubstanceId && (
              <div className="assignment-prompt-box">
                <span>
                  Masukkan <strong>{ELABORATE_CASES.classificationGame.substances.find((s) => s.id === selectedSubstanceId)?.name}</strong> ke dalam kelompok:
                </span>
                <div className="bin-target-buttons">
                  <button
                    type="button"
                    className="btn-assign btn-assign-acid"
                    onClick={() => handleAssignCategory(selectedSubstanceId, 'acid')}
                  >
                    🔴 Asam (pH &lt; 7)
                  </button>
                  <button
                    type="button"
                    className="btn-assign btn-assign-neutral"
                    onClick={() => handleAssignCategory(selectedSubstanceId, 'neutral')}
                  >
                    🟢 Netral (pH = 7)
                  </button>
                  <button
                    type="button"
                    className="btn-assign btn-assign-base"
                    onClick={() => handleAssignCategory(selectedSubstanceId, 'base')}
                  >
                    🔵 Basa (pH &gt; 7)
                  </button>
                </div>
              </div>
            )}

            {/* 3 Wadah Kategori (Bins) */}
            <div className="classification-bins-grid">
              {/* Wadah Asam */}
              <div className="category-bin bin-acid">
                <div className="bin-header">
                  <span className="bin-icon">🔴</span>
                  <h4>Kelompok Asam (pH &lt; 7)</h4>
                </div>
                <div className="bin-content">
                  {ELABORATE_CASES.classificationGame.substances
                    .filter((s) => categorizedItems[s.id] === 'acid')
                    .map((item) => (
                      <div key={item.id} className="bin-item">
                        <span>{item.icon} {item.name}</span>
                        {item.correctCategory === 'acid' ? (
                          <span className="check-correct">✓ Benar</span>
                        ) : (
                          <span className="check-wrong">✗ Seharusnya {item.correctCategory}</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Wadah Netral */}
              <div className="category-bin bin-neutral">
                <div className="bin-header">
                  <span className="bin-icon">🟢</span>
                  <h4>Kelompok Netral (pH = 7)</h4>
                </div>
                <div className="bin-content">
                  {ELABORATE_CASES.classificationGame.substances
                    .filter((s) => categorizedItems[s.id] === 'neutral')
                    .map((item) => (
                      <div key={item.id} className="bin-item">
                        <span>{item.icon} {item.name}</span>
                        {item.correctCategory === 'neutral' ? (
                          <span className="check-correct">✓ Benar</span>
                        ) : (
                          <span className="check-wrong">✗ Seharusnya {item.correctCategory}</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Wadah Basa */}
              <div className="category-bin bin-base">
                <div className="bin-header">
                  <span className="bin-icon">🔵</span>
                  <h4>Kelompok Basa (pH &gt; 7)</h4>
                </div>
                <div className="bin-content">
                  {ELABORATE_CASES.classificationGame.substances
                    .filter((s) => categorizedItems[s.id] === 'base')
                    .map((item) => (
                      <div key={item.id} className="bin-item">
                        <span>{item.icon} {item.name}</span>
                        {item.correctCategory === 'base' ? (
                          <span className="check-correct">✓ Benar</span>
                        ) : (
                          <span className="check-wrong">✗ Seharusnya {item.correctCategory}</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KASUS 3: PENGASAMAN AIR LAUT */}
        {activeCase === 'ocean' && (
          <div className="case-card fade-in">
            <div className="case-header">
              <div className="case-badge-pill">Kasus 3: Isu Lingkungan Global</div>
              <h3>{ELABORATE_CASES.oceanAcidification.title}</h3>
              <p>{ELABORATE_CASES.oceanAcidification.intro}</p>
            </div>

            {/* Skema Reaksi Bertahap Pengasaman Laut */}
            <div className="ocean-steps-timeline">
              {ELABORATE_CASES.oceanAcidification.steps.map((st) => (
                <div key={st.step} className="timeline-card">
                  <div className="timeline-badge">Tahap {st.step}</div>
                  <h4>{st.title}</h4>
                  <div className="timeline-reaction">{st.reaction}</div>
                  <p>{st.desc}</p>
                </div>
              ))}
            </div>

            {/* Pertanyaan Kasus 3 */}
            <div className="case-question-box">
              <span className="q-badge">Tantangan Berpikir Kritis</span>
              <h4>{ELABORATE_CASES.oceanAcidification.question.prompt}</h4>

              <div className="case-options-group">
                {ELABORATE_CASES.oceanAcidification.question.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`case-opt-btn ${oceanAnswer === opt.id ? 'selected' : ''}`}
                    onClick={() => handleAnswerOcean(opt.id)}
                  >
                    <span className="opt-marker">➔</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>

              {showOceanFeedback && (
                <div className={`feedback-banner ${oceanAnswer === 'opt1' ? 'success' : 'error'}`}>
                  <strong>{oceanAnswer === 'opt1' ? '🎉 Analisis Sempurna!' : '⚠️ Periksa Kembali Reaksi'}</strong>
                  <p>{ELABORATE_CASES.oceanAcidification.question.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigasi */}
      <NavigationButtons
        onPrev={onPrev}
        onNext={onNext}
        prevLabel="Kembali ke Explain"
        nextLabel="Lanjut ke Evaluate"
        nextSubtext="Tahap berikutnya: Evaluasi pemahaman dengan 10 soal kuis interaktif."
      />
    </div>
  );
}
