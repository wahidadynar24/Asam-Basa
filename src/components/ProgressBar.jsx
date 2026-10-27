import React from 'react';

const STEPS = [
  { id: 1, label: 'Engage', title: 'Fenomena & Pemantik', icon: '🔍' },
  { id: 2, label: 'Explore', title: 'Simulasi Lab pH', icon: '⚗️' },
  { id: 3, label: 'Explain', title: 'Konsep & Teori', icon: '📖' },
  { id: 4, label: 'Elaborate', title: 'Aplikasi Kontekstual', icon: '🌍' },
  { id: 5, label: 'Evaluate', title: 'Kuis Evaluasi', icon: '✍️' },
  { id: 6, label: 'Refleksi & Hasil', title: 'Capaian Belajar', icon: '🏆' },
];

export default function ProgressBar({ currentStep, setStep, completedSteps }) {
  if (currentStep === 0) return null; // Sembunyikan di halaman Home pembuka

  // Hitung persentase progress
  const progressPercent = Math.min(100, Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100));

  return (
    <div className="stepper-wrapper">
      <div className="stepper-container">
        <div className="stepper-track">
          <div 
            className="stepper-track-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="stepper-steps">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id) || currentStep > step.id;
            const isActive = currentStep === step.id;
            const isClickable = isCompleted || step.id <= Math.max(1, ...completedSteps, currentStep);

            return (
              <button
                key={step.id}
                type="button"
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => isClickable && setStep(step.id)}
                disabled={!isClickable}
                title={`${step.label}: ${step.title}`}
              >
                <div className="step-circle">
                  {isCompleted ? (
                    <span className="step-check">✓</span>
                  ) : (
                    <span className="step-number">{step.id}</span>
                  )}
                </div>
                <div className="step-info">
                  <span className="step-name">{step.label}</span>
                  <span className="step-desc-short">{step.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
