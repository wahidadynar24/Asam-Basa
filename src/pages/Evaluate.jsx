import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import NavigationButtons from '../components/NavigationButtons';

export default function Evaluate({ onPrev, onComplete, quizAnswers, setQuizAnswers, quizScore, setQuizScore }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [incompleteWarning, setIncompleteWarning] = useState('');

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  // Data jawaban yang sudah disimpan (submitted)
  const submittedAnswer = quizAnswers[currentQuestion.id];
  const answerSubmitted = submittedAnswer !== undefined;

  // selectedAnswer = jawaban yang sedang dipilih siswa (atau jawaban tersimpan jika sudah disubmit)
  const selectedAnswer = answerSubmitted
    ? submittedAnswer.selected
    : (selectedAnswers[currentQuestion.id] || null);

  // Daftar butir soal yang belum dijawab (05-05)
  const unansweredQuestionNumbers = QUIZ_QUESTIONS
    .filter((q) => !quizAnswers[q.id])
    .map((q) => q.id);

  const isAllAnswered = unansweredQuestionNumbers.length === 0;

  // Handler memilih jawaban sementara
  const handleSelectAnswer = (optionId) => {
    if (answerSubmitted) return; // Mencegah ganti jawaban jika sudah disimpan
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  // Handler tombol "Simpan Jawaban": simpan, evaluasi benar/salah, hitung skor
  const handleSubmitAnswer = () => {
    if (!selectedAnswer || answerSubmitted) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const updatedAnswers = {
      ...quizAnswers,
      [currentQuestion.id]: {
        selected: selectedAnswer,
        isCorrect,
      },
    };
    setQuizAnswers(updatedAnswers);

    // Hitung ulang total skor dari total seluruh 10 soal kuis (05-05)
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const ans = updatedAnswers[q.id];
      if (ans && ans.isCorrect) correctCount++;
    });
    setQuizScore(Math.round((correctCount / QUIZ_QUESTIONS.length) * 100));
    setIncompleteWarning('');
  };

  // Validasi kelengkapan sebelum menyelesaikan kuis (05-05)
  const handleFinishQuiz = () => {
    if (!isAllAnswered) {
      setIncompleteWarning(
        `Kuis belum lengkap! Masih terdapat ${unansweredQuestionNumbers.length} soal yang belum dijawab: Nomor ${unansweredQuestionNumbers.join(', ')}. Harap selesaikan seluruh 10 soal sebelum melihat hasil.`
      );
      return;
    }
    setIncompleteWarning('');
    onComplete();
  };

  // Navigasi soal
  const handleNextQuestion = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIncompleteWarning('');
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIncompleteWarning('');
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
          Jawablah 10 pertanyaan variatif di bawah ini. Pilih jawabanmu, klik "Simpan Jawaban", lalu simak umpan balik penjelasannya!
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
            {currentQuestion.type === 'multiple_choice' && 'Pilihan Ganda (A-E)'}
            {currentQuestion.type === 'calculation' && 'Perhitungan pH (A-E)'}
            {currentQuestion.type === 'analysis' && 'Analisis Konseptual (A-E)'}
          </span>
        </div>

        <h3 className="question-title-text">{currentQuestion.question}</h3>

        {/* Pilihan Jawaban */}
        <div className="options-list">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedAnswer === opt.id;
            const isThisCorrect = opt.id === currentQuestion.correctAnswer;
            
            let btnClass = 'quiz-opt-btn';
            if (answerSubmitted) {
              if (isThisCorrect) {
                btnClass += ' opt-correct';
              } else if (isSelected && !isThisCorrect) {
                btnClass += ' opt-wrong';
              } else {
                btnClass += ' opt-disabled';
              }
            } else if (isSelected) {
              btnClass += ' opt-selected';
            }

            return (
              <button
                key={opt.id}
                type="button"
                className={btnClass}
                onClick={() => handleSelectAnswer(opt.id)}
                disabled={answerSubmitted}
              >
                <span className="opt-key">{opt.id.toUpperCase()}</span>
                <span className="opt-content">{opt.text}</span>
                {answerSubmitted && isThisCorrect && <span className="opt-status-icon">✓</span>}
                {answerSubmitted && isSelected && !isThisCorrect && <span className="opt-status-icon">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Tombol Simpan Jawaban */}
        <div className="quiz-action-row">
          <button
            type="button"
            className={`btn-submit-quiz ${answerSubmitted ? 'saved' : ''}`}
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || answerSubmitted}
          >
            {answerSubmitted ? '✓ Jawaban Tersimpan' : 'Simpan Jawaban'}
          </button>
        </div>

        {/* Feedback Umpan Balik Setelah Jawaban Disimpan */}
        {answerSubmitted && submittedAnswer && (
          <div className={`quiz-feedback-box ${submittedAnswer.isCorrect ? 'fb-correct' : 'fb-wrong'} fade-in`}>
            <div className="fb-header">
              <span className="fb-icon">{submittedAnswer.isCorrect ? '🎉' : '💡'}</span>
              <strong>{submittedAnswer.isCorrect ? 'Jawaban Benar!' : 'Jawaban Kurang Tepat'}</strong>
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

        {/* Peringatan Kuis Belum Lengkap (05-05) */}
        {incompleteWarning && (
          <div className="quiz-incomplete-warning-box" role="alert">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text-wrap">
              <strong>Kuis Belum Lengkap!</strong>
              <p>{incompleteWarning}</p>
              {unansweredQuestionNumbers.length > 0 && (
                <button
                  type="button"
                  className="btn-jump-unanswered"
                  onClick={() => {
                    const firstIdx = QUIZ_QUESTIONS.findIndex(q => q.id === unansweredQuestionNumbers[0]);
                    if (firstIdx !== -1) {
                      setCurrentIndex(firstIdx);
                      setIncompleteWarning('');
                    }
                  }}
                >
                  Lompat ke Soal Nomor {unansweredQuestionNumbers[0]} ➔
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigasi Keluar Kuis */}
      <NavigationButtons
        onPrev={onPrev}
        onNext={handleFinishQuiz}
        prevLabel="Kembali ke Elaborate"
        nextLabel="Selesai & Lihat Capaian Belajar"
        isNextDisabled={!isAllAnswered}
        nextSubtext={
          !isAllAnswered
            ? `Kamu baru menjawab ${answeredTotal} dari ${QUIZ_QUESTIONS.length} butir soal. (Belum dijawab: No. ${unansweredQuestionNumbers.join(', ')})`
            : 'Seluruh 10 soal evaluasi tuntas dijawab!'
        }
      />
    </div>
  );
}
