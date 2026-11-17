import React from 'react';

export default function TeacherNavbar({ 
  currentUser, 
  currentPath = '/guru', 
  onNavigate, 
  onLogout 
}) {
  const getInitials = (name) => {
    if (!name) return 'G';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const isProfileActive = currentPath === '/guru/profil';
  const isHomeActive = currentPath === '/guru';
  const isDashboardActive = currentPath === '/guru/dashboard';

  return (
    <header className="navbar teacher-navbar">
      <div className="navbar-container">
        {/* Brand Logo & Title */}
        <div 
          className="navbar-brand teacher-navbar-brand" 
          onClick={() => onNavigate('/guru')} 
          role="button" 
          tabIndex={0}
          title="Ke Beranda Portal Guru"
        >
          <div className="brand-logo teacher-brand-logo">
            <span className="logo-icon">👨‍🏫</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">
              Chemify <span className="brand-highlight brand-highlight-teacher">5E</span>
            </span>
            <span className="brand-subtitle">Portal Pendidik & Guru Kimia</span>
          </div>
        </div>

        {/* Teacher Navigation Links: Beranda, Dashboard Guru, Profil Saya */}
        <nav className="teacher-nav-links-center" aria-label="Navigasi Utama Guru">
          <button
            type="button"
            className={`teacher-nav-link ${isHomeActive ? 'active' : ''}`}
            onClick={() => onNavigate('/guru')}
            title="Beranda Portal Guru"
          >
            <span className="nav-link-icon">🏠</span>
            <span>Beranda</span>
          </button>
          <button
            type="button"
            className={`teacher-nav-link ${isDashboardActive ? 'active' : ''}`}
            onClick={() => onNavigate('/guru/dashboard')}
            title="Dashboard Monitoring Siswa"
          >
            <span className="nav-link-icon">📊</span>
            <span>Dashboard Guru</span>
          </button>
          <button
            type="button"
            className={`teacher-nav-link ${isProfileActive ? 'active' : ''}`}
            onClick={() => onNavigate('/guru/profil')}
            title="Profil Saya"
          >
            <span className="nav-link-icon">👤</span>
            <span>Profil Saya</span>
          </button>
        </nav>

        {/* Navbar Actions: Teacher Profile & Logout */}
        <div className="navbar-actions">
          {currentUser && (
            <button
              type="button"
              className={`navbar-user-profile teacher-profile-btn ${isProfileActive ? 'active active-teacher' : ''}`} 
              onClick={() => onNavigate('/guru/profil')}
              title="Buka Profil Guru"
              aria-label="Profil Guru"
            >
              <div className="user-avatar-badge teacher-avatar-badge">
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
                <span className="user-role-tag teacher-role-tag">Pendidik / Guru</span>
              </div>
              <span className="profile-indicator-icon">✏️</span>
            </button>
          )}

          {/* Tombol Logout */}
          {currentUser && onLogout && (
            <button 
              type="button" 
              className="btn-icon btn-logout teacher-btn-logout" 
              onClick={onLogout}
              title="Keluar dari sesi portal Guru"
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

