import React from 'react';

export default function Navbar({ 
  _currentStep, 
  setStep, 
  onReset, 
  currentUser, 
  onLogout,
  onOpenProfile,
  isProfileActive = false
}) {
  // Ambil inisial nama pengguna jika foto profil belum diunggah
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const handleBrandClick = () => {
    if (setStep) setStep(0);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Title */}
        <div 
          className="navbar-brand" 
          onClick={handleBrandClick} 
          role="button" 
          tabIndex={0}
          title="Kembali ke Beranda CHEMIFY"
        >
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
          {/* Ikon Profil Pengguna di Pojok Kanan Atas */}
          {currentUser && (
            <button
              type="button"
              className={`navbar-user-profile ${isProfileActive ? 'active' : ''}`} 
              onClick={onOpenProfile}
              title="Buka Profil Saya (Klik untuk melihat & mengedit profil)"
              aria-label="Profil Saya"
            >
              <div className="user-avatar-badge">
                {currentUser.photoUrl ? (
                  <img 
                    src={currentUser.photoUrl} 
                    alt={currentUser.name} 
                    className="user-avatar-img" 
                  />
                ) : (
                  <span className="user-avatar-initials">
                    {getInitials(currentUser.name)}
                  </span>
                )}
              </div>
              <div className="user-info-text">
                <span className="user-name-display">{currentUser.name}</span>
                <span className="user-role-tag">Profil Siswa</span>
              </div>
              <span className="profile-indicator-icon">👤</span>
            </button>
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
