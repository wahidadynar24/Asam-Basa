import React from 'react';

export default function Navbar({ _currentStep, setStep, onReset, currentUser, isCloudConnected = false, onLogout }) {
  // Ambil inisial nama pengguna untuk avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Title */}
        <div className="navbar-brand" onClick={() => setStep(0)} role="button" tabIndex={0}>
          <div className="brand-logo">
            <span className="logo-icon">⚗️</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">Chemify <span className="brand-highlight">5E</span></span>
            <span className="brand-subtitle">Media Pembelajaran Asam-Basa</span>
          </div>
        </div>

        {/* Navbar Actions: User Profile & Controls */}
        <div className="navbar-actions">
          {currentUser && (
            <div className="navbar-user-profile" title={`Login sebagai: ${currentUser.email}`}>
              <div className="user-avatar-badge">
                {getInitials(currentUser.name)}
              </div>
              <div className="user-info-text">
                <span className="user-name-display">{currentUser.name}</span>
                <div className="user-meta-tags">
                  <span className="user-role-tag">Siswa</span>
                  <span 
                    className={`cloud-status-tag ${isCloudConnected ? 'connected' : 'offline'}`}
                    title={isCloudConnected ? 'Tersinkron ke Firebase Cloud' : 'Mode Penyimpanan Lokal'}
                  >
                    {isCloudConnected ? '☁️ Cloud' : '💾 Lokal'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tombol Reset Modul */}
          <button 
            type="button" 
            className="btn-icon" 
            onClick={onReset}
            title="Reset Seluruh Kemajuan Belajar"
          >
            <span className="btn-icon-symbol">↺</span>
            <span className="btn-label-mobile-hide">Ulangi Modul</span>
          </button>

          {/* Tombol Logout */}
          {currentUser && onLogout && (
            <button 
              type="button" 
              className="btn-icon btn-logout" 
              onClick={onLogout}
              title="Keluar dari akun Chemify"
            >
              <span className="btn-icon-symbol">🚪</span>
              <span className="btn-label-mobile-hide">Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
