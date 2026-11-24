import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import { PREDICTION_OPTIONS } from '../data/engageData';
import { isFirebaseConfigured } from '../services/firebase';
import { saveQuizEvaluationRecord, saveStudentProgress } from '../services/firestoreService';
import { getUserStorageKey } from '../utils/auth';

export default function Results({
  quizScore,
  quizAnswers,
  userPrediction,
  elaborateProgress,
  completedSteps,
  currentUser,
  onReset
}) {
  const reflectionKey = getUserStorageKey(currentUser?.id, 'student_reflection');
  const attemptKey = getUserStorageKey(currentUser?.id, 'current_attempt_id');

  const [attemptId] = useState(() => {
    let id = localStorage.getItem(attemptKey);
    if (!id) {
      id = `att_${currentUser?.id || 'guest'}_${Date.now()}`;
      localStorage.setItem(attemptKey, id);
    }
    return id;
  });

  const [reflectionNote, setReflectionNote] = useState(
    () => localStorage.getItem(reflectionKey) || ''
  );
  const [reflectionSaved, setReflectionSaved] = useState(
    () => Boolean(localStorage.getItem(reflectionKey))
  );
  const [showReview, setShowReview] = useState(false);

  const handleSaveReflection = async () => {
    localStorage.setItem(reflectionKey, reflectionNote);
    setReflectionSaved(true);

    // Simpan ke Cloud Firestore jika terhubung
    if (currentUser?.id && isFirebaseConfigured()) {
      try {
        const items = QUIZ_QUESTIONS.map(q => {
          const selectedOption = quizAnswers?.[q.id] || null;
          return {
            questionId: q.id,
            selectedOption,
            isCorrect: selectedOption === q.correctAnswer
          };
        });

        await saveQuizEvaluationRecord(currentUser.id, {
          attemptId,
          questionVersion: 1,
          studentName: currentUser.name,
          studentEmail: currentUser.email,
          quizScore,
          quizAnswers,
          items,
          userPrediction,
          studentReflection: reflectionNote
        });

        await saveStudentProgress(currentUser.id, {
          userName: currentUser.name,
          userEmail: currentUser.email,
          currentStep: 6,
          completedSteps: completedSteps && completedSteps.length > 0 ? completedSteps : [1, 2, 3, 4, 5],
          quizScore,
          quizAnswers,
          userPrediction,
          elaborateProgress,
          studentReflection: reflectionNote
        });
      } catch (err) {
        console.warn('Gagal menyimpan refleksi ke Firestore:', err);
      }
    }
  };

  // Predikat Nilai
  let gradeBadge = { label: 'Perlu Latihan Lagi', class: 'grade-c', text: 'Pelajari kembali materi di tahap Explain dan coba lagi.' };
  if (quizScore >= 90) {
    gradeBadge = { label: 'Luar Biasa (Sangat Memuaskan)', class: 'grade-a', text: 'Kamu telah menguasai seluruh konsep inti asam-basa dengan sangat baik!' };
  } else if (quizScore >= 75) {
    gradeBadge = { label: 'Tuntas (Baik Sekali)', class: 'grade-b', text: 'Pemahamanmu tentang konsep asam-basa dan perhitungannya sudah tuntas.' };
  } else if (quizScore >= 60) {
    gradeBadge = { label: 'Cukup', class: 'grade-c', text: 'Kamu sudah memahami dasar-dasar konsep, namun perlu memperkuat perhitungan pH.' };
  }

  // Cari prediksi awal
  const chosenPrediction = PREDICTION_OPTIONS.find((o) => o.id === userPrediction?.optionId);

  return (
    <div className="page-container page-results">
      {/* Header Halaman Hasil */}
      <div className="stage-header">
        <span className="stage-pill pill-result">Capaian Belajar 5E</span>
        <h2 className="stage-title">Refleksi &amp; Hasil Belajar Siswa</h2>
        <p className="stage-lead">
          Selamat! Kamu telah menyelesaikan seluruh tahapan pembelajaran model 5E (Engage, Explore, Explain, Elaborate, Evaluate).
        </p>
      </div>

      {/* Banner Edukatif Mode Tamu (05-06) */}
      {currentUser?.isGuest && (
        <div className="guest-cloud-notice-card" role="status">
          <div className="notice-icon">💡</div>
          <div className="notice-content">
            <h4>Belajar dalam Mode Tamu</h4>
            <p>
              Hasil evaluasi kuis dan catatan refleksi kamu tersimpan secara lokal di peramban perangkat ini. 
              Daftar akun atau masuk kapan saja untuk menyimpan capaian belajarmu secara permanen ke Cloud dan terhubung dengan penilaian guru.
            </p>
          </div>
        </div>
      )}

      {/* Bagian Skor Kuis Utama */}
      <section className="results-hero-card">
        <div className="score-circle-wrap">
          <div className="score-big-circle">
            <span className="score-number">{quizScore}</span>
            <span className="score-max">/ 100</span>
          </div>
        </div>

        <div className="score-summary-text">
          <span className={`grade-tag ${gradeBadge.class}`}>{gradeBadge.label}</span>
          <h3>Nilai Evaluasi Pemahaman Asam-Basa</h3>
          <p>{gradeBadge.text}</p>
          <div className="results-meta-row">
            <span>✓ Soal Terjawab: {Object.keys(quizAnswers).length} dari 10</span>
            <span>🎯 Akurasi: {quizScore}%</span>
          </div>
        </div>
      </section>

      {/* Koleksi Lencana Capaian 5E (Badges) */}
      <section className="badges-section">
        <h3 className="subheading">🏆 Lencana Pembelajaran 5E yang Kamu Raih:</h3>
        <div className="badges-grid">
          <div className="badge-card unlocked">
            <div className="badge-icon">🔍</div>
            <h4>Pengamat Kritis</h4>
            <span className="badge-phase">Tahap Engage</span>
            <p>Menganalisis fenomena zat harian dan menyusun prediksi awal.</p>
          </div>

          <div className="badge-card unlocked">
            <div className="badge-icon">⚗️</div>
            <h4>Eksplorator Lab</h4>
            <span className="badge-phase">Tahap Explore</span>
            <p>Menguji larutan asam-basa, slider konsentrasi, dan skala pH.</p>
          </div>

          <div className="badge-card unlocked">
            <div className="badge-icon">📖</div>
            <h4>Konseptor Kimia</h4>
            <span className="badge-phase">Tahap Explain</span>
            <p>Memahami 3 teori asam-basa, kesetimbangan Kw, dan kekuatan larutan.</p>
          </div>

          <div className="badge-card unlocked">
            <div className="badge-icon">🌍</div>
            <h4>Pemecah Masalah</h4>
            <span className="badge-phase">Tahap Elaborate</span>
            <p>Menganalisis keasaman minuman, produk rumah tangga, dan laut.</p>
          </div>

          <div className="badge-card unlocked">
            <div className="badge-icon">🎯</div>
            <h4>Siswa Evaluatif</h4>
            <span className="badge-phase">Tahap Evaluate</span>
            <p>Menyelesaikan kuis evaluasi 10 soal kimia asam-basa.</p>
          </div>
        </div>
      </section>

      {/* Bagian Refleksi Siswa */}
      <section className="reflection-card">
        <div className="reflection-header">
          <span className="ref-icon">💭</span>
          <div>
            <h3>Refleksi Pembelajaran Bermakna</h3>
            <p>Bandingkan apa yang kamu duga di awal dengan apa yang kamu pahami sekarang.</p>
          </div>
        </div>

        <div className="reflection-comparison-grid">
          <div className="ref-col before-col">
            <span className="col-badge">Prediksi Awalmu (Saat Engage):</span>
            <div className="ref-box">
              <p className="pred-text">
                "{chosenPrediction ? chosenPrediction.text : userPrediction?.note || 'Belum memilih prediksi awal'}"
              </p>
              {userPrediction?.note && (
                <small className="student-note-echo">Catatanmu: {userPrediction.note}</small>
              )}
            </div>
          </div>

          <div className="ref-col after-col">
            <span className="col-badge">Konsep Ilmiah Sebenarnya:</span>
            <div className="ref-box">
              <p>
                Sifat asam disebabkan oleh dominasi ion <strong>H⁺</strong> (atau kemampuan mendonorkan proton/menerima PEB), sedangkan sifat basa disebabkan oleh dominasi ion <strong>OH⁻</strong> (atau kemampuan menerima proton/mendonorkan PEB). Nilai pH adalah ukuran logaritmik konsentrasi ion H⁺.
              </p>
            </div>
          </div>
        </div>

        <div className="reflection-input-group">
          <label htmlFor="refNote">
            ✍️ <strong>Apa pemahaman atau hal baru yang paling membuka wawasanmu hari ini?</strong>
          </label>
          <textarea
            id="refNote"
            rows="3"
            className="ref-textarea"
            placeholder="Contoh: Saya baru menyadari bahwa asam kuat dan asam pekat adalah dua hal yang berbeda, atau dampak keasaman laut terhadap terumbu karang..."
            value={reflectionNote}
            onChange={(e) => {
              setReflectionNote(e.target.value);
              setReflectionSaved(false);
            }}
          />
          <div className="ref-action-row">
            <button
              type="button"
              className="btn-save-ref"
              onClick={handleSaveReflection}
              disabled={!reflectionNote.trim()}
            >
              {reflectionSaved ? '✓ Refleksi Tersimpan' : 'Simpan Refleksi Saya'}
            </button>
            {reflectionSaved && (
              <span className="ref-saved-badge">
                {isFirebaseConfigured() ? '✓ Refleksi tersimpan di browser & Cloud Firebase!' : 'Refleksi tersimpan di browser!'}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Tinjauan Pembahasan Soal Kuis (Review) */}
      <section className="quiz-review-section">
        <div className="review-toggle-bar">
          <button
            type="button"
            className="btn-toggle-review"
            onClick={() => setShowReview(!showReview)}
          >
            <span>{showReview ? 'Sembunyikan Pembahasan Kuis ▲' : 'Lihat Pembahasan Lengkap 10 Soal ▼'}</span>
          </button>
        </div>

        {showReview && (
          <div className="review-list fade-in">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const ans = quizAnswers[q.id];
              const isCorrect = ans?.isCorrect;

              return (
                <div key={q.id} className={`review-card ${isCorrect ? 'card-correct' : 'card-wrong'}`}>
                  <div className="rev-header">
                    <span className="rev-num">Soal #{idx + 1} ({q.topic})</span>
                    <span className={`rev-badge ${isCorrect ? 'rev-badge-correct' : 'rev-badge-wrong'}`}>
                      {isCorrect ? '✓ Benar' : '✗ Salah'}
                    </span>
                  </div>
                  <p className="rev-question">{q.question}</p>
                  <div className="rev-detail">
                    <span className="rev-ans-label">Kunci Jawaban:</span>
                    <strong>[{q.correctAnswer.toUpperCase()}] {q.options.find((o) => o.id === q.correctAnswer)?.text}</strong>
                  </div>
                  <p className="rev-explanation">💡 <em>{q.explanation}</em></p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Tombol Aksi Akhir */}
      <div className="results-actions-bar">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.print()}
        >
          🖨️ Cetak / Simpan Ringkasan PDF
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={onReset}
        >
          ↺ Ulangi Modul Pembelajaran
        </button>
      </div>
    </div>
  );
}
