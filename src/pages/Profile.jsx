import React, { useState, useRef } from 'react';
import { getUserProfile, updateUserProfile } from '../utils/auth';

export default function Profile({ currentUser, onBack, onProfileUpdated, quizScore = 0, completedSteps = [] }) {
  // Mode: 'view' (ringkasan) atau 'edit' (formulir pengeditan)
  const [isEditing, setIsEditing] = useState(false);

  // Status Profil Tersimpan (Inisialisasi langsung dari data tersimpan pengguna)
  const [profileData, setProfileData] = useState(() => {
    if (currentUser?.id) {
      const saved = getUserProfile(currentUser.id);
      if (saved) return saved;
    }
    return {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      photoUrl: currentUser?.photoUrl || '',
      school: 'SMA Negeri 1 Edukasi',
      educationLevel: 'SMA',
      grade: 'XI',
      major: 'MIPA (Matematika & IPA)',
      attendanceNumber: '',
      bio: 'Siswa antusias kimia yang sedang mempelajari konsep asam-basa.'
    };
  });

  // State Form Sementara saat Pengeditan
  const [formData, setFormData] = useState(() => {
    if (currentUser?.id) {
      const saved = getUserProfile(currentUser.id);
      if (saved) return saved;
    }
    return {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      photoUrl: currentUser?.photoUrl || '',
      school: 'SMA Negeri 1 Edukasi',
      educationLevel: 'SMA',
      grade: 'XI',
      major: 'MIPA (Matematika & IPA)',
      attendanceNumber: '',
      bio: 'Siswa antusias kimia yang sedang mempelajari konsep asam-basa.'
    };
  });

  // Notifikasi Feedback
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Ref untuk input file foto profil
  const fileInputRef = useRef(null);

  // Handler Ganti Nilai Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler Unggah Foto Profil (FileReader -> Data URL Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file gambar
    if (!file.type.startsWith('image/')) {
      setAlert({
        type: 'error',
        message: 'Format file tidak didukung. Harap unggah file gambar (JPG, PNG, atau WEBP).'
      });
      return;
    }

    // Validasi ukuran file (maksimal 2MB agar aman di browser storage)
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
        message: 'Foto berhasil dipilih! Klik "Simpan Perubahan" untuk menyimpan permanen.'
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

  // Handler Hapus Foto Profil
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

  // Batalkan Perubahan (Kembali ke data tersimpan)
  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
    setAlert({ type: '', message: '' });
  };

  // Simpan Perubahan Profil
  const handleSave = (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    // Validasi Input Wajib
    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Nama Lengkap wajib diisi.' });
      return;
    }
    if (!formData.school.trim()) {
      setAlert({ type: 'error', message: 'Nama Sekolah wajib diisi.' });
      return;
    }
    if (!formData.educationLevel) {
      setAlert({ type: 'error', message: 'Jenjang Pendidikan wajib dipilih.' });
      return;
    }
    if (!formData.grade) {
      setAlert({ type: 'error', message: 'Kelas wajib dipilih.' });
      return;
    }
    if (!formData.major.trim()) {
      setAlert({ type: 'error', message: 'Jurusan wajib diisi.' });
      return;
    }

    try {
      setIsSaving(true);
      const updated = updateUserProfile(currentUser.id, formData);
      setProfileData(updated);
      setFormData(updated);
      setIsEditing(false);
      setAlert({
        type: 'success',
        message: 'Profil kamu berhasil diperbarui dan disimpan!'
      });

      // Beritahu parent (App.jsx) agar navbar langsung disinkronkan
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Terjadi kesalahan saat menyimpan data profil.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Inisial avatar cadangan jika belum ada foto
  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-container profile-page">
      {/* Tombol Navigasi Kembali ke Dashboard */}
      <div className="profile-top-bar">
        <button 
          type="button" 
          className="btn-back-dashboard" 
          onClick={onBack}
          title="Kembali ke Dashboard Chemify"
        >
          <span className="back-arrow">←</span>
          <span>Kembali ke Modul Pembelajaran</span>
        </button>
      </div>

      {/* Banner Notifikasi Sukses / Error */}
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
            aria-label="Tutup pesan"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Header Card Profil */}
      <section className="profile-hero-card">
        <div className="profile-avatar-container">
          {formData.photoUrl ? (
            <img 
              src={formData.photoUrl} 
              alt={formData.name || 'Foto Profil'} 
              className="profile-large-avatar-img" 
            />
          ) : (
            <div className="profile-large-avatar-placeholder">
              <span>{getInitials(formData.name)}</span>
            </div>
          )}

          {/* Tombol Aksi Upload Foto */}
          <div className="avatar-upload-controls">
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/png, image/jpeg, image/webp"
              onChange={handlePhotoUpload} 
            />
            <button
              type="button"
              className="btn-avatar-action"
              onClick={() => fileInputRef.current?.click()}
              title="Unggah Foto Profil Baru"
            >
              📷 {formData.photoUrl ? 'Ganti Foto' : 'Unggah Foto'}
            </button>
            {formData.photoUrl && (
              <button
                type="button"
                className="btn-avatar-remove"
                onClick={handleRemovePhoto}
                title="Hapus Foto Profil dan gunakan avatar default"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        <div className="profile-hero-meta">
          <div className="profile-title-row">
            <h1 className="profile-name-title">{profileData.name || 'Siswa Chemify'}</h1>
            <span className="profile-badge-student">Siswa Aktif</span>
          </div>
          <p className="profile-email-meta">
            <span className="meta-icon">✉️</span> {profileData.email}
            <span className="verified-pill">✓ Terautentikasi</span>
          </p>
          <p className="profile-school-meta">
            <span className="meta-icon">🏫</span> {profileData.school || 'Belum mengisi sekolah'} • {profileData.educationLevel} {profileData.grade} ({profileData.major})
          </p>
        </div>

        <div className="profile-hero-action">
          {!isEditing ? (
            <button 
              type="button" 
              className="btn-primary-edit-profile" 
              onClick={handleStartEdit}
            >
              <span>✏️ Edit Profil</span>
            </button>
          ) : (
            <span className="editing-indicator-badge">Sedang Mengedit...</span>
          )}
        </div>
      </section>

      {/* Konten Utama Profil: Mode Tampilan vs Mode Edit */}
      {!isEditing ? (
        /* =========================================================================
           MODE VIEW (RINGKASAN PROFIL)
           ========================================================================= */
        <div className="profile-grid-layout">
          {/* Bagian 1 & 2: Identitas & Informasi Akademik */}
          <div className="profile-card profile-details-card">
            <div className="card-section-header">
              <span className="section-header-icon">🎓</span>
              <h2>Informasi Akademik</h2>
            </div>

            <div className="detail-rows-list">
              <div className="detail-row">
                <span className="detail-label">Nama Sekolah</span>
                <span className="detail-value">{profileData.school || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Jenjang Pendidikan</span>
                <span className="detail-value">{profileData.educationLevel}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tingkat Kelas</span>
                <span className="detail-value">Kelas {profileData.grade}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Jurusan</span>
                <span className="detail-value">{profileData.major || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nomor Absen</span>
                <span className="detail-value">{profileData.attendanceNumber || 'Belum diisi'}</span>
              </div>
            </div>

            {/* Bagian 3: Informasi Tambahan */}
            <div className="bio-section">
              <span className="detail-label">Deskripsi Singkat (Bio)</span>
              <p className="bio-content-text">
                {profileData.bio || 'Belum ada deskripsi profil. Klik tombol "Edit Profil" untuk menambahkan bio singkat kamu.'}
              </p>
            </div>
          </div>

          {/* Kartu Status & Aktivitas Belajar CHEMIFY */}
          <div className="profile-card profile-stats-card">
            <div className="card-section-header">
              <span className="section-header-icon">⚗️</span>
              <h2>Kemajuan Belajar Kimia</h2>
            </div>

            <div className="stats-badges-container">
              <div className="stat-box">
                <span className="stat-number">{completedSteps.length} / 5</span>
                <span className="stat-caption">Tahap 5E Diselesaikan</span>
              </div>
              <div className="stat-box highlight-stat">
                <span className="stat-number">{quizScore}</span>
                <span className="stat-caption">Skor Kuis Asam-Basa</span>
              </div>
            </div>

            <div className="quick-action-box">
              <h4>Siap Belajar?</h4>
              <p>Lanjutkan eksplorasi laboratorium asam-basa untuk meningkatkan pemahaman dan skor kuis.</p>
              <button 
                type="button" 
                className="btn-start-learning-mini" 
                onClick={onBack}
              >
                Lanjutkan Pembelajaran 🚀
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           MODE EDIT (FORMULIR PENGELOLAAN PROFIL)
           ========================================================================= */
        <form className="profile-edit-form" onSubmit={handleSave} noValidate>
          {/* Section 1: Identitas Pribadi */}
          <div className="profile-card">
            <div className="card-section-header">
              <span className="section-header-icon">👤</span>
              <h2>1. Identitas Pribadi</h2>
            </div>

            <div className="form-fields-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">
                  Nama Lengkap <span className="required-star">*</span>
                </label>
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Muhammad Farhan"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-email">
                  Alamat Email (Akun Autentikasi)
                </label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  className="form-input form-input-readonly"
                  value={formData.email}
                  readOnly
                  disabled
                  title="Email terikat dengan sistem login dan tidak dapat diubah di sini."
                />
                <span className="field-hint">Email diambil otomatis dari akun autentikasi.</span>
              </div>
            </div>
          </div>

          {/* Section 2: Informasi Akademik */}
          <div className="profile-card">
            <div className="card-section-header">
              <span className="section-header-icon">🏫</span>
              <h2>2. Informasi Akademik</h2>
            </div>

            <div className="form-fields-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-school">
                  Nama Sekolah <span className="required-star">*</span>
                </label>
                <input
                  id="edit-school"
                  name="school"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: SMAN 1 Jakarta"
                  value={formData.school}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-edu-level">
                  Jenjang Pendidikan <span className="required-star">*</span>
                </label>
                <select
                  id="edit-edu-level"
                  name="educationLevel"
                  className="form-select"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                  <option value="MA">MA (Madrasah Aliyah)</option>
                  <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-grade">
                  Kelas <span className="required-star">*</span>
                </label>
                <select
                  id="edit-grade"
                  name="grade"
                  className="form-select"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                >
                  <option value="X">Kelas X (Sepuluh)</option>
                  <option value="XI">Kelas XI (Sebelas - Target Modul)</option>
                  <option value="XII">Kelas XII (Dua Belas)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-major">
                  Jurusan / Peminatan <span className="required-star">*</span>
                </label>
                <input
                  id="edit-major"
                  name="major"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: MIPA / IPA / Fase F Kimia"
                  value={formData.major}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Informasi Tambahan */}
          <div className="profile-card">
            <div className="card-section-header">
              <span className="section-header-icon">📝</span>
              <h2>3. Informasi Tambahan</h2>
            </div>

            <div className="form-fields-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-attendance">
                  Nomor Absen <span className="optional-tag">(Opsional)</span>
                </label>
                <input
                  id="edit-attendance"
                  name="attendanceNumber"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: 14"
                  value={formData.attendanceNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label" htmlFor="edit-bio">
                  Deskripsi Singkat / Bio <span className="optional-tag">(Opsional)</span>
                </label>
                <textarea
                  id="edit-bio"
                  name="bio"
                  rows={3}
                  className="form-textarea"
                  placeholder="Ceritakan sedikit tentang minat belajar kimiaku, cita-cita, atau moto belajarmu..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
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
              className="btn-profile-save"
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
