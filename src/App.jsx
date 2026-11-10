import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProgressBar from './components/ProgressBar';
import Home from './pages/Home';
import Engage from './pages/Engage';
import Explore from './pages/Explore';
import Explain from './pages/Explain';
import Elaborate from './pages/Elaborate';
import Evaluate from './pages/Evaluate';
import Results from './pages/Results';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import TeacherAuth from './pages/TeacherAuth';
import TeacherProfile from './pages/TeacherProfile';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherNavbar from './components/TeacherNavbar';
import { getActiveSession, logoutUser } from './utils/auth';
import './App.css';

export default function App() {
  // 0. Autentikasi Pengguna & Proteksi Dashboard
  const [currentUser, setCurrentUser] = useState(() => {
    return getActiveSession();
  });

  // Routing berbasis browser path: '/', '/guru/login', '/guru/profil', '/guru/dashboard'
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname.toLowerCase() || '/';
  });

  // Tampilan Halaman Profil Pengguna vs Dashboard Pembelajaran (Khusus Siswa)
  const [isProfileView, setIsProfileView] = useState(false);

  // Status mode pratinjau modul siswa bagi guru
  const [isTeacherPreviewingStudent, setIsTeacherPreviewingStudent] = useState(false);

  // 1. Current Step: 0 = Home, 1 = Engage, 2 = Explore, 3 = Explain, 4 = Elaborate, 5 = Evaluate, 6 = Results
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('chem_current_step');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // 2. Completed Steps list
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('chem_completed_steps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. User Prediction (Engage)
  const [userPrediction, setUserPrediction] = useState(() => {
    try {
      const saved = localStorage.getItem('chem_user_prediction');
      return saved ? JSON.parse(saved) : { optionId: '', optionText: '', note: '' };
    } catch {
      return { optionId: '', optionText: '', note: '' };
    }
  });

  // 4. Elaborate Progress
  const [elaborateProgress, setElaborateProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('chem_elaborate_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 5. Quiz Answers & Score (Evaluate)
  const [quizAnswers, setQuizAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('chem_quiz_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [quizScore, setQuizScore] = useState(() => {
    const saved = localStorage.getItem('chem_quiz_score');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // Helper Navigasi URL Browser
  const navigate = (path) => {
    if (window.location.pathname.toLowerCase() !== path.toLowerCase()) {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(path.toLowerCase());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sinkronisasi navigasi tombol Back/Forward browser
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase() || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sinkronisasi status autentikasi berkala jika tab lain logout
  useEffect(() => {
    const handleStorageChange = () => {
      const session = getActiveSession();
      setCurrentUser(session);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ROLE-BASED ACCESS CONTROL (RBAC) GUARDS:
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser && !isTeacher;
  const isTeacherRoute = currentPath.startsWith('/guru');

  // Guard: Cegah siswa mengakses halaman profil guru atau rute khusus guru
  useEffect(() => {
    if (isStudent && isTeacherRoute) {
      alert('Akses Ditolak: Halaman ini khusus diperuntukkan bagi akun Guru/Pendidik.');
      setTimeout(() => {
        navigate('/');
      }, 0);
    }
  }, [isStudent, isTeacherRoute]);

  // Sinkronisasi modul pembelajaran ke localStorage setiap ada perubahan (Khusus Siswa)
  useEffect(() => {
    if (currentUser && !isTeacher) {
      localStorage.setItem('chem_current_step', currentStep.toString());
    }
  }, [currentStep, currentUser, isTeacher]);

  useEffect(() => {
    if (currentUser && !isTeacher) {
      localStorage.setItem('chem_completed_steps', JSON.stringify(completedSteps));
    }
  }, [completedSteps, currentUser, isTeacher]);

  useEffect(() => {
    if (currentUser && !isTeacher) {
      localStorage.setItem('chem_user_prediction', JSON.stringify(userPrediction));
    }
  }, [userPrediction, currentUser, isTeacher]);

  useEffect(() => {
    if (currentUser && !isTeacher) {
      localStorage.setItem('chem_elaborate_progress', JSON.stringify(elaborateProgress));
    }
  }, [elaborateProgress, currentUser, isTeacher]);

  useEffect(() => {
    if (currentUser && !isTeacher) {
      localStorage.setItem('chem_quiz_answers', JSON.stringify(quizAnswers));
    }
  }, [quizAnswers, currentUser, isTeacher]);

  useEffect(() => {
    if (currentUser && !isTeacher) {
      localStorage.setItem('chem_quiz_score', quizScore.toString());
    }
  }, [quizScore, currentUser, isTeacher]);

  // Handler Sukses Login Siswa
  const handleLoginSuccess = (userSession) => {
    setCurrentUser(userSession);
    setIsProfileView(false);
    if (userSession.role === 'teacher') {
      navigate('/guru/profil');
      return;
    }
    setCurrentStep(0);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler Sukses Login Guru
  const handleTeacherLoginSuccess = (teacherSession) => {
    setCurrentUser(teacherSession);
    navigate('/guru/profil');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler Logout Siswa
  const handleLogout = () => {
    if (window.confirm(`Hai ${currentUser?.name || 'Siswa'}, apakah kamu yakin ingin keluar dari akun Chemify?`)) {
      logoutUser();
      setCurrentUser(null);
      setIsProfileView(false);
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handler Logout Guru
  const handleTeacherLogout = () => {
    if (window.confirm(`Bapak/Ibu ${currentUser?.name || 'Guru'}, apakah Anda yakin ingin keluar dari akun Chemify?`)) {
      logoutUser();
      setCurrentUser(null);
      setIsTeacherPreviewingStudent(false);
      navigate('/guru/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll ke atas saat berpindah tahap belajar
  const goToStep = (step) => {
    setIsProfileView(false);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markCompletedAndNext = (fromStep, nextStep) => {
    if (!completedSteps.includes(fromStep)) {
      setCompletedSteps((prev) => [...prev, fromStep]);
    }
    goToStep(nextStep);
  };

  // Reset progress modul pembelajaran siswa
  const handleReset = () => {
    if (window.confirm('Apakah kamu yakin ingin mengulang seluruh modul pembelajaran dari awal? Progress kuis dan simulasi akan direset.')) {
      localStorage.removeItem('chem_current_step');
      localStorage.removeItem('chem_completed_steps');
      localStorage.removeItem('chem_user_prediction');
      localStorage.removeItem('chem_elaborate_progress');
      localStorage.removeItem('chem_quiz_answers');
      localStorage.removeItem('chem_quiz_score');
      localStorage.removeItem('student_reflection');

      setCurrentStep(0);
      setCompletedSteps([]);
      setUserPrediction({ optionId: '', optionText: '', note: '' });
      setElaborateProgress({});
      setQuizAnswers({});
      setQuizScore(0);
      setIsProfileView(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Buka Halaman Profil Pengguna Siswa
  const handleOpenProfile = () => {
    setIsProfileView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update data pengguna lokal saat profil siswa berhasil disimpan
  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser((prev) => ({
      ...prev,
      name: updatedUser.name,
      photoUrl: updatedUser.photoUrl
    }));
  };

  // Update data pengguna lokal saat profil guru berhasil disimpan
  const handleTeacherProfileUpdated = (updatedTeacher) => {
    setCurrentUser((prev) => ({
      ...prev,
      name: updatedTeacher.name,
      photoUrl: updatedTeacher.photoUrl,
      school: updatedTeacher.school,
      subject: updatedTeacher.subject
    }));
  };

  // =========================================================================
  // KASUS 1: BELUM TERAUTENTIKASI (UNAUTHENTICATED)
  // =========================================================================
  if (!currentUser) {
    // Jika mengakses URL portal guru: /guru/login atau /guru/register atau /guru/profil
    if (isTeacherRoute) {
      return (
        <div className="app-layout auth-layout">
          <TeacherAuth 
            key={currentPath.includes('register') ? 'register' : 'login'}
            onLoginSuccess={handleTeacherLoginSuccess} 
            onNavigate={navigate}
            initialMode={currentPath.includes('register') ? 'register' : 'login'}
          />
        </div>
      );
    }

    // Jika mengakses halaman utama: Tampilkan Auth siswa (unmodified) + Switcher Banner
    return (
      <div className="app-layout auth-layout">
        {/* Floating Switcher Link ke Portal Guru tanpa mengubah komponen Auth.jsx */}
        <div className="portal-switcher-top-banner">
          <span className="portal-banner-icon">👨‍🏫</span>
          <span className="portal-banner-text">Apakah Anda seorang Pendidik atau Guru Kimia?</span>
          <button 
            type="button" 
            className="portal-banner-btn" 
            onClick={() => navigate('/guru/login')}
          >
            Masuk Portal Guru di Sini →
          </button>
        </div>

        <Auth onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // =========================================================================
  // KASUS 2: PENGGUNA TERAUTENTIKASI SEBAGAI GURU (TEACHER)
  // =========================================================================
  if (isTeacher) {
    // Jika Guru sedang mengaktifkan mode pratinjau modul pembelajaran siswa 5E
    if (isTeacherPreviewingStudent) {
      return (
        <div className="app-layout teacher-preview-layout">
          {/* Banner Peringatan Mode Pratinjau Guru */}
          <div className="teacher-preview-banner">
            <div className="preview-banner-text">
              <span className="preview-badge">MODE PRATINJAU GURU</span>
              <span>Anda sedang meninjau materi dan kuis modul siswa secara langsung.</span>
            </div>
            <button 
              type="button" 
              className="btn-exit-preview"
              onClick={() => setIsTeacherPreviewingStudent(false)}
            >
              ← Kembali ke Dashboard Guru
            </button>
          </div>

          <Navbar 
            _currentStep={currentStep} 
            setStep={goToStep} 
            onReset={handleReset}
            currentUser={currentUser}
            onLogout={handleTeacherLogout}
            onOpenProfile={() => {
              setIsTeacherPreviewingStudent(false);
              navigate('/guru/profil');
            }}
            isProfileActive={false}
          />

          <ProgressBar 
            currentStep={currentStep} 
            setStep={goToStep} 
            completedSteps={completedSteps} 
          />

          <main className="main-content">
            {currentStep === 0 && <Home onStart={() => goToStep(1)} />}
            {currentStep === 1 && (
              <Engage
                onPrev={() => goToStep(0)}
                onNext={() => markCompletedAndNext(1, 2)}
                userPrediction={userPrediction}
                setUserPrediction={setUserPrediction}
              />
            )}
            {currentStep === 2 && (
              <Explore onPrev={() => goToStep(1)} onNext={() => markCompletedAndNext(2, 3)} />
            )}
            {currentStep === 3 && (
              <Explain onPrev={() => goToStep(2)} onNext={() => markCompletedAndNext(3, 4)} />
            )}
            {currentStep === 4 && (
              <Elaborate
                onPrev={() => goToStep(3)}
                onNext={() => markCompletedAndNext(4, 5)}
                elaborateProgress={elaborateProgress}
                setElaborateProgress={setElaborateProgress}
              />
            )}
            {currentStep === 5 && (
              <Evaluate
                onPrev={() => goToStep(4)}
                onComplete={() => markCompletedAndNext(5, 6)}
                quizAnswers={quizAnswers}
                setQuizAnswers={setQuizAnswers}
                quizScore={quizScore}
                setQuizScore={setQuizScore}
              />
            )}
            {currentStep === 6 && (
              <Results
                quizScore={quizScore}
                quizAnswers={quizAnswers}
                userPrediction={userPrediction}
                elaborateProgress={elaborateProgress}
                onReset={handleReset}
              />
            )}
          </main>
        </div>
      );
    }

    // Tampilan Standar Guru: Halaman Profil Guru ATAU Dashboard Guru
    return (
      <div className="app-layout teacher-layout">
        {/* Navbar Khusus Guru */}
        <TeacherNavbar 
          currentUser={currentUser} 
          currentPath={currentPath}
          onNavigate={navigate}
          onLogout={handleTeacherLogout}
        />

        <main className="main-content teacher-main-content">
          {currentPath === '/guru/profil' ? (
            <TeacherProfile 
              key={currentUser.id}
              currentUser={currentUser}
              onNavigate={navigate}
              onProfileUpdated={handleTeacherProfileUpdated}
              onLogout={handleTeacherLogout}
            />
          ) : (
            <TeacherDashboard 
              key={currentUser.id}
              currentUser={currentUser}
              onNavigate={navigate}
              onPreviewStudentModule={() => setIsTeacherPreviewingStudent(true)}
            />
          )}
        </main>

        <footer className="app-footer teacher-footer">
          <div className="footer-content">
            <p>© <strong>Chemify 5E</strong> — Portal Manajemen & Pembelajaran Guru Kimia (SMA Kelas XI)</p>
            <span className="footer-subtext">Mendukung dedikasi para pendidik dalam menyajikan konsep kimia yang abstrak secara interaktif dan visual.</span>
          </div>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // KASUS 3: PENGGUNA TERAUTENTIKASI SEBAGAI SISWA (STUDENT)
  // Fitur, alur, dan komponen siswa 100% dipertahankan tanpa perubahan
  // =========================================================================
  return (
    <div className="app-layout">
      {/* Navbar Atas dengan info Profil Siswa, Ikon Profil, & Tombol Logout */}
      <Navbar 
        _currentStep={currentStep} 
        setStep={goToStep} 
        onReset={handleReset}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={handleOpenProfile}
        isProfileActive={isProfileView}
      />

      {/* Konten Halaman: Menampilkan Profil Siswa ATAU Modul Pembelajaran 5E */}
      {isProfileView ? (
        <main className="main-content">
          <Profile 
            key={currentUser.id}
            currentUser={currentUser}
            onBack={() => goToStep(currentStep)}
            onProfileUpdated={handleProfileUpdated}
            quizScore={quizScore}
            completedSteps={completedSteps}
          />
        </main>
      ) : (
        <>
          {/* Stepper Progress Bar 5E */}
          <ProgressBar 
            currentStep={currentStep} 
            setStep={goToStep} 
            completedSteps={completedSteps} 
          />

          {/* Halaman Pembelajaran Sesuai Step */}
          <main className="main-content">
            {currentStep === 0 && (
              <Home 
                onStart={() => goToStep(1)} 
              />
            )}

            {currentStep === 1 && (
              <Engage
                onPrev={() => goToStep(0)}
                onNext={() => markCompletedAndNext(1, 2)}
                userPrediction={userPrediction}
                setUserPrediction={setUserPrediction}
              />
            )}

            {currentStep === 2 && (
              <Explore
                onPrev={() => goToStep(1)}
                onNext={() => markCompletedAndNext(2, 3)}
              />
            )}

            {currentStep === 3 && (
              <Explain
                onPrev={() => goToStep(2)}
                onNext={() => markCompletedAndNext(3, 4)}
              />
            )}

            {currentStep === 4 && (
              <Elaborate
                onPrev={() => goToStep(3)}
                onNext={() => markCompletedAndNext(4, 5)}
                elaborateProgress={elaborateProgress}
                setElaborateProgress={setElaborateProgress}
              />
            )}

            {currentStep === 5 && (
              <Evaluate
                onPrev={() => goToStep(4)}
                onComplete={() => markCompletedAndNext(5, 6)}
                quizAnswers={quizAnswers}
                setQuizAnswers={setQuizAnswers}
                quizScore={quizScore}
                setQuizScore={setQuizScore}
              />
            )}

            {currentStep === 6 && (
              <Results
                quizScore={quizScore}
                quizAnswers={quizAnswers}
                userPrediction={userPrediction}
                elaborateProgress={elaborateProgress}
                onReset={handleReset}
              />
            )}
          </main>
        </>
      )}

      {/* Footer Aplikasi Siswa */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>© <strong>Chemify</strong> — Web Pembelajaran Kimia Asam-Basa Berbasis Model 5E (SMA Kelas XI)</p>
          <span className="footer-subtext">Dirancang untuk pemahaman konsep abstrak secara visual dan bermakna.</span>
        </div>
      </footer>
    </div>
  );
}
