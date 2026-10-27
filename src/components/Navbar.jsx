import React from 'react';

export default function Navbar({ currentStep, setStep, onReset }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setStep(0)} role="button" tabIndex={0}>
          <div className="brand-logo">
            <span className="logo-icon">⚗️</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">AsamBasa <span className="brand-highlight">5E</span></span>
            <span className="brand-subtitle">Kimia SMA Kelas XI</span>
          </div>
        </div>

        <div className="navbar-actions">
          <button 
            type="button" 
            className="btn-icon" 
            onClick={onReset}
            title="Reset Seluruh Kemajuan Belajar"
          >
            <span className="btn-icon-symbol">↺</span>
            <span className="btn-label-mobile-hide">Ulangi Modul</span>
          </button>
        </div>
      </div>
    </header>
  );
}
