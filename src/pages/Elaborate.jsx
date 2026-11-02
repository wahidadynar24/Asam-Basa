import React, { useState } from 'react';
import { ELABORATE_CASES } from '../data/elaborateData';
import NavigationButtons from '../components/NavigationButtons';

export default function Elaborate({ onPrev, onNext, elaborateProgress, setElaborateProgress }) {
  const [activeCase, setActiveCase] = useState('beverages');

  // State Kasus 1: Studi Kasus Naratif & Esai
  const [essayText, setEssayText] = useState(elaborateProgress?.essayText || '');
  const [isEssaySubmitted, setIsEssaySubmitted] = useState(Boolean(elaborateProgress?.essaySubmitted));

  // State Kasus 2: Game Klasifikasi
  const [categorizedItems, setCategorizedItems] = useState(elaborateProgress?.categorizedItems || {});
  const [selectedSubstanceId, setSelectedSubstanceId] = useState(null);

  // State Kasus 3: Soal Pilihan Ganda 2-Tier
  const [twoTierAnswers, setTwoTierAnswers] = useState(elaborateProgress?.twoTierAnswers || {
    tierQ1: { tier1: null, tier2: null, checked: false },
    tierQ2: { tier1: null, tier2: null, checked: false }
  });

  // Handler Kirim Jawaban Esai Kasus 1
  const handleSaveEssay = () => {
    if (!essayText.trim() || essayText.trim().length < 15) {
      alert('Mohon tuliskan uraian analisismu dengan lebih lengkap terlebih dahulu.');
      return;
    }
    setIsEssaySubmitted(true);
    setElaborateProgress((prev) => ({
      ...prev,
      essayText,
      essaySubmitted: true,
      beveragePassed: true
    }));
  };

  // Handler Kasus 2: Klasifikasi Produk Rumah Tangga
  const handleAssignCategory = (substanceId, category) => {
    const updated = { ...categorizedItems, [substanceId]: category };
    setCategorizedItems(updated);
    setSelectedSubstanceId(null);

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

  // Handler Kasus 3: Soal 2-Tier
  const handleSelectTier = (qId, tierKey, optionId) => {
    const updated = {
      ...twoTierAnswers,
      [qId]: {
        ...twoTierAnswers[qId],
        [tierKey]: optionId
      }
    };
    setTwoTierAnswers(updated);
  };

  const handleCheckTwoTier = (qId) => {
    const currentQ = twoTierAnswers[qId];
    if (!currentQ.tier1 || !currentQ.tier2) {
      alert('Harap pilih jawaban pada kedua tier (Tier 1 & Tier 2) sebelum memeriksa analisis.');
      return;
    }
    const updated = {
      ...twoTierAnswers,
      [qId]: {
        ...twoTierAnswers[qId],
        checked: true
      }
    };
    setTwoTierAnswers(updated);

    const allChecked = (qId === 'tierQ1' && updated.tierQ2?.checked) || (qId === 'tierQ2' && updated.tierQ1?.checked);
    setElaborateProgress((prev) => ({
      ...prev,
      twoTierAnswers: updated,
      oceanPassed: allChecked
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
          <span className="case-icon">🩺</span>
          <span className="case-name">1. Narasi Asam Lambung &amp; Antasida</span>
          {elaborateProgress?.beveragePassed && <span className="case-done-badge">✓</span>}
        </button>

        <button
          type="button"
          className={`case-nav-btn ${activeCase === 'classification' ? 'active' : ''}`}
          onClick={() => setActiveCase('classification')}
        >
          <span className="case-icon">🧼</span>
          <span className="case-name">2. Klasifikasi Bahan Rumah Tangga</span>
          {elaborateProgress?.classificationComplete && <span className="case-done-badge">✓</span>}
        </button>

        <button
          type="button"
          className={`case-nav-btn ${activeCase === 'ocean' ? 'active' : ''}`}
          onClick={() => setActiveCase('ocean')}
        >
          <span className="case-icon">🌊</span>
          <span className="case-name">3. Pengasaman Laut (2-Tier)</span>
          {elaborateProgress?.oceanPassed && <span className="case-done-badge">✓</span>}
        </button>
      </div>

      {/* Konten Kasus Aktif */}
      <div className="case-content-wrapper">
        {/* =========================================================================
            KASUS 1: NARASI STUDI KASUS NYATA & ANALISIS ESAI
            ========================================================================= */}
        {activeCase === 'beverages' && (
          <div className="case-card fade-in">
            <div className="case-header">
              <div className="case-badge-pill">Kasus 1: Studi Kasus Naratif &amp; Esai Ilmiah</div>
              <h3>{ELABORATE_CASES.beverages.title}</h3>
              <p>{ELABORATE_CASES.beverages.intro}</p>
            </div>

            {/* Kotak Narasi Studi Kasus Realistis */}
            <div className="narrative-case-box">
              <div className="narrative-meta">
                <span className="narrative-tag">📖 Kasus Nyata Kehidupan Siswa</span>
                <span className="narrative-patient">Subjek: {ELABORATE_CASES.beverages.narrative.patient}</span>
              </div>
              <div className="narrative-body">
                <p><strong>Kronologi Kejadian:</strong> {ELABORATE_CASES.beverages.narrative.scenario}</p>
                <div className="narrative-diagnosis-box">
                  <strong>🩺 Hasil Diagnosis &amp; Rekomendasi Dokter:</strong>
                  <p>{ELABORATE_CASES.beverages.narrative.diagnosis}</p>
                </div>
              </div>
            </div>

            {/* Data Spektrum pH Cairan Terkait */}
            <div className="beverage-list">
              <h4 className="beverage-list-title">Data Profil Derajat Keasaman (pH) Terkait Kasus:</h4>
              {ELABORATE_CASES.beverages.items.map((bev) => (
                <div key={bev.id} className="beverage-item-row">
                  <div className="bev-info-col">
                    <span className="bev-name">{bev.name}</span>
                    <span className="bev-acid-type">Kandungan Utama: {bev.acidType}</span>
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

            {/* Bagian Tantangan Analisis Esai */}
            <div className="case-essay-box">
              <div className="essay-prompt-header">
                <span className="q-badge">Tantangan Analisis Esai Mandiri</span>
                <h4>Pertanyaan Analisis:</h4>
                <div className="essay-prompt-text">
                  <p>Berdasarkan narasi studi kasus di atas, uraikan analisismu mengenai 3 hal berikut:</p>
                  <ol>
                    <li>Mengapa konsumsi minuman asam (soda dan kopi) saat perut kosong memicu rasa perih/nyeri pada lambung?</li>
                    <li>Bagaimana mekanisme reaksi kimia penetralan antasida Magnesium Hidroksida [Mg(OH)₂] terhadap kelebihan asam lambung (HCl)?</li>
                    <li>Mengapa obat antasida diformulasikan menggunakan basa lemah [seperti Mg(OH)₂] dan <strong>bukan basa kuat</strong> seperti NaOH?</li>
                  </ol>
                </div>
              </div>

              {/* Area Input Esai */}
              <div className="essay-input-wrapper">
                <label htmlFor="studentEssay" className="essay-label">
                  ✍️ <strong>Tuliskan Jawaban Analisis Esaimu di Bawah Ini:</strong>
                </label>
                <textarea
                  id="studentEssay"
                  rows="6"
                  className="essay-textarea"
                  placeholder="Ketikkan analisismu di sini secara runut (minimal 2-3 kalimat)... Contoh: Saat perut kosong, konsumsi minuman asam menaikkan konsentrasi ion H+ lambung. Antasida Mg(OH)2 bekerja dengan reaksi netralisasi..."
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                />
                
                <div className="essay-action-row">
                  <button
                    type="button"
                    className="btn-submit-essay"
                    onClick={handleSaveEssay}
                  >
                    {isEssaySubmitted ? '✓ Perbarui Jawaban Esai' : 'Kirim Jawaban Esai & Lihat Kunci Analisis ➔'}
                  </button>
                  {isEssaySubmitted && (
                    <span className="essay-saved-chip">✓ Jawaban tersimpan di sistem</span>
                  )}
                </div>
              </div>

              {/* Umpan Balik Kunci Analisis & Rubrik */}
              {isEssaySubmitted && (
                <div className="essay-model-feedback-card fade-in">
                  <div className="model-feedback-header">
                    <span className="fb-tag">Kunci Analisis Ilmiah &amp; Rubrik Mandiri</span>
                    <h4>Bandingkan Analisismu dengan Konsep Kimia Sebenarnya:</h4>
                  </div>

                  <div className="rubric-checklist">
                    <h5>📌 3 Poin Kunci yang Harus Ada dalam Analisismu:</h5>
                    <ul>
                      {ELABORATE_CASES.beverages.essayChallenge.rubricPoints.map((rubric, idx) => (
                        <li key={idx}>
                          <span className="check-bullet">✓</span>
                          <span>{rubric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="model-answer-quote">
                    <strong>Contoh Ulasan Analisis Ilmiah Lengkap:</strong>
                    <p>"{ELABORATE_CASES.beverages.essayChallenge.modelAnswer}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            KASUS 2: GAME KLASIFIKASI BAHAN RUMAH TANGGA (URUTAN DIACAK)
            ========================================================================= */}
        {activeCase === 'classification' && (
          <div className="case-card fade-in">
            <div className="case-header">
              <div className="case-badge-pill">Kasus 2: Game Klasifikasi Mandiri</div>
              <h3>{ELABORATE_CASES.classificationGame.title}</h3>
              <p>{ELABORATE_CASES.classificationGame.intro}</p>
            </div>

            {/* Rak Bahan Rumah Tangga (Urutan Diacak) */}
            <div className="substance-shelf">
              <span className="shelf-label">Pilih Bahan Rumah Tangga (Acak):</span>
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
                          <span className="check-correct">✓ Tepat</span>
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
                          <span className="check-correct">✓ Tepat</span>
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
                          <span className="check-correct">✓ Tepat</span>
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

        {/* =========================================================================
            KASUS 3: PENGASAMAN AIR LAUT (2 SOAL PILIHAN GANDA 2-TIER)
            ========================================================================= */}
        {activeCase === 'ocean' && (
          <div className="case-card fade-in">
            <div className="case-header">
              <div className="case-badge-pill">Kasus 3: Isu Lingkungan Global &amp; Soal 2-Tier</div>
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

            {/* 2 Butir Soal Diagnostik 2-Tier */}
            <div className="two-tier-container">
              {ELABORATE_CASES.oceanAcidification.twoTierQuestions.map((q, qIndex) => {
                const answerState = twoTierAnswers[q.id] || { tier1: null, tier2: null, checked: false };
                const isT1Correct = answerState.tier1 === q.tier1.correct;
                const isT2Correct = answerState.tier2 === q.tier2.correct;
                const isBothCorrect = isT1Correct && isT2Correct;

                return (
                  <div key={q.id} className="two-tier-card">
                    <div className="two-tier-card-header">
                      <span className="two-tier-num">Soal Diagnostik #{qIndex + 1}</span>
                      <h4>{q.title}</h4>
                    </div>

                    {/* TIER 1: Pertanyaan Konsep */}
                    <div className="tier-section tier-1-box">
                      <div className="tier-label-chip">Tier 1: Pertanyaan Konsep / Fenomena</div>
                      <h5 className="tier-prompt">{q.tier1.prompt}</h5>
                      <div className="tier-options-list">
                        {q.tier1.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            className={`tier-opt-btn ${answerState.tier1 === opt.id ? 'selected' : ''}`}
                            onClick={() => handleSelectTier(q.id, 'tier1', opt.id)}
                            disabled={answerState.checked}
                          >
                            <span className="tier-opt-key">{opt.id.toUpperCase()}</span>
                            <span>{opt.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* TIER 2: Alasan Ilmiah */}
                    <div className="tier-section tier-2-box">
                      <div className="tier-label-chip tier-2-chip">Tier 2: Alasan Ilmiah / Penalaran Konsep</div>
                      <h5 className="tier-prompt">{q.tier2.prompt}</h5>
                      <div className="tier-options-list">
                        {q.tier2.options.map((opt, optIdx) => (
                          <button
                            key={opt.id}
                            type="button"
                            className={`tier-opt-btn ${answerState.tier2 === opt.id ? 'selected' : ''}`}
                            onClick={() => handleSelectTier(q.id, 'tier2', opt.id)}
                            disabled={answerState.checked}
                          >
                            <span className="tier-opt-key">{optIdx + 1}</span>
                            <span>{opt.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tombol Periksa Jawaban 2-Tier */}
                    {!answerState.checked ? (
                      <div className="tier-action-row">
                        <button
                          type="button"
                          className="btn-check-tier"
                          onClick={() => handleCheckTwoTier(q.id)}
                          disabled={!answerState.tier1 || !answerState.tier2}
                        >
                          🔍 Periksa Kombinasi Jawaban 2-Tier
                        </button>
                      </div>
                    ) : (
                      <div className={`tier-feedback-card ${isBothCorrect ? 'fb-success' : 'fb-warning'} fade-in`}>
                        <div className="fb-badge-row">
                          <span className="fb-result-tag">
                            {isBothCorrect
                              ? '🎉 Paham Konsep Utuh (Tier 1 & Tier 2 Benar)'
                              : isT1Correct
                              ? '⚠️ Jawaban Konsep Benar, namun Alasan Kurang Tepat'
                              : '⚠️ Perlu Meninjau Ulang Konsep & Alasan'}
                          </span>
                        </div>
                        <p className="fb-text">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
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
