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
import { getActiveSession, logoutUser } from './utils/auth';
import './App.css';

export default function App() {
  // 0. Autentikasi Pengguna & Proteksi Dashboard
  const [currentUser, setCurrentUser] = useState(() => {
    return getActiveSession();
  });

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

  // Sinkronisasi status autentikasi berkala jika tab lain logout
  useEffect(() => {
    const handleStorageChange = () => {
      const session = getActiveSession();
      setCurrentUser(session);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sinkronisasi modul pembelajaran ke localStorage setiap ada perubahan
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chem_current_step', currentStep.toString());
    }
  }, [currentStep, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chem_completed_steps', JSON.stringify(completedSteps));
    }
  }, [completedSteps, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chem_user_prediction', JSON.stringify(userPrediction));
    }
  }, [userPrediction, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chem_elaborate_progress', JSON.stringify(elaborateProgress));
    }
  }, [elaborateProgress, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chem_quiz_answers', JSON.stringify(quizAnswers));
    }
  }, [quizAnswers, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chem_quiz_score', quizScore.toString());
    }
  }, [quizScore, currentUser]);

  // Handler Sukses Login
  const handleLoginSuccess = (userSession) => {
    setCurrentUser(userSession);
    // Langsung arahkan pengguna ke Dashboard CHEMIFY
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler Logout
  const handleLogout = () => {
    if (window.confirm(`Hai ${currentUser?.name || 'Siswa'}, apakah kamu yakin ingin keluar dari akun Chemify?`)) {
      logoutUser();
      setCurrentUser(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll ke atas saat berpindah tahap
  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markCompletedAndNext = (fromStep, nextStep) => {
    if (!completedSteps.includes(fromStep)) {
      setCompletedSteps((prev) => [...prev, fromStep]);
    }
    goToStep(nextStep);
  };

  // Reset progress modul pembelajaran
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // PROTEKSI DASHBOARD: Jika belum terautentikasi, tampilkan halaman Login & Registrasi
  if (!currentUser) {
    return (
      <div className="app-layout auth-layout">
        <Auth onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // JIKA SUDAH LOGIN: Tampilkan Dashboard CHEMIFY & Alur Pembelajaran 5E
  return (
    <div className="app-layout">
      {/* Navbar Atas dengan info Profil Pengguna & Tombol Logout */}
      <Navbar 
        currentStep={currentStep} 
        setStep={goToStep} 
        onReset={handleReset}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

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

      {/* Footer Aplikasi */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>© <strong>Chemify</strong> — Web Pembelajaran Kimia Asam-Basa Berbasis Model 5E (SMA Kelas XI)</p>
          <span className="footer-subtext">Dirancang untuk pemahaman konsep abstrak secara visual dan bermakna.</span>
        </div>
      </footer>
    </div>
  );
}
