import React, { useState, useEffect } from 'react';
import { 
  loginUser, 
  registerUser, 
  resetUserPassword, 
  initDefaultDemoUser, 
  validateEmailFormat, 
  validatePasswordStrength 
} from '../utils/auth';

export default function Auth({ onLoginSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Status notifikasi feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State Form Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // State Form Registrasi
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // State Form Lupa Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotStatus, setForgotStatus] = useState({ type: '', message: '' });
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Inisialisasi demo akun saat komponen dimuat
  useEffect(() => {
    initDefaultDemoUser().catch(console.error);
  }, []);

  // Bersihkan notifikasi saat berpindah mode
  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Handler Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Silakan masukkan alamat email kamu.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Silakan masukkan kata sandi.');
      return;
    }

    try {
      setIsLoading(true);
      const session = await loginUser({
        email: loginEmail,
        password: loginPassword,
        rememberMe
      });

      setSuccessMessage(`Selamat datang kembali, ${session.name}! Mengarahkan ke modul pembelajaran...`);
      setTimeout(() => {
        onLoginSuccess(session);
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali email dan password kamu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Submit Registrasi
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validasi lokal sebelum memanggil service
    if (!regName.trim()) {
      setErrorMessage('Nama Lengkap wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Email wajib diisi.');
      return;
    }
    if (!validateEmailFormat(regEmail)) {
      setErrorMessage('Format email tidak valid (contoh: siswa@sekolah.sch.id).');
      return;
    }
    if (!regPassword) {
      setErrorMessage('Password wajib diisi.');
      return;
    }
    const pwdCheck = validatePasswordStrength(regPassword);
    if (!pwdCheck.isValid) {
      setErrorMessage(pwdCheck.message);
      return;
    }
    if (!regConfirmPassword) {
      setErrorMessage('Konfirmasi Password wajib diisi.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Password dan Konfirmasi Password tidak sesuai.');
      return;
    }

    try {
      setIsLoading(true);
      const newUser = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      setSuccessMessage(`Akun atas nama "${newUser.name}" berhasil didaftarkan! Silakan masuk menggunakan akun barumu.`);
      // Pindahkan email ke form login untuk kemudahan pengguna
      setLoginEmail(newUser.email);
      setLoginPassword('');
      // Reset form registrasi
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      // Beralih ke form login setelah jeda singkat
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Submit Pemulihan Kata Sandi
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotStatus({ type: '', message: '' });

    if (!forgotEmail.trim()) {
      setForgotStatus({ type: 'error', message: 'Email akun wajib diisi.' });
      return;
    }
    if (!validateEmailFormat(forgotEmail)) {
      setForgotStatus({ type: 'error', message: 'Format email tidak valid.' });
      return;
    }
    if (!forgotNewPassword) {
      setForgotStatus({ type: 'error', message: 'Password baru wajib diisi.' });
      return;
    }
    const check = validatePasswordStrength(forgotNewPassword);
    if (!check.isValid) {
      setForgotStatus({ type: 'error', message: check.message });
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotStatus({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    try {
      setIsForgotLoading(true);
      await resetUserPassword({
        email: forgotEmail,
        newPassword: forgotNewPassword,
        confirmPassword: forgotConfirmPassword
      });

      setForgotStatus({
        type: 'success',
        message: 'Password berhasil diubah! Kamu sekarang dapat masuk dengan password baru.'
      });
      setLoginEmail(forgotEmail);
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setForgotStatus({ type: '', message: '' });
        setForgotEmail('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setMode('login');
        setSuccessMessage('Password berhasil diperbarui. Silakan login dengan password baru.');
      }, 1800);
    } catch (err) {
      setForgotStatus({ type: 'error', message: err.message || 'Gagal mengubah password.' });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Background Lab Chemistry Decorative Elements */}
      <div className="auth-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="auth-container">
        {/* Brand Banner Header */}
        <div className="auth-brand-header">
          <div className="brand-logo-large">
            <span className="logo-icon-large">⚗️</span>
          </div>
          <h1 className="auth-main-title">
            Chemify <span className="brand-highlight">5E</span>
          </h1>
          <p className="auth-subtitle">
            Media Pembelajaran Kimia Asam-Basa Interaktif SMA Kelas XI
          </p>
        </div>

        {/* Auth Main Card */}
        <div className="auth-card">
          {/* Tabs Selector */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              <span className="tab-icon">🔐</span> Masuk (Login)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              <span className="tab-icon">📝</span> Daftar Akun (Register)
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
              A. HALAMAN LOGIN
             ========================================================================= */}
          {mode === 'login' && (
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <div className="form-intro">
                <h2>Selamat Datang Kembali!</h2>
                <p>Silakan masuk ke akun Chemify untuk melanjutkan pembelajaran 5E.</p>
              </div>

              {/* Input Email */}
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">
                  Alamat Email <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">✉️</span>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="login-password" className="form-label">
                    Kata Sandi (Password) <span className="required-star">*</span>
                  </label>
                  {/* Tautan Lupa Password */}
                  <button
                    type="button"
                    className="btn-text-link"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setShowForgotPasswordModal(true);
                      setForgotStatus({ type: '', message: '' });
                    }}
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="input-with-icon">
                  <span className="input-leading-icon">🔒</span>
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Masukkan kata sandi kamu"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  {/* Ikon untuk menampilkan dan menyembunyikan password */}
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

              {/* Checkbox Ingat Saya (Remember Me) */}
              <div className="form-checkbox-row">
                <label className="checkbox-label" htmlFor="remember-me">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Ingat Saya (Remember Me)</span>
                </label>
                <span className="checkbox-hint">Tetap masuk di perangkat ini</span>
              </div>

              {/* Tombol Login */}
              <button
                type="submit"
                className="btn-primary-auth"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner-inline">Memverifikasi...</span>
                ) : (
                  <>
                    <span>Masuk ke Modul Pembelajaran</span>
                    <span className="auth-btn-arrow">→</span>
                  </>
                )}
              </button>

              {/* Demo Quick Credential Helper */}
              <div className="demo-credentials-badge">
                <span className="demo-badge-title">💡 Akun Demo Siap Pakai:</span>
                <code>siswa@chemify.edu</code> / <code>Siswa123!</code>
              </div>

              {/* Tautan "Belum memiliki akun? Register" */}
              <div className="auth-footer-switch">
                <span>Belum memiliki akun?</span>{' '}
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => switchMode('register')}
                >
                  Daftar Akun Baru (Register)
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              B. HALAMAN REGISTRASI
             ========================================================================= */}
          {mode === 'register' && (
            <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-intro">
                <h2>Pendaftaran Akun Baru</h2>
                <p>Buat akun Chemify gratis untuk menyimpan kemajuan belajar dan skor kuis.</p>
              </div>

              {/* 1. Input Nama Lengkap */}
              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">
                  Nama Lengkap <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">👤</span>
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Muhammad Farhan"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* 2. Input Email */}
              <div className="form-group">
                <label htmlFor="reg-email" className="form-label">
                  Alamat Email <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">✉️</span>
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input"
                    placeholder="nama@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <span className="field-hint">Gunakan email aktif untuk notifikasi dan pemulihan akun.</span>
              </div>

              {/* 3. Input Password */}
              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">
                  Kata Sandi (Password) <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">🔒</span>
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Minimal 8 karakter kombinasi huruf & angka"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  {/* Ikon Tampilkan/Sembunyikan Password */}
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

                {/* Password Requirement Checklist Live Helper */}
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

              {/* 4. Input Konfirmasi Password */}
              <div className="form-group">
                <label htmlFor="reg-confirm-password" className="form-label">
                  Konfirmasi Kata Sandi <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-leading-icon">🔐</span>
                  <input
                    id="reg-confirm-password"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Ulangi kata sandi di atas"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  {/* Ikon Tampilkan/Sembunyikan Konfirmasi Password */}
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

              {/* Tombol Registrasi */}
              <button
                type="submit"
                className="btn-primary-auth btn-register"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner-inline">Mendaftarkan Akun...</span>
                ) : (
                  <>
                    <span>Daftar Akun Sekarang</span>
                    <span className="auth-btn-arrow">✨</span>
                  </>
                )}
              </button>

              {/* Tautan "Sudah memiliki akun? Login" */}
              <div className="auth-footer-switch">
                <span>Sudah memiliki akun?</span>{' '}
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => switchMode('login')}
                >
                  Masuk di Sini (Login)
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & Privacy Notice */}
        <div className="auth-security-notice">
          <span className="lock-icon">🔒</span>
          <span>
            Sistem autentikasi aman: kata sandi dienkripsi dengan <em>Salted Hash</em> SHA-256 dan tidak disimpan dalam teks biasa.
          </span>
        </div>
      </div>

      {/* =========================================================================
          MODAL PEMULIHAN KATA SANDI (LUPA PASSWORD)
         ========================================================================= */}
      {showForgotPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotPasswordModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">🔑</span>
                <h3>Atur Ulang Kata Sandi</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-icon"
                onClick={() => setShowForgotPasswordModal(false)}
                aria-label="Tutup dialog"
              >
                ✕
              </button>
            </div>

            <p className="modal-desc">
              Masukkan alamat email akun Chemify yang telah terdaftar, kemudian tetapkan kata sandi baru kamu.
            </p>

            {forgotStatus.message && (
              <div className={`auth-alert ${forgotStatus.type === 'success' ? 'auth-alert-success' : 'auth-alert-error'}`}>
                <span>{forgotStatus.type === 'success' ? '✅' : '⚠️'}</span>
                <div>{forgotStatus.message}</div>
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Terdaftar</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="nama@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="forgot-new-pwd">Kata Sandi Baru</label>
                <div className="input-with-icon">
                  <input
                    id="forgot-new-pwd"
                    type={showForgotNewPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Minimal 8 karakter (huruf & angka)"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-trailing-btn"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    aria-label="Tampilkan / Sembunyikan Password"
                  >
                    {showForgotNewPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="forgot-conf-pwd">Konfirmasi Kata Sandi Baru</label>
                <input
                  id="forgot-conf-pwd"
                  type="password"
                  className="form-input"
                  placeholder="Ulangi kata sandi baru"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowForgotPasswordModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isForgotLoading}
                >
                  {isForgotLoading ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

