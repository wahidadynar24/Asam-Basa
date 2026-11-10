import React, { useState } from 'react';
import { getAllStudents, getTeacherProfile } from '../utils/auth';

export default function TeacherDashboard({ 
  currentUser, 
  onNavigate, 
  onPreviewStudentModule 
}) {
  const [students] = useState(() => getAllStudents());
  const [teacherProfile] = useState(() => {
    return currentUser?.id ? getTeacherProfile(currentUser.id) : null;
  });

  const teacherName = teacherProfile?.name || currentUser?.name || 'Bapak/Ibu Guru';
  const schoolName = teacherProfile?.school || currentUser?.school || 'SMA Negeri 1 Edukasi';
  const subjectName = teacherProfile?.subject || currentUser?.subject || 'Kimia SMA';

  return (
    <div className="page-container teacher-dashboard-page">
      {/* Welcome Banner */}
      <section className="teacher-welcome-banner">
        <div className="welcome-banner-content">
          <div className="welcome-icon-box">👨‍🏫</div>
          <div className="welcome-text-group">
            <span className="welcome-pill">Portal Pendidik Kimia</span>
            <h1 className="welcome-title">Selamat Datang, {teacherName}!</h1>
            <p className="welcome-subtitle">
              Kelola proses pembelajaran dan pantau aktivitas siswa pada media pembelajaran Kimia Asam-Basa berbasis Model 5E di <strong>{schoolName}</strong>.
            </p>
          </div>
        </div>

        <div className="welcome-banner-actions">
          <button 
            type="button" 
            className="btn-welcome-action primary" 
            onClick={() => onNavigate('/guru/profil')}
          >
            <span>👤 Kelola Profil Guru</span>
          </button>
          {onPreviewStudentModule && (
            <button 
              type="button" 
              className="btn-welcome-action secondary" 
              onClick={onPreviewStudentModule}
            >
              <span>🔬 Pratinjau Modul Siswa 5E</span>
            </button>
          )}
        </div>
      </section>

      {/* Stats Overview Grid */}
      <section className="teacher-stats-grid" aria-label="Ringkasan Statistik">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-students">👥</div>
          <div className="stat-info">
            <span className="stat-value">{students.length}</span>
            <span className="stat-label">Siswa Terdaftar</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-module">⚗️</div>
          <div className="stat-info">
            <span className="stat-value">5</span>
            <span className="stat-label">Tahapan Modul 5E</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-subject">🧪</div>
          <div className="stat-info">
            <span className="stat-value">{subjectName}</span>
            <span className="stat-label">Mata Pelajaran Diampu</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-status">🛡️</div>
          <div className="stat-info">
            <span className="stat-value text-success">Aktif</span>
            <span className="stat-label">Status Akun Pendidik</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Daftar Siswa & Alur Pembelajaran 5E */}
      <div className="teacher-dashboard-layout">
        {/* Kolom Kiri: Tabel Monitoring Siswa Terdaftar */}
        <section className="profile-card teacher-student-list-card">
          <div className="card-section-header">
            <span className="section-header-icon">📋</span>
            <div className="header-text-flex">
              <h2>Daftar Siswa Terdaftar</h2>
              <span className="student-count-badge">{students.length} Siswa</span>
            </div>
          </div>

          <p className="card-intro-text">
            Siswa yang telah membuat akun pada platform Chemify dan memiliki akses ke modul pembelajaran mandiri.
          </p>

          {students.length > 0 ? (
            <div className="table-responsive">
              <table className="teacher-data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Siswa</th>
                    <th>Email</th>
                    <th>Sekolah</th>
                    <th>Kelas / Jurusan</th>
                    <th>Peran</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, idx) => (
                    <tr key={st.id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong className="student-table-name">{st.name}</strong>
                      </td>
                      <td className="text-muted-cell">{st.email}</td>
                      <td>{st.school}</td>
                      <td>
                        <span className="student-grade-pill">
                          Kelas {st.grade || 'XI'} {st.major ? `(${st.major})` : ''}
                        </span>
                      </td>
                      <td>
                        <span className="role-tag-student">Siswa</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-box">
              <span className="empty-icon">👥</span>
              <p>Belum ada siswa terdaftar dalam sistem.</p>
            </div>
          )}
        </section>

        {/* Kolom Kanan: Panduan Kurikulum 5E & Shortcut Guru */}
        <div className="teacher-dashboard-sidebar">
          {/* Alur Model Pembelajaran 5E */}
          <section className="profile-card teacher-curriculum-card">
            <div className="card-section-header">
              <span className="section-header-icon">🧭</span>
              <h2>Alur Pembelajaran 5E</h2>
            </div>

            <ol className="curriculum-steps-list">
              <li className="curriculum-step-item">
                <span className="step-badge-number">1</span>
                <div>
                  <strong>Engage (Apersepsi)</strong>
                  <p>Eksplorasi fenomena cuka, sabun, dan jeruk dengan prediksi interaktif siswa.</p>
                </div>
              </li>
              <li className="curriculum-step-item">
                <span className="step-badge-number">2</span>
                <div>
                  <strong>Explore (Eksplorasi)</strong>
                  <p>Simulasi laboratorium virtual pH, pengenceran, dan uji lakmus digital.</p>
                </div>
              </li>
              <li className="curriculum-step-item">
                <span className="step-badge-number">3</span>
                <div>
                  <strong>Explain (Penjelasan)</strong>
                  <p>Teori asam basa Arrhenius, Brønsted-Lowry, Lewis dan ionisasi [H⁺]/[OH⁻].</p>
                </div>
              </li>
              <li className="curriculum-step-item">
                <span className="step-badge-number">4</span>
                <div>
                  <strong>Elaborate (Elaborasi)</strong>
                  <p>Penerapan konsep asam-basa dalam hujan asam, antasida, dan tanah pertanian.</p>
                </div>
              </li>
              <li className="curriculum-step-item">
                <span className="step-badge-number">5</span>
                <div>
                  <strong>Evaluate (Evaluasi)</strong>
                  <p>Tes pemahaman 10 butir soal pilihan ganda dengan pembahasan langsung.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* Quick Shortcuts */}
          <section className="profile-card teacher-shortcuts-card">
            <div className="card-section-header">
              <span className="section-header-icon">⚡</span>
              <h2>Aksi Cepat Pendidik</h2>
            </div>

            <div className="quick-action-buttons-list">
              <button 
                type="button" 
                className="btn-shortcut-item" 
                onClick={() => onNavigate('/guru/profil')}
              >
                <span>✏️ Perbarui Biodata & Sekolah</span>
                <span className="arrow-icon">→</span>
              </button>
              {onPreviewStudentModule && (
                <button 
                  type="button" 
                  className="btn-shortcut-item" 
                  onClick={onPreviewStudentModule}
                >
                  <span>🔬 Masuk ke Modul Pembelajaran (Mode Tinjau)</span>
                  <span className="arrow-icon">→</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
