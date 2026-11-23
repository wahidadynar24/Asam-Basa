import React, { useState, useEffect } from 'react';
import { getAllStudents, getTeacherProfile } from '../utils/auth';
import { isFirebaseConfigured } from '../services/firebase';
import { getStudentsFromCloud } from '../services/firestoreService';

export default function TeacherDashboard({ 
  currentUser, 
  onNavigate, 
  onPreviewStudentModule 
}) {
  // Data Siswa Terdaftar beserta Aktivitas Belajarnya
  const [students, setStudents] = useState(() => getAllStudents());
  const [isLoadingStudents, setIsLoadingStudents] = useState(() => isFirebaseConfigured());

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');

  // Modal Detail Aktivitas Siswa
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);

  // Profil Guru
  const [teacherProfile] = useState(() => {
    return currentUser?.id ? getTeacherProfile(currentUser.id) : null;
  });

  const teacherName = teacherProfile?.name || currentUser?.name || 'Karenina Zulfa, S.Pd.';
  const schoolName = teacherProfile?.school || currentUser?.school || 'SMA Negeri 1 Edukasi';
  const subjectName = teacherProfile?.subject || currentUser?.subject || 'Kimia SMA';

  // Sinkronisasi data siswa dari Cloud Firestore jika Firebase aktif
  useEffect(() => {
    if (isFirebaseConfigured()) {
      let isMounted = true;
      getStudentsFromCloud()
        .then((res) => {
          if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
            setStudents(res.data);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingStudents(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, []);

  // Filter daftar siswa berdasarkan nama/email dan kelas
  const filteredStudents = students.filter((st) => {
    const matchesSearch = 
      (st.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.school || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = 
      selectedGradeFilter === 'ALL' || 
      (st.grade || '').toUpperCase() === selectedGradeFilter.toUpperCase();

    return matchesSearch && matchesGrade;
  });

  // Perhitungan Statistik Aktivitas Siswa
  const totalStudents = students.length;
  const completed5ECount = students.filter((st) => (st.completedSteps || []).length >= 5).length;
  const studentsWithScore = students.filter((st) => (st.quizScore ?? 0) > 0);
  const averageQuizScore = studentsWithScore.length > 0 
    ? Math.round(studentsWithScore.reduce((acc, st) => acc + (st.quizScore || 0), 0) / studentsWithScore.length)
    : 0;

  // Helper Inisial Avatar
  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-container teacher-dashboard-page">
      {/* Welcome Banner */}
      <section className="teacher-welcome-banner">
        <div className="welcome-banner-content">
          <div className="welcome-icon-box">👩‍🏫</div>
          <div className="welcome-text-group">
            <span className="welcome-pill">Portal Pendidik Kimia • Hak Akses Guru (RBAC)</span>
            <h1 className="welcome-title">Selamat Datang, {teacherName}!</h1>
            <p className="welcome-subtitle">
              Pantau kemajuan model pembelajaran 5E, data profil, hasil evaluasi kuis, dan refleksi belajar siswa di <strong>{schoolName}</strong> ({subjectName}).
            </p>
          </div>
        </div>

        <div className="welcome-banner-actions">
          <button 
            type="button" 
            className="btn-welcome-action primary" 
            onClick={() => onNavigate('/guru/profil')}
            title="Kelola Profil dan Informasi Akun Guru"
          >
            <span>👤 Profil Guru</span>
          </button>
          {onPreviewStudentModule && (
            <button 
              type="button" 
              className="btn-welcome-action secondary" 
              onClick={onPreviewStudentModule}
              title="Masuk ke modul 5E untuk menguji materi dan simulasi seperti yang dilihat siswa"
            >
              <span>🔬 Pratinjau Modul Siswa 5E</span>
            </button>
          )}
        </div>
      </section>

      {/* Stats Overview Grid: Terhubung dengan Aktivitas Siswa */}
      <section className="teacher-stats-grid" aria-label="Ringkasan Statistik Aktivitas Siswa">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-students">👥</div>
          <div className="stat-info">
            <span className="stat-value">{totalStudents}</span>
            <span className="stat-label">Total Siswa Terdaftar</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-module">⭐</div>
          <div className="stat-info">
            <span className="stat-value">{averageQuizScore}</span>
            <span className="stat-label">Rata-rata Skor Kuis</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-subject">🎯</div>
          <div className="stat-info">
            <span className="stat-value text-success">{completed5ECount} / {totalStudents}</span>
            <span className="stat-label">Siswa Tuntas 5 Tahap 5E</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-status">🛡️</div>
          <div className="stat-info">
            <span className="stat-value text-success">Aktif</span>
            <span className="stat-label">Role: Pendidik (Teacher)</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Tabel Monitoring Siswa & Kurikulum 5E */}
      <div className="teacher-dashboard-layout">
        {/* Kolom Kiri: Tabel Monitoring Siswa & Aktivitas */}
        <section className="profile-card teacher-student-list-card">
          <div className="card-section-header">
            <span className="section-header-icon">📊</span>
            <div className="header-text-flex">
              <h2>Data Profil &amp; Aktivitas Pembelajaran Siswa</h2>
              <span className="student-count-badge">
                {isLoadingStudents ? 'Memuat...' : `${filteredStudents.length} Siswa`}
              </span>
            </div>
          </div>

          <p className="card-intro-text">
            Panel pemantauan langsung: data profil akademik, progres tahapan 5E, nilai kuis asam-basa, dan refleksi belajar masing-masing siswa.
          </p>

          {/* Search & Filter Bar */}
          <div className="teacher-filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="teacher-search-input"
                placeholder="Cari nama, email, atau sekolah siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="clear-search-btn" 
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-select-wrapper">
              <label htmlFor="grade-filter" className="filter-label">Filter Kelas:</label>
              <select
                id="grade-filter"
                className="teacher-filter-select"
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
              >
                <option value="ALL">Semua Kelas</option>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="table-responsive">
              <table className="teacher-data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Identitas Siswa</th>
                    <th>Sekolah &amp; Kelas</th>
                    <th>Progres 5E</th>
                    <th>Nilai Kuis</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st, idx) => {
                    const completedCount = (st.completedSteps || []).length;
                    const progressPercent = Math.min(100, Math.round((completedCount / 5) * 100));
                    const score = st.quizScore ?? 0;

                    return (
                      <tr key={st.id || idx}>
                        <td className="table-row-index">{idx + 1}</td>
                        {/* Kolom Siswa: Avatar + Nama + Email */}
                        <td>
                          <div className="student-cell-identity">
                            <div className="student-cell-avatar">
                              {st.photoUrl ? (
                                <img src={st.photoUrl} alt={st.name} className="student-cell-img" />
                              ) : (
                                <span className="student-cell-initials">{getInitials(st.name)}</span>
                              )}
                            </div>
                            <div className="student-cell-text">
                              <strong className="student-table-name">{st.name}</strong>
                              <span className="student-table-email">{st.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Kolom Sekolah & Kelas */}
                        <td>
                          <div className="student-academic-cell">
                            <span className="student-school-text">{st.school || 'SMA Negeri 1 Edukasi'}</span>
                            <span className="student-grade-pill">
                              Kelas {st.grade || 'XI'} {st.major ? `(${st.major})` : ''}
                            </span>
                          </div>
                        </td>

                        {/* Kolom Progres 5E */}
                        <td>
                          <div className="student-progress-cell">
                            <div className="progress-bar-mini-track">
                              <div 
                                className="progress-bar-mini-fill" 
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className={`progress-badge-pill ${completedCount >= 5 ? 'complete' : ''}`}>
                              {completedCount}/5 Tahap ({progressPercent}%)
                            </span>
                          </div>
                        </td>

                        {/* Kolom Nilai Kuis */}
                        <td>
                          <span className={`score-badge ${score >= 75 ? 'high' : score > 0 ? 'medium' : 'zero'}`}>
                            {score > 0 ? `${score} / 100` : 'Belum Kuis'}
                          </span>
                        </td>

                        {/* Kolom Aksi: Detail Aktivitas */}
                        <td>
                          <button
                            type="button"
                            className="btn-view-student-activity"
                            onClick={() => setSelectedStudentForDetail(st)}
                            title={`Lihat detail aktivitas pembelajaran ${st.name}`}
                          >
                            <span>👁️ Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-box">
              <span className="empty-icon">👥</span>
              <p>Tidak ada siswa yang sesuai dengan kriteria pencarian.</p>
            </div>
          )}
        </section>

        {/* Kolom Kanan: Panduan Kurikulum 5E & Aksi Cepat */}
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
                  <p>Eksplorasi zat sehari-hari (lemon, cuka, sabun) dan prediksi hipotesis awal siswa.</p>
                </div>
              </li>
              <li className="curriculum-step-item">
                <span className="step-badge-number">2</span>
                <div>
                  <strong>Explore (Eksplorasi)</strong>
                  <p>Laboratorium virtual skala pH, konsentrasi ion [H⁺]/[OH⁻], dan simulasi interaktif.</p>
                </div>
              </li>
              <li className="curriculum-step-item">
                <span className="step-badge-number">3</span>
                <div>
                  <strong>Explain (Penjelasan)</strong>
                  <p>Teori asam-basa Arrhenius, Brønsted-Lowry, Lewis, serta tetapan kesetimbangan.</p>
                </div>
              </li>
              <li className="curriculum-step-item">
                <span className="step-badge-number">4</span>
                <div>
                  <strong>Elaborate (Elaborasi)</strong>
                  <p>Aplikasi kontekstual: pengasaman laut, bahan rumah tangga, dan keasaman minuman.</p>
                </div>
              </li>
              <li className="curriculum-step-item">
                <span className="step-badge-number">5</span>
                <div>
                  <strong>Evaluate (Evaluasi)</strong>
                  <p>Uji pemahaman kuis 10 butir soal kimia komprehensif dan catatan refleksi siswa.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* Aksi Cepat Pendidik */}
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
                <span>👤 Kelola Biodata &amp; Sekolah Pendidik</span>
                <span className="arrow-icon">→</span>
              </button>
              {onPreviewStudentModule && (
                <button 
                  type="button" 
                  className="btn-shortcut-item" 
                  onClick={onPreviewStudentModule}
                >
                  <span>🔬 Pratinjau Modul Siswa 5E (Mode Tinjau)</span>
                  <span className="arrow-icon">→</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* =========================================================================
          MODAL DETAIL AKTIVITAS & REFLEKSI SISWA
         ========================================================================= */}
      {selectedStudentForDetail && (
        <div 
          className="modal-backdrop detail-modal-backdrop"
          onClick={() => setSelectedStudentForDetail(null)}
        >
          <div 
            className="modal-card student-detail-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">📋</span>
                <div>
                  <h3>Aktivitas Pembelajaran: {selectedStudentForDetail.name}</h3>
                  <span className="modal-subtitle-email">{selectedStudentForDetail.email}</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setSelectedStudentForDetail(null)}
                aria-label="Tutup Detail Siswa"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="student-detail-modal-body">
              {/* Profil Akademik Singkat */}
              <div className="modal-profile-summary-box">
                <div className="summary-col">
                  <span className="summary-label">Sekolah</span>
                  <strong className="summary-val">{selectedStudentForDetail.school || 'SMA Negeri 1 Edukasi'}</strong>
                </div>
                <div className="summary-col">
                  <span className="summary-label">Kelas / Jurusan</span>
                  <strong className="summary-val">
                    Kelas {selectedStudentForDetail.grade || 'XI'} ({selectedStudentForDetail.major || 'MIPA'})
                  </strong>
                </div>
                <div className="summary-col">
                  <span className="summary-label">No. Absen</span>
                  <strong className="summary-val">{selectedStudentForDetail.attendanceNumber || '-'}</strong>
                </div>
                <div className="summary-col">
                  <span className="summary-label">Peran Sistem</span>
                  <span className="role-tag-student">Siswa</span>
                </div>
              </div>

              {selectedStudentForDetail.bio && (
                <div className="student-bio-quote">
                  <span className="quote-label">Bio Siswa:</span>
                  <p>"{selectedStudentForDetail.bio}"</p>
                </div>
              )}

              {/* Status 5 Tahap Pembelajaran (5E) */}
              <div className="modal-5e-activity-section">
                <h4>Kemajuan Model Pembelajaran 5E</h4>
                <div className="activity-steps-grid">
                  {/* Step 1: Engage */}
                  <div className={`activity-step-card ${(selectedStudentForDetail.completedSteps || []).includes(1) ? 'done' : ''}`}>
                    <div className="step-card-header">
                      <span className="step-tag">Tahap 1</span>
                      <span className="step-status">
                        {(selectedStudentForDetail.completedSteps || []).includes(1) ? '✓ Selesai' : 'Belum'}
                      </span>
                    </div>
                    <strong>Engage (Apersepsi)</strong>
                    <div className="step-content-box">
                      {selectedStudentForDetail.userPrediction ? (
                        <>
                          <span className="box-label">Prediksi Awal:</span>
                          <p className="prediction-text">
                            "{selectedStudentForDetail.userPrediction.optionText || selectedStudentForDetail.userPrediction.optionId || 'Sudah membuat prediksi awal.'}"
                          </p>
                          {selectedStudentForDetail.userPrediction.note && (
                            <small className="prediction-note">
                              Catatan: {selectedStudentForDetail.userPrediction.note}
                            </small>
                          )}
                        </>
                      ) : (
                        <span className="text-muted">Belum mengisi prediksi fenomena.</span>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Explore */}
                  <div className={`activity-step-card ${(selectedStudentForDetail.completedSteps || []).includes(2) ? 'done' : ''}`}>
                    <div className="step-card-header">
                      <span className="step-tag">Tahap 2</span>
                      <span className="step-status">
                        {(selectedStudentForDetail.completedSteps || []).includes(2) ? '✓ Selesai' : 'Belum'}
                      </span>
                    </div>
                    <strong>Explore (Lab Virtual)</strong>
                    <div className="step-content-box">
                      <p>
                        {(selectedStudentForDetail.completedSteps || []).includes(2)
                          ? 'Siswa telah menyelesaikan eksplorasi laboratorium simulasi konsentrasi ion dan skala pH.'
                          : 'Belum menyelesaikan simulasi laboratorium.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Explain */}
                  <div className={`activity-step-card ${(selectedStudentForDetail.completedSteps || []).includes(3) ? 'done' : ''}`}>
                    <div className="step-card-header">
                      <span className="step-tag">Tahap 3</span>
                      <span className="step-status">
                        {(selectedStudentForDetail.completedSteps || []).includes(3) ? '✓ Selesai' : 'Belum'}
                      </span>
                    </div>
                    <strong>Explain (Konsep &amp; Teori)</strong>
                    <div className="step-content-box">
                      <p>
                        {(selectedStudentForDetail.completedSteps || []).includes(3)
                          ? 'Siswa telah menelaah teori asam-basa Arrhenius, Brønsted-Lowry, dan Lewis.'
                          : 'Belum menuntaskan materi teori kimia.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Elaborate */}
                  <div className={`activity-step-card ${(selectedStudentForDetail.completedSteps || []).includes(4) ? 'done' : ''}`}>
                    <div className="step-card-header">
                      <span className="step-tag">Tahap 4</span>
                      <span className="step-status">
                        {(selectedStudentForDetail.completedSteps || []).includes(4) ? '✓ Selesai' : 'Belum'}
                      </span>
                    </div>
                    <strong>Elaborate (Penerapan)</strong>
                    <div className="step-content-box">
                      <p>
                        {(selectedStudentForDetail.completedSteps || []).includes(4)
                          ? 'Siswa telah mengerjakan studi kasus kontekstual asam-basa dalam kehidupan nyata.'
                          : 'Belum menyelesaikan studi kasus kontekstual.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 5: Evaluate */}
                  <div className={`activity-step-card ${(selectedStudentForDetail.completedSteps || []).includes(5) ? 'done' : ''}`}>
                    <div className="step-card-header">
                      <span className="step-tag">Tahap 5</span>
                      <span className="step-status">
                        {(selectedStudentForDetail.completedSteps || []).includes(5) ? '✓ Selesai' : 'Belum'}
                      </span>
                    </div>
                    <strong>Evaluate (Kuis &amp; Skor)</strong>
                    <div className="step-content-box">
                      <div className="quiz-result-score-highlight">
                        <span className="score-label">Perolehan Nilai:</span>
                        <span className={`score-digit ${(selectedStudentForDetail.quizScore || 0) >= 75 ? 'text-success' : 'text-warning'}`}>
                          {selectedStudentForDetail.quizScore ?? 0} / 100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refleksi Siswa */}
              <div className="modal-reflection-section">
                <h4>Refleksi Pembelajaran Siswa</h4>
                <div className="reflection-card-box">
                  {selectedStudentForDetail.studentReflection ? (
                    <p className="student-reflection-text">
                      "{selectedStudentForDetail.studentReflection}"
                    </p>
                  ) : (
                    <span className="text-muted">Siswa belum menuliskan catatan refleksi belajar kimia.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setSelectedStudentForDetail(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
