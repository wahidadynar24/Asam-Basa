import React, { useState, useRef } from 'react';
import { getTeacherProfile, updateTeacherProfile } from '../utils/auth';

export default function TeacherProfile({ 
  currentUser, 
  onNavigate, 
  onProfileUpdated, 
  onLogout 
}) {
  // Mode: 'view' (ringkasan) atau 'edit' (formulir pengeditan profil guru)
  const [isEditing, setIsEditing] = useState(false);

  // Status Profil Tersimpan
  const [profileData, setProfileData] = useState(() => {
    if (currentUser?.id) {
      const saved = getTeacherProfile(currentUser.id);
      if (saved) return saved;
    }
    return {
      id: currentUser?.id || '',
      name: currentUser?.name || 'Bapak/Ibu Guru',
      email: currentUser?.email || 'guru@chemify.edu',
      role: 'teacher',
      photoUrl: currentUser?.photoUrl || '',
      school: currentUser?.school || 'SMA Negeri 1 Edukasi',
      subject: currentUser?.subject || 'Kimia SMA',
      accountStatus: currentUser?.accountStatus || 'Aktif',
      bio: 'Pendidik kimia yang berdedikasi mengembangkan pembelajaran sains interaktif dan bermakna.',
      createdAt: currentUser?.createdAt || new Date().toISOString()
    };
  });

  // State Form Sementara saat Pengeditan
  const [formData, setFormData] = useState(() => ({ ...profileData }));

  // Notifikasi Feedback
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Ref file input
  const fileInputRef = useRef(null);

  // Handler Ganti Nilai Input Form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler Unggah Foto Profil Guru (FileReader -> Data URL Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlert({
        type: 'error',
        message: 'Format file tidak didukung. Harap unggah file gambar (JPG, PNG, atau WEBP).'
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAlert({
        type: 'error',
        message: 'Ukuran foto profil terlalu besar. Maksimal ukuran gambar adalah 2 MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      setFormData((prev) => ({
        ...prev,
        photoUrl: base64Data
      }));
      setAlert({
        type: 'success',
        message: 'Foto profil berhasil dipilih! Klik "Simpan Perubahan" untuk menyimpan permanen.'
      });
    };
    reader.onerror = () => {
      setAlert({
        type: 'error',
        message: 'Gagal memproses file foto profil.'
      });
    };
    reader.readAsDataURL(file);
  };

  // Handler Hapus Foto Profil Guru
  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photoUrl: ''
    }));
    setAlert({
      type: 'info',
      message: 'Foto profil dihapus. Klik "Simpan Perubahan" untuk mengonfirmasi.'
    });
  };

  // Mulai Mode Edit
  const handleStartEdit = () => {
    setFormData({ ...profileData });
    setIsEditing(true);
    setAlert({ type: '', message: '' });
  };

  // Batalkan Perubahan
  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
    setAlert({ type: '', message: '' });
  };

  // Simpan Perubahan Profil Guru
  const handleSave = (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Nama Lengkap Guru wajib diisi.' });
      return;
    }
    if (!formData.school.trim()) {
      setAlert({ type: 'error', message: 'Nama Sekolah wajib diisi.' });
      return;
    }
    if (!formData.subject.trim()) {
      setAlert({ type: 'error', message: 'Mata Pelajaran yang diampu wajib diisi.' });
      return;
    }

    try {
      setIsSaving(true);
      const updated = updateTeacherProfile(currentUser.id, formData);
      setProfileData(updated);
      setFormData(updated);
      setIsEditing(false);
      setAlert({
        type: 'success',
        message: 'Profil Guru berhasil diperbarui dan disimpan ke sistem!'
      });

      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Terjadi kesalahan saat menyimpan data profil Guru.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar inisial jika foto belum diunggah
  const getInitials = (name) => {
    if (!name) return 'G';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-container profile-page teacher-profile-page">
      {/* Top Bar Navigasi Guru */}
      <div className="profile-top-bar teacher-profile-top-bar">
        <button 
          type="button" 
          className="btn-back-dashboard btn-back-teacher" 
          onClick={() => onNavigate('/guru')}
          title="Kembali ke Dashboard Guru"
        >
          <span className="back-arrow">←</span>
          <span>Kembali ke Dashboard Guru</span>
        </button>

        {/* Menu Navigasi Khusus Guru (Section D) */}
        <nav className="teacher-quick-nav-bar" aria-label="Navigasi Guru">
          <button 
            type="button" 
            className="teacher-nav-pill" 
            onClick={() => onNavigate('/guru')}
            title="Buka Beranda Portal Guru"
          >
            🏠 Beranda
          </button>
          <button 
            type="button" 
            className="teacher-nav-pill active" 
            onClick={() => onNavigate('/guru/profil')}
            title="Profil Saya"
          >
            👤 Profil Saya
          </button>
          <button 
            type="button" 
            className="teacher-nav-pill" 
            onClick={() => onNavigate('/guru/dashboard')}
            title="Buka Dashboard Guru"
          >
            📊 Dashboard Guru
          </button>
          <button 
            type="button" 
            className="teacher-nav-pill teacher-nav-pill-logout" 
            onClick={onLogout}
            title="Keluar dari akun Guru"
          >
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Banner Feedback Alert */}
      {alert.message && (
        <div 
          className={`auth-alert ${
            alert.type === 'success' 
              ? 'auth-alert-success' 
              : alert.type === 'info' 
              ? 'auth-alert-info' 
              : 'auth-alert-error'
          }`}
          role="alert"
        >
          <span className="alert-icon">
            {alert.type === 'success' ? '✅' : alert.type === 'info' ? 'ℹ️' : '⚠️'}
          </span>
          <div className="alert-text">{alert.message}</div>
          <button 
            type="button" 
            className="alert-close-btn" 
            onClick={() => setAlert({ type: '', message: '' })} 
            aria-label="Tutup pesan notifikasi"
          >
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION A: HERO CARD - INFORMASI PRIBADI GURU
         ========================================================================= */}
      <section className="profile-hero-card teacher-hero-card">
        <div className="profile-avatar-container">
          {formData.photoUrl ? (
            <img 
              src={formData.photoUrl} 
              alt={formData.name || 'Foto Profil Guru'} 
              className="profile-large-avatar-img teacher-large-avatar" 
            />
          ) : (
            <div className="profile-large-avatar-placeholder teacher-large-avatar-placeholder">
              <span>{getInitials(formData.name)}</span>
            </div>
          )}

          {/* Kontrol Foto (Hanya muncul saat mode edit) */}
          {isEditing && (
            <div className="avatar-upload-controls">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                style={{ display: 'none' }} 
              />
              <button 
                type="button" 
                className="btn-avatar-action" 
                onClick={() => fileInputRef.current?.click()}
              >
                📷 Unggah Foto
              </button>
              {formData.photoUrl && (
                <button 
                  type="button" 
                  className="btn-avatar-remove" 
                  onClick={handleRemovePhoto}
                >
                  Hapus
                </button>
              )}
            </div>
          )}
        </div>

        <div className="profile-hero-meta">
          <div className="profile-title-row">
            <h1 className="profile-name-title">{formData.name}</h1>
            <span className="profile-badge-teacher">👨‍🏫 Peran: Guru</span>
            <span className="verified-pill">Status: {profileData.accountStatus || 'Aktif'}</span>
          </div>

          <div className="profile-email-meta">
            <span className="meta-icon">✉️</span>
            <span>{formData.email}</span>
            <span className="verified-pill">Akun Terverifikasi</span>
          </div>

          <div className="profile-school-meta">
            <span className="meta-icon">🏫</span>
            <span>{formData.school}</span>
            <span className="meta-divider">•</span>
            <span className="meta-icon">🧪</span>
            <span>Pengampu: <strong>{formData.subject}</strong></span>
          </div>
        </div>

        <div className="profile-hero-action">
          {!isEditing ? (
            <button 
              type="button" 
              className="btn-primary-edit-profile btn-teacher-edit" 
              onClick={handleStartEdit}
            >
              <span>✏️ Edit Profil Guru</span>
            </button>
          ) : (
            <span className="editing-indicator-badge">
              Sedang Mengedit Profil...
            </span>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION B & C: INFORMASI PRIBADI & PENGELOLAAN PROFIL
         ========================================================================= */}
      {!isEditing ? (
        <div className="profile-grid-layout">
          {/* Kolom Kiri: Detail Informasi Guru & Akun */}
          <section className="profile-card">
            <div className="card-section-header">
              <span className="section-header-icon">📑</span>
              <h2>Data Pribadi & Kepegawaian</h2>
            </div>

            <div className="detail-rows-list">
              <div className="detail-row">
                <span className="detail-label">Nama Lengkap & Gelar</span>
                <span className="detail-value">{profileData.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Peran Pengguna</span>
                <span className="detail-value text-teacher-bold">Guru (Pendidik Kimia)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nama Sekolah / Institusi</span>
                <span className="detail-value">{profileData.school}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mata Pelajaran yang Diampu</span>
                <span className="detail-value text-teacher-subject-pill">{profileData.subject}</span>
              </div>
            </div>

            {/* Bio Guru */}
            <div className="bio-section">
              <span className="detail-label">Bio / Catatan Guru:</span>
              <p className="bio-content-text">
                "{profileData.bio || 'Belum ada deskripsi profil.'}"
              </p>
            </div>
          </section>

          {/* Kolom Kanan: Informasi Akun & Navigasi Pengajar */}
          <div className="profile-side-column">
            {/* C. Account Information Card */}
            <section className="profile-card teacher-account-card">
              <div className="card-section-header">
                <span className="section-header-icon">🛡️</span>
                <h2>Informasi Akun</h2>
              </div>

              <div className="detail-rows-list">
                <div className="detail-row">
                  <span className="detail-label">Email Akun</span>
                  <span className="detail-value">{profileData.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Role Akun</span>
                  <span className="detail-value">
                    <span className="role-tag-teacher">Guru (teacher)</span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status Akun</span>
                  <span className="detail-value text-success-bold">
                    ● {profileData.accountStatus || 'Aktif'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Akses Sistem</span>
                  <span className="detail-value">Dashboard & Manajemen Siswa</span>
                </div>
              </div>
            </section>

            {/* D. Menu Navigasi Guru Card */}
            <section className="profile-card teacher-nav-card">
              <div className="card-section-header">
                <span className="section-header-icon">🧭</span>
                <h2>Navigasi Menu Guru</h2>
              </div>

              <div className="teacher-nav-menu-list">
                <button 
                  type="button" 
                  className="btn-teacher-nav-item" 
                  onClick={() => onNavigate('/guru')}
                >
                  <span className="nav-item-icon">🏠</span>
                  <div className="nav-item-text">
                    <strong>Beranda Guru</strong>
                    <span>Ringkasan aktivitas dan pengenalan portal</span>
                  </div>
                  <span className="nav-item-arrow">→</span>
                </button>

                <button 
                  type="button" 
                  className="btn-teacher-nav-item" 
                  onClick={() => onNavigate('/guru/dashboard')}
                >
                  <span className="nav-item-icon">📊</span>
                  <div className="nav-item-text">
                    <strong>Dashboard Guru</strong>
                    <span>Pantau kemajuan siswa dan modul 5E</span>
                  </div>
                  <span className="nav-item-arrow">→</span>
                </button>

                <button 
                  type="button" 
                  className="btn-teacher-nav-item btn-teacher-nav-logout" 
                  onClick={onLogout}
                >
                  <span className="nav-item-icon">🚪</span>
                  <div className="nav-item-text">
                    <strong>Logout</strong>
                    <span>Keluar dari sesi portal Guru</span>
                  </div>
                  <span className="nav-item-arrow">⎋</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : (
        /* =========================================================================
            B. FORMULIR PENGEDITAN PROFIL GURU (EDIT MODE)
           ========================================================================= */
        <section className="profile-card">
          <div className="card-section-header">
            <span className="section-header-icon">✏️</span>
            <h2>Edit Profil Guru</h2>
          </div>

          <form className="profile-edit-form" onSubmit={handleSave}>
            <div className="form-fields-grid">
              {/* Nama Lengkap */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="teacher-edit-name">
                  Nama Lengkap & Gelar <span className="required-star">*</span>
                </label>
                <input 
                  id="teacher-edit-name" 
                  type="text" 
                  name="name" 
                  className="form-input" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              {/* Email (Readonly) */}
              <div className="form-group">
                <label className="form-label" htmlFor="teacher-edit-email">
                  Alamat Email Akun <span className="optional-tag">(Tidak dapat diubah)</span>
                </label>
                <input 
                  id="teacher-edit-email" 
                  type="email" 
                  name="email" 
                  className="form-input form-input-readonly" 
                  value={formData.email} 
                  readOnly 
                  disabled 
                />
              </div>

              {/* Peran / Role (Readonly) */}
              <div className="form-group">
                <label className="form-label" htmlFor="teacher-edit-role">
                  Peran Akun <span className="optional-tag">(Sistem Role-based)</span>
                </label>
                <input 
                  id="teacher-edit-role" 
                  type="text" 
                  className="form-input form-input-readonly" 
                  value="Guru (teacher)" 
                  readOnly 
                  disabled 
                />
              </div>

              {/* Nama Sekolah */}
              <div className="form-group">
                <label className="form-label" htmlFor="teacher-edit-school">
                  Nama Sekolah / Institusi <span className="required-star">*</span>
                </label>
                <input 
                  id="teacher-edit-school" 
                  type="text" 
                  name="school" 
                  className="form-input" 
                  value={formData.school} 
                  onChange={handleChange} 
                  placeholder="Contoh: SMA Negeri 1 Edukasi" 
                  required 
                />
              </div>

              {/* Mata Pelajaran */}
              <div className="form-group">
                <label className="form-label" htmlFor="teacher-edit-subject">
                  Mata Pelajaran <span className="required-star">*</span>
                </label>
                <input 
                  id="teacher-edit-subject" 
                  type="text" 
                  name="subject" 
                  className="form-input" 
                  value={formData.subject} 
                  onChange={handleChange} 
                  placeholder="Contoh: Kimia SMA" 
                  required 
                />
              </div>

              {/* Bio / Catatan Pendidik */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="teacher-edit-bio">
                  Bio / Catatan Guru <span className="optional-tag">(Opsional)</span>
                </label>
                <textarea 
                  id="teacher-edit-bio" 
                  name="bio" 
                  className="form-textarea" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  placeholder="Tuliskan deskripsi singkat mengenai pengalaman mengajar atau bidang minat Anda..." 
                  rows={3} 
                />
              </div>
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="profile-form-actions">
              <button 
                type="button" 
                className="btn-profile-cancel" 
                onClick={handleCancel} 
                disabled={isSaving}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn-profile-save btn-teacher-save" 
                disabled={isSaving}
              >
                {isSaving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
