import React, { useState, useEffect } from 'react';
import { 
  loginTeacher, 
  registerTeacher, 
  initDefaultDemoUser, 
  validateEmailFormat, 
  validatePasswordStrength 
} from '../utils/auth';

export default function TeacherAuth({ 
  onLoginSuccess, 
  onNavigate, 
  initialMode = 'login' 
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  // Notifikasi & status loading
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form Login Guru
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form Registrasi Guru
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regSubject, setRegSubject] = useState('Kimia');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Pastikan akun demo guru & siswa terinisialisasi
  useEffect(() => {
    initDefaultDemoUser().catch(console.error);
  }, []);

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Handler Submit Login Guru
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Silakan masukkan alamat email Bapak/Ibu Guru.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Silakan masukkan kata sandi akun Guru.');
      return;
    }

    try {
      setIsLoading(true);
      const session = await loginTeacher({
        email: loginEmail,
        password: loginPassword,
        rememberMe
      });

      setSuccessMessage(`Selamat datang kembali, ${session.name}! Mengarahkan ke Dashboard Guru...`);
      setTimeout(() => {
        onLoginSuccess(session);
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Guru.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Submit Registrasi Guru
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim()) {
      setErrorMessage('Nama Lengkap Guru beserta gelar wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Alamat Email Guru wajib diisi.');
      return;
    }
    if (!validateEmailFormat(regEmail)) {
      setErrorMessage('Format email tidak valid (contoh: guru@sekolah.sch.id).');
      return;
    }
    if (!regSchool.trim()) {
      setErrorMessage('Nama Sekolah / Institusi wajib diisi.');
      return;
    }
    if (!regSubject.trim()) {
      setErrorMessage('Mata Pelajaran yang diampu wajib diisi.');
      return;
    }
    if (!regPassword) {
      setErrorMessage('Kata Sandi (Password) wajib diisi.');
      return;
    }
    const pwdStrength = validatePasswordStrength(regPassword);
    if (!pwdStrength.isValid) {
      setErrorMessage(pwdStrength.message);
      return;
    }
    if (!regConfirmPassword) {
      setErrorMessage('Konfirmasi Kata Sandi wajib diisi.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Kata Sandi dan Konfirmasi Kata Sandi tidak cocok.');
      return;
    }

    try {
      setIsLoading(true);
      const newTeacher = await registerTeacher({
        name: regName,
        email: regEmail,
        school: regSchool,
        subject: regSubject,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      setSuccessMessage(`Pendaftaran Guru atas nama "${newTeacher.name}" berhasil! Silakan masuk menggunakan akun baru Anda.`);
      setLoginEmail(newTeacher.email);
      setLoginPassword('');
      // Reset formulir pendaftaran
      setRegName('');
      setRegEmail('');
      setRegSchool('');
      setRegSubject('Kimia');
      setRegPassword('');
      setRegConfirmPassword('');

      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Pendaftaran Guru gagal. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper teacher-auth-page-wrapper">
      {/* Background Decorative Shapes */}
      <div className="auth-bg-shapes">
        <div className="shape shape-1 shape-teacher" />
        <div className="shape shape-2 shape-teacher" />
        <div className="shape shape-3 shape-teacher" />
      </div>

      <div className="auth-container">
        {/* Brand Banner Header */}
        <div className="auth-brand-header">
          <div className="brand-logo-large teacher-logo-badge">
            <span className="logo-icon-large">👨‍🏫</span>
          </div>
          <div className="portal-badge-indicator">
            <span className="portal-pill-teacher">Portal Pendidik & Guru</span>
          </div>
          <h1 className="auth-main-title">
            Chemify <span className="brand-highlight">5E</span>
          </h1>
          <p className="auth-subtitle">
            Media Pembelajaran Kimia Asam-Basa Interaktif — Sistem Manajemen & Monitoring Guru
          </p>
        </div>

        {/* Auth Main Card */}
        <div className="auth-card teacher-auth-card">
          {/* Tabs Selector: Login vs Register */}
          <div className="auth-tabs teacher-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab-btn ${mode === 'login' ? 'active active-teacher' : ''}`}
              onClick={() => switchMode('login')}
            >
              <span className="tab-icon">🔐</span> Login Guru
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab-btn ${mode === 'register' ? 'active active-teacher' : ''}`}
              onClick={() => switchMode('register')}
            >
              <span className="tab-icon">📋</span> Pendaftaran Guru
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="auth-alert auth-alert-error" role="alert">
              <span className="alert-icon">⚠️</span>
              <div className="alert-text">{errorMessage}</div>
              <button 
                type="button" 
                className="alert-close-btn" 
                onClick={() => setErrorMessage('')} 
                aria-label="Tutup pesan error"
              >
                ✕
              </button>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert auth-alert-success" role="alert">
              <span className="alert-icon">✅</span>
              <div className="alert-text">{successMessage}</div>
              <button 
                type="button" 
                className="alert-close-btn" 
                onClick={() => setSuccessMessage('')} 
                aria-label="Tutup pesan sukses"
              >
                ✕
              </button>
            </div>
          )}

          {/* =========================================================================
              A. HALAMAN LOGIN GURU
             ========================================================================= */}
          {mode === 'login' && (
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <div className="form-intro">
                <h2>Login Guru</h2>
                <p>Selamat datang kembali, Bapak/Ibu Guru!</p>
              </div>

              {/* Input Email Guru */}
              <div className="form-group">
                <label htmlFor="teacher-login-email" className="form-label">
                  Alamat Email Guru <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">✉️</span>
                  <input
                    id="teacher-login-email"
                    type="email"
                    className="form-input"
                    placeholder="nama.guru@sekolah.sch.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Input Password Guru */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="teacher-login-password" className="form-label">
                    Kata Sandi (Password) <span className="required-star">*</span>
                  </label>
                </div>
                <div className="input-with-icon">
                  <span className="input-leading-icon">🔒</span>
                  <input
                    id="teacher-login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Masukkan kata sandi akun Guru"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="input-trailing-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    title={showLoginPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                    aria-label={showLoginPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                  >
                    {showLoginPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Checkbox Ingat Saya */}
              <div className="form-checkbox-row">
                <label className="checkbox-label" htmlFor="teacher-remember-me">
                  <input
                    id="teacher-remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Ingat Saya di Perangkat Ini</span>
                </label>
                <span className="checkbox-hint">Sesi Guru tetap aktif</span>
              </div>

              {/* Tombol Login Guru */}
              <button
                type="submit"
                className="btn-primary-auth btn-teacher-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner-inline">Memverifikasi Akun Guru...</span>
                ) : (
                  <>
                    <span>Masuk sebagai Guru</span>
                    <span className="auth-btn-arrow">→</span>
                  </>
                )}
              </button>

              {/* Demo Quick Credential Guru */}
              <div className="demo-credentials-badge teacher-demo-badge">
                <span className="demo-badge-title">👨‍🏫 Akun Demo Guru Siap Pakai:</span>
                <code>guru@chemify.edu</code> / <code>Guru123!</code>
              </div>

              {/* Tautan Navigasi Tambahan */}
              <div className="teacher-auth-links-group">
                {/* Tautan Kembali ke Login Siswa */}
                <div className="return-to-student-link">
                  <button
                    type="button"
                    className="btn-text-link-return"
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('/');
                      } else {
                        window.history.pushState(null, '', '/');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                  >
                    ← Kembali ke Halaman Utama / Login Siswa
                  </button>
                </div>

                {/* Tautan Registrasi Guru */}
                <div className="auth-footer-switch">
                  <span>Belum memiliki akun pengajar?</span>{' '}
                  <button
                    type="button"
                    className="switch-link-btn text-teacher-accent"
                    onClick={() => switchMode('register')}
                  >
                    Daftar Akun Guru Baru
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* =========================================================================
              B. HALAMAN REGISTRASI GURU
             ========================================================================= */}
          {mode === 'register' && (
            <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-intro">
                <h2>Pendaftaran Guru Baru</h2>
                <p>Daftarkan akun pendidik untuk mengakses data siswa dan pengelolaan materi.</p>
              </div>

              {/* 1. Nama Lengkap Guru */}
              <div className="form-group">
                <label htmlFor="reg-teacher-name" className="form-label">
                  Nama Lengkap & Gelar <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">👨‍🏫</span>
                  <input
                    id="reg-teacher-name"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Dra. Siti Rahmawati, M.Pd."
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* 2. Email Guru */}
              <div className="form-group">
                <label htmlFor="reg-teacher-email" className="form-label">
                  Alamat Email <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">✉️</span>
                  <input
                    id="reg-teacher-email"
                    type="email"
                    className="form-input"
                    placeholder="nama.guru@sekolah.sch.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <span className="field-hint">Gunakan email dinas atau email aktif untuk akun pendidik.</span>
              </div>

              {/* 3. Nama Sekolah & 4. Mata Pelajaran (Grid 2 Kolom) */}
              <div className="teacher-form-grid-2">
                <div className="form-group">
                  <label htmlFor="reg-teacher-school" className="form-label">
                    Nama Sekolah / Institusi <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-leading-icon">🏫</span>
                    <input
                      id="reg-teacher-school"
                      type="text"
                      className="form-input"
                      placeholder="Contoh: SMA Negeri 1 Edukasi"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-teacher-subject" className="form-label">
                    Mata Pelajaran <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-leading-icon">🧪</span>
                    <input
                      id="reg-teacher-subject"
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Kimia SMA"
                      value={regSubject}
                      onChange={(e) => setRegSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 5. Password Guru */}
              <div className="form-group">
                <label htmlFor="reg-teacher-password" className="form-label">
                  Kata Sandi (Password) <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">🔒</span>
                  <input
                    id="reg-teacher-password"
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Minimal 8 karakter kombinasi huruf & angka"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="input-trailing-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    title={showRegPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                    aria-label={showRegPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                  >
                    {showRegPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Requirement Checklist */}
                <div className="password-requirements">
                  <div className={`req-item ${regPassword.length >= 8 ? 'valid' : ''}`}>
                    <span className="req-bullet">{regPassword.length >= 8 ? '✓' : '•'}</span>
                    <span>Minimal 8 karakter</span>
                  </div>
                  <div className={`req-item ${/[a-zA-Z]/.test(regPassword) ? 'valid' : ''}`}>
                    <span className="req-bullet">{/[a-zA-Z]/.test(regPassword) ? '✓' : '•'}</span>
                    <span>Mengandung huruf (a-z / A-Z)</span>
                  </div>
                  <div className={`req-item ${/[0-9]/.test(regPassword) ? 'valid' : ''}`}>
                    <span className="req-bullet">{/[0-9]/.test(regPassword) ? '✓' : '•'}</span>
                    <span>Mengandung angka (0-9)</span>
                  </div>
                </div>
              </div>

              {/* 6. Konfirmasi Password Guru */}
              <div className="form-group">
                <label htmlFor="reg-teacher-confirm-password" className="form-label">
                  Konfirmasi Kata Sandi <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">🔐</span>
                  <input
                    id="reg-teacher-confirm-password"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Ulangi kata sandi di atas"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="input-trailing-btn"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    title={showRegConfirmPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                    aria-label={showRegConfirmPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                  >
                    {showRegConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {regConfirmPassword && (
                  <span className={`field-hint ${regPassword === regConfirmPassword ? 'text-success' : 'text-danger'}`}>
                    {regPassword === regConfirmPassword ? '✓ Konfirmasi password cocok' : '⚠ Konfirmasi password belum sama'}
                  </span>
                )}
              </div>

              {/* Tombol Registrasi Guru */}
              <button
                type="submit"
                className="btn-primary-auth btn-teacher-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner-inline">Mendaftarkan Akun Guru...</span>
                ) : (
                  <>
                    <span>Daftarkan Akun Guru Sekarang</span>
                    <span className="auth-btn-arrow">✨</span>
                  </>
                )}
              </button>

              {/* Tautan Navigasi Tambahan */}
              <div className="teacher-auth-links-group">
                <div className="return-to-student-link">
                  <button
                    type="button"
                    className="btn-text-link-return"
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('/');
                      } else {
                        window.history.pushState(null, '', '/');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                  >
                    ← Kembali ke Halaman Utama / Login Siswa
                  </button>
                </div>

                <div className="auth-footer-switch">
                  <span>Sudah memiliki akun pengajar?</span>{' '}
                  <button
                    type="button"
                    className="switch-link-btn text-teacher-accent"
                    onClick={() => switchMode('login')}
                  >
                    Masuk di Sini (Login Guru)
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Security & Role Notice */}
        <div className="auth-security-notice teacher-security-notice">
          <span className="lock-icon">🛡️</span>
          <span>
            <strong>Portal Terverifikasi:</strong> Khusus pengajar dan guru kimia. Akun guru dipisahkan secara aman melalui sistem hak akses (Role-Based Access Control).
          </span>
        </div>
      </div>
    </div>
  );
}
