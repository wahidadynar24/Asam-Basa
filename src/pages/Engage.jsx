import React, { useState } from 'react';
import { PHENOMENA_ITEMS, ENGAGE_PROMPT_QUESTION, PREDICTION_OPTIONS } from '../data/engageData';
import NavigationButtons from '../components/NavigationButtons';

export default function Engage({ onPrev, onNext, userPrediction, setUserPrediction }) {
  const [selectedItem, setSelectedItem] = useState(PHENOMENA_ITEMS[0]);
  const [selectedOption, setSelectedOption] = useState(userPrediction?.optionId || '');
  const [customNote, setCustomNote] = useState(userPrediction?.note || '');
  const [isSaved, setIsSaved] = useState(Boolean(userPrediction?.optionId));

  const handleSavePrediction = () => {
    if (!selectedOption && !customNote.trim()) return;
    const chosen = PREDICTION_OPTIONS.find((o) => o.id === selectedOption);
    setUserPrediction({
      optionId: selectedOption,
      optionText: chosen ? chosen.text : '',
      note: customNote.trim()
    });
    setIsSaved(true);
  };

  return (
    <div className="page-container page-engage">
      {/* Header Tahap Engage */}
      <div className="stage-header">
        <span className="stage-pill pill-engage">Tahap 1: Engage (Pelibatan)</span>
        <h2 className="stage-title">Mengamati Fenomena di Sekitar Kita</h2>
        <p className="stage-lead">
          Pernahkah kamu merasakan asamnya buah lemon, segarnya minuman bersoda, atau licinnya air sabun saat mencuci tangan? Mengapa zat-zat ini memiliki sifat yang begitu berbeda?
        </p>
      </div>

      {/* Bagian 1: Galeri Fenomena Harian */}
      <section className="engage-phenomena-section">
        <h3 className="subheading">1. Amati Karakteristik 5 Zat Berikut:</h3>
        <div className="phenomena-tabs">
          {PHENOMENA_ITEMS.map((item) => {
            const isCurrent = selectedItem.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`phenomena-tab-btn ${isCurrent ? 'active' : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <span className="tab-icon">{item.icon}</span>
                <span className="tab-name">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Detail Card Fenomena yang Dipilih */}
        <div className="phenomena-detail-card">
          <div className="detail-header">
            <div className="detail-title-group">
              <span className="detail-big-icon">{selectedItem.icon}</span>
              <div>
                <h4>{selectedItem.name}</h4>
                <span className="detail-chemical">Senyawa Kunci: <strong>{selectedItem.chemical}</strong></span>
              </div>
            </div>
            <div className="detail-ph-chip">
              Rentang pH Alami: <strong>{selectedItem.approxPH}</strong>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-box">
              <span className="detail-box-label">👅 Sensasi Rasa / Rangsangan</span>
              <p>{selectedItem.taste}</p>
            </div>
            <div className="detail-box">
              <span className="detail-box-label">✋ Karakter Fisik / Sentuhan</span>
              <p>{selectedItem.feel}</p>
            </div>
          </div>

          <p className="detail-desc">{selectedItem.description}</p>
          <div className="detail-fact-bubble">
            <strong>Fakta Menarik:</strong> {selectedItem.fact}
          </div>
        </div>
      </section>

      {/* Bagian 2: Pertanyaan Pemantik & Prediksi Awal */}
      <section className="engage-question-section">
        <div className="question-bubble-card">
          <div className="question-icon-badge">❓</div>
          <div className="question-content">
            <span className="question-tag">Pertanyaan Pemantik</span>
            <h3 className="question-text">{ENGAGE_PROMPT_QUESTION}</h3>
            <p className="question-subtext">
              Buat hipotesis atau prediksimu terlebih dahulu sebelum mempelajari teorinya. Tidak perlu takut salah!
            </p>
          </div>
        </div>

        <div className="prediction-options-list">
          {PREDICTION_OPTIONS.map((opt) => (
            <label 
              key={opt.id} 
              className={`prediction-option-card ${selectedOption === opt.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="predictionOption"
                value={opt.id}
                checked={selectedOption === opt.id}
                onChange={() => {
                  setSelectedOption(opt.id);
                  setIsSaved(false);
                }}
              />
              <span className="radio-custom"></span>
              <span className="prediction-text">{opt.text}</span>
            </label>
          ))}
        </div>

        {/* Kolom Catatan Pendapat Pribadi */}
        <div className="custom-note-group">
          <label htmlFor="studentNote" className="note-label">
            ✍️ Tambahkan alasan atau dugaan pribadimu (opsional):
          </label>
          <textarea
            id="studentNote"
            rows="3"
            className="note-textarea"
            placeholder="Tuliskan apa yang kamu pikirkan mengenai penyebab rasa masam atau sifat licin sabun..."
            value={customNote}
            onChange={(e) => {
              setCustomNote(e.target.value);
              setIsSaved(false);
            }}
          />
        </div>

        {/* Tombol Simpan Prediksi */}
        <div className="save-prediction-bar">
          <button
            type="button"
            className="btn-save-prediction"
            onClick={handleSavePrediction}
            disabled={!selectedOption && !customNote.trim()}
          >
            {isSaved ? '✓ Prediksi Tersimpan' : 'Simpan Prediksi Saya'}
          </button>
          {isSaved && (
            <span className="save-success-msg">
              Prediksi kamu berhasil disimpan! Kita akan buktikan bersama pada tahap berikutnya.
            </span>
          )}
        </div>
      </section>

      {/* Tombol Navigasi */}
      <NavigationButtons
        onPrev={onPrev}
        onNext={onNext}
        prevLabel="Kembali ke Beranda"
        nextLabel="Lanjut ke Explore"
        nextSubtext="Tahap berikutnya: Eksplorasi simulasi larutan di lab virtual."
      />
    </div>
  );
}
