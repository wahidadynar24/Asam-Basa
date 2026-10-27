import React from 'react';

export default function Home({ onStart }) {
  return (
    <div className="page-container page-home">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-badge">🔬 Modul Interaktif Kimia SMA Kelas XI</div>
        <h1 className="hero-title">
          Jelajahi Dunia <span className="highlight-acid">Asam</span> &amp; <span className="highlight-base">Basa</span> Secara Nyata
        </h1>
        <p className="hero-subtitle">
          Pahami konsep abstrak asam-basa melalui simulasi laboratorium interaktif, fenomena kehidupan sehari-hari, serta model pembelajaran <strong>5E</strong> (Engage, Explore, Explain, Elaborate, Evaluate).
        </p>

        <div className="hero-actions">
          <button type="button" className="btn-primary-large" onClick={onStart}>
            <span>Mulai Pembelajaran 5E</span>
            <span className="btn-icon">🚀</span>
          </button>
        </div>
      </section>

      {/* Target & Tujuan Pembelajaran Card */}
      <section className="learning-objectives-grid">
        <div className="objective-card">
          <div className="obj-icon">🎯</div>
          <h3>Tujuan Pembelajaran</h3>
          <ul className="obj-list">
            <li>Memahami konsep teori asam-basa (Arrhenius, Brønsted-Lowry, dan Lewis).</li>
            <li>Menganalisis hubungan matematis konsentrasi ion H⁺, OH⁻, pH, dan pOH.</li>
            <li>Membedakan asam-basa kuat vs lemah serta larutan pekat vs encer.</li>
            <li>Mengaitkan konsep kimia dengan fenomena nyata seperti pengasaman laut dan kesehatan.</li>
          </ul>
        </div>

        <div className="objective-card highlight-card">
          <div className="obj-icon">✨</div>
          <h3>Mengapa Belajar di Sini?</h3>
          <div className="feature-mini-list">
            <div className="feature-mini-item">
              <span className="mini-icon">⚗️</span>
              <div>
                <strong>Simulasi Lab Virtual</strong>
                <p>Ubah konsentrasi larutan dengan slider dan amati pergeseran ion serta warna indikator seketika.</p>
              </div>
            </div>
            <div className="feature-mini-item">
              <span className="mini-icon">🧩</span>
              <div>
                <strong>Aktivitas Interaktif</strong>
                <p>Game klasifikasi bahan rumah tangga, uji prediksi awal, dan studi kasus lingkungan.</p>
              </div>
            </div>
            <div className="feature-mini-item">
              <span className="mini-icon">📝</span>
              <div>
                <strong>Kuis &amp; Feedback Langsung</strong>
                <p>Uji pemahaman dengan 10 variasi soal dan penjelasan ilmiah lengkap.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Model 5E */}
      <section className="workflow-section">
        <h2 className="section-title text-center">Tahapan Alur Model Pembelajaran 5E</h2>
        <p className="section-desc text-center">Setiap tahap dirancang bertahap untuk membangun pemahaman yang bermakna.</p>

        <div className="roadmap-grid">
          <div className="roadmap-card">
            <div className="roadmap-number">1</div>
            <div className="roadmap-icon">🔍</div>
            <h4>Engage</h4>
            <p>Amati fenomena zat sehari-hari (lemon, soda, sabun) dan buat prediksi awalmu.</p>
          </div>

          <div className="roadmap-card">
            <div className="roadmap-number">2</div>
            <div className="roadmap-icon">⚗️</div>
            <h4>Explore</h4>
            <p>Laboratorium virtual interaktif: amati perubahan pH, pOH, ion H⁺ &amp; OH⁻ secara mikroskopis.</p>
          </div>

          <div className="roadmap-card">
            <div className="roadmap-number">3</div>
            <div className="roadmap-icon">📖</div>
            <h4>Explain</h4>
            <p>Konstruksi konsep ilmiah: teori asam-basa, kesetimbangan air, dan rumus logaritma pH.</p>
          </div>

          <div className="roadmap-card">
            <div className="roadmap-number">4</div>
            <div className="roadmap-icon">🌍</div>
            <h4>Elaborate</h4>
            <p>Terapkan ilmumu pada kasus nyata: keasaman minuman, klasifikasi produk, &amp; pengasaman laut.</p>
          </div>

          <div className="roadmap-card">
            <div className="roadmap-number">5</div>
            <div className="roadmap-icon">✍️</div>
            <h4>Evaluate</h4>
            <p>Ukur pemahamanmu lewat kuis interaktif dengan umpan balik ilmiah langsung.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
