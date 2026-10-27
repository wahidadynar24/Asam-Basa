import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import NavigationButtons from '../components/NavigationButtons';

export default function Evaluate({ onPrev, onComplete, quizAnswers, setQuizAnswers, quizScore, setQuizScore }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  const currentAnswer = quizAnswers[currentQuestion.id];
  const isAnswered = currentAnswer !== undefined;

  // Handler memilih jawaban
  const handleSelectAnswer = (optionId) => {
    if (isAnswered) return; // Mencegah ganti jawaban untuk evaluasi objektif

    const isCorrect = optionId === currentQuestion.correctAnswer;
    const updatedAnswers = {
      ...quizAnswers,
      [currentQuestion.id]: {
        selected: optionId,
        isCorrect
      }
    };
    setQuizAnswers(updatedAnswers);

    // Hitung ulang total skor (setiap soal bernilai 10 poin, total 100)
    let correctCount = 0;
    Object.values(updatedAnswers).forEach((ans) => {
      if (ans.isCorrect) correctCount++;
    });
    setQuizScore(correctCount * 10);
  };

  // Navigasi soal
  const handleNextQuestion = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const answeredTotal = Object.keys(quizAnswers).length;
  const isLastQuestion = currentIndex === QUIZ_QUESTIONS.length - 1;

  return (
    <div className="page-container page-evaluate">
      {/* Header Tahap Evaluate */}
      <div className="stage-header">
        <span className="stage-pill pill-evaluate">Tahap 5: Evaluate (Evaluasi Belajar)</span>
        <h2 className="stage-title">Uji Pemahaman Konsep Asam-Basa</h2>
        <p className="stage-lead">
          Jawablah 10 pertanyaan variatif di bawah ini. Umpan balik ilmiah langsung akan muncul begitu kamu memilih jawaban!
        </p>
      </div>

      {/* Bar Kemajuan Kuis */}
      <div className="quiz-progress-bar-card">
        <div className="quiz-progress-header">
          <span className="quiz-progress-text">
            Soal <strong>{currentIndex + 1}</strong> dari <strong>{QUIZ_QUESTIONS.length}</strong>
          </span>
          <span className="quiz-score-indicator">
            Skor Sementara: <strong>{quizScore}</strong> / 100
          </span>
        </div>

        {/* Dots Navigator Soal 1-10 */}
        <div className="quiz-dots-grid">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const ans = quizAnswers[q.id];
            let dotStatus = 'unanswered';
            if (ans) {
              dotStatus = ans.isCorrect ? 'correct' : 'wrong';
            }
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                className={`quiz-dot ${dotStatus} ${isCurrent ? 'current' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                title={`Pindah ke Soal ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Soal Aktif */}
      <div className="question-card fade-in">
        <div className="question-header">
          <span className="question-topic-pill">{currentQuestion.topic}</span>
          <span className="question-type-pill">
            {currentQuestion.type === 'multiple_choice' && 'Pilihan Ganda'}
            {currentQuestion.type === 'true_false' && 'Benar / Salah'}
            {currentQuestion.type === 'calculation' && 'Perhitungan pH'}
            {currentQuestion.type === 'matching' && 'Mencocokkan Teori'}
            {currentQuestion.type === 'analysis' && 'Analisis Skenario'}
          </span>
        </div>

        <h3 className="question-title-text">{currentQuestion.question}</h3>

        {/* Pilihan Jawaban */}
        <div className="options-list">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentAnswer?.selected === opt.id;
            const isThisCorrect = opt.id === currentQuestion.correctAnswer;
            
            let btnClass = 'quiz-opt-btn';
            if (isAnswered) {
              if (isThisCorrect) {
                btnClass += ' opt-correct';
              } else if (isSelected && !isThisCorrect) {
                btnClass += ' opt-wrong';
              } else {
                btnClass += ' opt-disabled';
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                className={btnClass}
                onClick={() => handleSelectAnswer(opt.id)}
                disabled={isAnswered}
              >
                <span className="opt-key">{opt.id.toUpperCase()}</span>
                <span className="opt-content">{opt.text}</span>
                {isAnswered && isThisCorrect && <span className="opt-status-icon">✓</span>}
                {isAnswered && isSelected && !isThisCorrect && <span className="opt-status-icon">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback Umpan Balik Langsung */}
        {isAnswered && (
          <div className={`quiz-feedback-box ${currentAnswer.isCorrect ? 'fb-correct' : 'fb-wrong'} fade-in`}>
            <div className="fb-header">
              <span className="fb-icon">{currentAnswer.isCorrect ? '🎉' : '💡'}</span>
              <strong>{currentAnswer.isCorrect ? 'Jawaban Benar!' : 'Jawaban Kurang Tepat'}</strong>
            </div>
            <p className="fb-explanation">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Kontrol Navigasi Antar Soal */}
        <div className="quiz-nav-row">
          <button
            type="button"
            className="btn-quiz-nav btn-quiz-prev"
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
          >
            ← Soal Sebelumnya
          </button>

          <button
            type="button"
            className="btn-quiz-nav btn-quiz-next"
            onClick={handleNextQuestion}
          >
            {isLastQuestion ? 'Selesai & Lihat Hasil ➔' : 'Soal Berikutnya →'}
          </button>
        </div>
      </div>

      {/* Navigasi Keluar Kuis */}
      <NavigationButtons
        onPrev={onPrev}
        onNext={onComplete}
        prevLabel="Kembali ke Elaborate"
        nextLabel={answeredTotal === QUIZ_QUESTIONS.length ? 'Selesai & Lihat Hasil' : 'Lanjut ke Refleksi'}
        isNextDisabled={answeredTotal < 3} // Minimal jawab 3 soal sebelum bisa lanjut ke refleksi
        nextSubtext={
          answeredTotal < QUIZ_QUESTIONS.length
            ? `Kamu telah menjawab ${answeredTotal} dari 10 soal.`
            : 'Semua soal telah selesai dikerjakan!'
        }
      />
    </div>
  );
}
