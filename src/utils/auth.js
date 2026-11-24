/**
 * Modul Autentikasi dan Pengelolaan Sesi CHEMIFY
 * Mendukung Firebase Authentication (Cloud) secara otomatis saat konfigurasi tersedia,
 * serta mode Fallback Kriptografi Lokal (Web Crypto SHA-256 + Salt) saat offline/kunci belum diset.
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase.js';
import { 
  saveUserProfile, 
  AUTHORIZED_TEACHER_EMAILS, 
  isAuthorizedTeacherEmail 
} from '../services/firestoreService.js';

const USERS_STORAGE_KEY = 'chem_users';
const SESSION_STORAGE_KEY = 'chem_auth_session';

export { AUTHORIZED_TEACHER_EMAILS, isAuthorizedTeacherEmail };

/**
 * Menghasilkan kunci localStorage yang terisolasi dengan namespace per-user / guest
 * Mencegah kebocoran progres belajar antar akun di peramban yang sama
 */
export function getUserStorageKey(userId, key) {
  const prefix = userId ? `chem_${userId}_` : 'chem_guest_';
  return `${prefix}${key}`;
}

/**
 * State default pembelajaran siswa (bersih / kosong)
 */
export function getDefaultStudentState() {
  return {
    currentStep: 0,
    completedSteps: [],
    userPrediction: { optionId: '', optionText: '', note: '' },
    elaborateProgress: {},
    quizAnswers: {},
    quizScore: 0,
    studentReflection: ''
  };
}

/**
 * Membaca seluruh data pembelajaran lokal yang telah ber-namespace untuk pengguna tertentu
 */
export function getStudentLocalState(userId) {
  try {
    const currentStepRaw = localStorage.getItem(getUserStorageKey(userId, 'current_step'));
    const completedStepsRaw = localStorage.getItem(getUserStorageKey(userId, 'completed_steps'));
    const userPredictionRaw = localStorage.getItem(getUserStorageKey(userId, 'user_prediction'));
    const elaborateProgressRaw = localStorage.getItem(getUserStorageKey(userId, 'elaborate_progress'));
    const quizAnswersRaw = localStorage.getItem(getUserStorageKey(userId, 'quiz_answers'));
    const quizScoreRaw = localStorage.getItem(getUserStorageKey(userId, 'quiz_score'));
    const studentReflectionRaw = localStorage.getItem(getUserStorageKey(userId, 'student_reflection'));

    return {
      currentStep: currentStepRaw !== null ? parseInt(currentStepRaw, 10) || 0 : 0,
      completedSteps: completedStepsRaw ? JSON.parse(completedStepsRaw) : [],
      userPrediction: userPredictionRaw ? JSON.parse(userPredictionRaw) : { optionId: '', optionText: '', note: '' },
      elaborateProgress: elaborateProgressRaw ? JSON.parse(elaborateProgressRaw) : {},
      quizAnswers: quizAnswersRaw ? JSON.parse(quizAnswersRaw) : {},
      quizScore: quizScoreRaw !== null ? parseInt(quizScoreRaw, 10) || 0 : 0,
      studentReflection: studentReflectionRaw || ''
    };
  } catch (err) {
    console.warn('Gagal membaca state lokal siswa:', err);
    return getDefaultStudentState();
  }
}

/**
 * Menyimpan field spesifik ke storage lokal ber-namespace
 */
export function setStudentLocalField(userId, key, value) {
  try {
    const storageKey = getUserStorageKey(userId, key);
    if (value === undefined || value === null) {
      localStorage.removeItem(storageKey);
    } else if (typeof value === 'object') {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } else {
      localStorage.setItem(storageKey, String(value));
    }
  } catch (e) {
    console.warn('Gagal menyimpan field lokal siswa:', e);
  }
}

/**
 * Menerjemahkan kode error Firebase Auth ke pesan Bahasa Indonesia yang ramah pengguna
 */
function mapFirebaseError(err) {
  const code = err?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Alamat email sudah terdaftar. Silakan masuk atau gunakan email lain.';
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi tidak sesuai.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter kombinasi huruf dan angka.';
    case 'auth/too-many-requests':
      return 'Akses diblokir sementara karena terlalu banyak percobaan gagal. Silakan coba beberapa saat lagi.';
    case 'auth/network-request-failed':
      return 'Koneksi jaringan gagal. Periksa koneksi internet kamu.';
    default:
      return err?.message || 'Terjadi kesalahan pada layanan autentikasi.';
  }
}

/**
 * Mengonversi ArrayBuffer ke string heksadesimal (Web Crypto Utility)
 */
function bufferToHex(buffer) {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Menghasilkan salt acak menggunakan Web Crypto API
 */
export function generateSalt() {
  const randomBytes = new Uint8Array(16);
  window.crypto.getRandomValues(randomBytes);
  return bufferToHex(randomBytes);
}

/**
 * Menghitung hash SHA-256 dari password + salt
 */
export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:chemify_salt_secret`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Mengambil daftar seluruh pengguna dari localStorage
 */
export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Gagal membaca data pengguna:', err);
    return [];
  }
}

/**
 * Menyimpan daftar pengguna ke localStorage
 */
function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Mencari pengguna berdasarkan email (case-insensitive)
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const users = getRegisteredUsers();
  return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

/**
 * Inisialisasi akun demo bawaan (Offline / Fallback Storage)
 * Menetapkan email karenina.zulfa.2403316@students.um.ac.id sebagai akun Guru (Teacher)
 */
export async function initDefaultDemoUser() {
  const users = getRegisteredUsers();
  let modified = false;

  // 1. Akun Guru Resmi: karenina.zulfa.2403316@students.um.ac.id (RBAC: Teacher)
  const teacherEmail = 'karenina.zulfa.2403316@students.um.ac.id';
  let teacherUser = users.find(u => u.email.toLowerCase() === teacherEmail.toLowerCase());
  if (!teacherUser) {
    const teacherSalt = generateSalt();
    const teacherHash = await hashPassword('Guru123!', teacherSalt);
    teacherUser = {
      id: 'teacher_karenina_1',
      name: 'Karenina Zulfa, S.Pd.',
      email: teacherEmail,
      role: 'teacher',
      salt: teacherSalt,
      passwordHash: teacherHash,
      school: 'SMA Negeri 1 Edukasi',
      subject: 'Kimia SMA',
      accountStatus: 'Aktif',
      bio: 'Guru Kimia SMA pengampu media pembelajaran asam-basa 5E CHEMIFY.',
      photoUrl: '',
      createdAt: new Date().toISOString()
    };
    users.push(teacherUser);
    modified = true;
  } else if (teacherUser.role !== 'teacher') {
    teacherUser.role = 'teacher';
    modified = true;
  }

  // Akun Demo Guru Cadangan
  const demoTeacherEmail = 'guru@chemify.edu';
  let demoTeacher = users.find(u => u.email.toLowerCase() === demoTeacherEmail.toLowerCase());
  if (!demoTeacher) {
    const dSalt = generateSalt();
    const dHash = await hashPassword('Guru123!', dSalt);
    users.push({
      id: 'user_demo_guru_1',
      name: 'Budi Santoso, S.Pd., M.Si.',
      email: demoTeacherEmail,
      role: 'teacher',
      salt: dSalt,
      passwordHash: dHash,
      school: 'SMA Negeri 1 Edukasi',
      subject: 'Kimia SMA',
      accountStatus: 'Aktif',
      bio: 'Guru Kimia SMA pengembang modul asam-basa 5E.',
      photoUrl: '',
      createdAt: new Date().toISOString()
    });
    modified = true;
  }

  // 2. Akun Siswa Demo
  const studentEmail = 'siswa@chemify.edu';
  let studentUser = users.find(u => u.email.toLowerCase() === studentEmail.toLowerCase());
  if (!studentUser) {
    const defaultSalt = generateSalt();
    const defaultHash = await hashPassword('Siswa123!', defaultSalt);
    studentUser = {
      id: 'user_demo_chemify_1',
      name: 'Siswa Chemify',
      email: studentEmail,
      role: 'student',
      salt: defaultSalt,
      passwordHash: defaultHash,
      school: 'SMA Negeri 1 Edukasi',
      educationLevel: 'SMA',
      grade: 'XI',
      major: 'MIPA (Matematika & IPA)',
      attendanceNumber: '01',
      bio: 'Siswa antusias kimia yang sedang mempelajari modul asam-basa 5E.',
      photoUrl: '',
      createdAt: new Date().toISOString()
    };
    users.push(studentUser);
    modified = true;
  } else if (!studentUser.role) {
    studentUser.role = 'student';
    modified = true;
  }

  if (modified) {
    saveUsers(users);
  }

  // Inisialisasi aktivitas belajar siswa demo jika belum ada
  if (!localStorage.getItem('chem_progress_user_demo_chemify_1')) {
    localStorage.setItem('chem_progress_user_demo_chemify_1', JSON.stringify({
      userId: 'user_demo_chemify_1',
      userName: 'Siswa Chemify',
      userEmail: 'siswa@chemify.edu',
      currentStep: 3,
      completedSteps: [1, 2, 3],
      userPrediction: {
        optionId: 'lemon_vinegar_acid',
        optionText: 'Lemon dan cuka bersifat asam karena melepaskan ion H⁺ berlebih.',
        note: 'Berdasarkan pengamatan rasa masam dan uji kertas lakmus.'
      },
      elaborateProgress: {
        case1Completed: true,
        case2Completed: true
      },
      quizAnswers: {},
      quizScore: 85,
      studentReflection: 'Sangat terbantu memahami visualisasi ion H+ dan OH- melalui simulasi interaktif.',
      updatedAt: new Date().toISOString()
    }));
  }
}

/**
 * Validasi kekuatan password:
 * - Minimal 8 karakter
 * - Memiliki setidaknya 1 huruf dan 1 angka
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password wajib diisi.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password harus memiliki minimal 8 karakter.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: 'Password harus mengombinasikan minimal huruf dan angka.' };
  }
  return { isValid: true, message: 'Password memenuhi ketentuan keamanan.' };
}

/**
 * Validasi format email sederhana menggunakan regex
 */
export function validateEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Mendaftarkan akun baru (Register Umum)
 * Penetapan Role Aman (RBAC):
 * - Secara default, seluruh pendaftar memiliki role: 'student'.
 * - Hanya jika email terdaftar pada whitelist guru resmi (karenina.zulfa.2403316@students.um.ac.id) maka ditetapkan role: 'teacher'.
 */
export async function registerUser({ name, email, password, confirmPassword }) {
  const trimmedName = (name || '').trim();
  const trimmedEmail = (email || '').trim().toLowerCase();

  // Validasi seluruh kolom wajib diisi
  if (!trimmedName) throw new Error('Nama Lengkap wajib diisi.');
  if (!trimmedEmail) throw new Error('Email wajib diisi.');
  if (!password) throw new Error('Password wajib diisi.');
  if (!confirmPassword) throw new Error('Konfirmasi Password wajib diisi.');

  // Validasi format email
  if (!validateEmailFormat(trimmedEmail)) {
    throw new Error('Format email tidak valid (contoh: nama@domain.com).');
  }

  // Validasi kecocokan password
  if (password !== confirmPassword) {
    throw new Error('Password dan Konfirmasi Password tidak cocok.');
  }

  // Validasi ketentuan keamanan password
  const strength = validatePasswordStrength(password);
  if (!strength.isValid) {
    throw new Error(strength.message);
  }

  // Penetapan role aman di backend / sistem (bukan dari input form user)
  const assignedRole = isAuthorizedTeacherEmail(trimmedEmail) ? 'teacher' : 'student';

  // 1. JIKA FIREBASE AKTIF: Daftarkan langsung ke Firebase Authentication
  if (isFirebaseConfigured() && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      // Update Display Name di profile Firebase Auth
      if (trimmedName) {
        await updateProfile(user, { displayName: trimmedName });
      }

      // Simpan data ke Firestore dengan role aman
      await saveUserProfile(user.uid, {
        name: trimmedName,
        email: trimmedEmail,
        role: assignedRole
      });

      return {
        id: user.uid,
        name: trimmedName,
        email: trimmedEmail,
        role: assignedRole,
        provider: 'firebase'
      };
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }
  }

  // 2. JIKA MODE FALLBACK (OFFLINE/LOCAL):
  const existingUser = findUserByEmail(trimmedEmail);
  if (existingUser) {
    throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: trimmedName,
    email: trimmedEmail,
    role: assignedRole,
    salt,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  const currentUsers = getRegisteredUsers();
  currentUsers.push(newUser);
  saveUsers(currentUsers);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: assignedRole,
    provider: 'local'
  };
}

/**
 * Mendaftarkan akun Guru (Teacher Register)
 * Proteksi Ketat: Hanya email resmi yang telah ditentukan yang dapat terdaftar sebagai Guru.
 */
export async function registerTeacher({ name, email, password, confirmPassword, school, subject }) {
  const trimmedName = (name || '').trim();
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedSchool = (school || '').trim();
  const trimmedSubject = (subject || '').trim();

  // Validasi otorisasi email Guru di tingkat sistem
  if (!isAuthorizedTeacherEmail(trimmedEmail)) {
    throw new Error('Akses ditolak: Pendaftaran akun Guru dibatasi hanya untuk staf pengajar resmi CHEMIFY (karenina.zulfa.2403316@students.um.ac.id). Silakan hubungi admin atau mendaftar sebagai Siswa.');
  }

  // Validasi seluruh kolom wajib diisi
  if (!trimmedName) {
    throw new Error('Nama Lengkap Guru wajib diisi.');
  }
  if (!trimmedEmail) {
    throw new Error('Email dinas / email aktif wajib diisi.');
  }
  if (!trimmedSchool) {
    throw new Error('Nama Sekolah / Institusi wajib diisi.');
  }
  if (!trimmedSubject) {
    throw new Error('Mata Pelajaran yang diampu wajib diisi.');
  }
  if (!password) {
    throw new Error('Password wajib diisi.');
  }
  if (!confirmPassword) {
    throw new Error('Konfirmasi Password wajib diisi.');
  }

  if (!validateEmailFormat(trimmedEmail)) {
    throw new Error('Format email tidak valid.');
  }

  if (password !== confirmPassword) {
    throw new Error('Password dan Konfirmasi Password tidak cocok.');
  }

  const strength = validatePasswordStrength(password);
  if (!strength.isValid) {
    throw new Error(strength.message);
  }

  // 1. JIKA FIREBASE TERSEDIA:
  if (isFirebaseConfigured() && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      if (trimmedName) {
        await updateProfile(user, { displayName: trimmedName });
      }

      await saveUserProfile(user.uid, {
        name: trimmedName,
        email: trimmedEmail,
        role: 'teacher',
        school: trimmedSchool,
        subject: trimmedSubject
      });

      return {
        id: user.uid,
        name: trimmedName,
        email: trimmedEmail,
        role: 'teacher',
        school: trimmedSchool,
        subject: trimmedSubject,
        provider: 'firebase'
      };
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }
  }

  // 2. JIKA MODE LOKAL (FALLBACK):
  const existingUser = findUserByEmail(trimmedEmail);
  if (existingUser) {
    throw new Error('Email ini sudah terdaftar. Silakan masuk dengan kata sandi Anda.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newTeacher = {
    id: `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: trimmedName,
    email: trimmedEmail,
    role: 'teacher',
    salt,
    passwordHash,
    school: trimmedSchool,
    subject: trimmedSubject,
    accountStatus: 'Aktif',
    photoUrl: '',
    createdAt: new Date().toISOString()
  };

  const currentUsers = getRegisteredUsers();
  currentUsers.push(newTeacher);
  saveUsers(currentUsers);

  return {
    id: newTeacher.id,
    name: newTeacher.name,
    email: newTeacher.email,
    role: 'teacher',
    school: newTeacher.school,
    subject: newTeacher.subject,
    provider: 'local'
  };
}

/**
 * Otentikasi login pengguna (Umum / Siswa)
 */
export async function loginUser({ email, password, rememberMe = false }) {
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) throw new Error('Email wajib diisi.');
  if (!password) throw new Error('Password wajib diisi.');

  // 1. JIKA FIREBASE AKTIF:
  if (isFirebaseConfigured() && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;
      const userName = user.displayName || trimmedEmail.split('@')[0];

      // Ambil role secara aman dari database Firestore atau whitelist resmi
      let userRole = isAuthorizedTeacherEmail(user.email) ? 'teacher' : 'student';
      let userProfile = null;
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            userProfile = userDoc.data();
            if (userProfile.role === 'teacher' || isAuthorizedTeacherEmail(user.email)) {
              userRole = 'teacher';
            } else {
              userRole = 'student';
            }
          }
        } catch (e) {
          console.warn('Gagal membaca profil dari Firestore:', e);
        }
      }

      const sessionData = {
        id: user.uid,
        name: userProfile?.name || userName,
        email: user.email,
        role: userRole,
        photoUrl: userProfile?.photoUrl || '',
        school: userProfile?.school || 'SMA Negeri 1 Edukasi',
        subject: userProfile?.subject || '',
        loggedInAt: new Date().toISOString(),
        rememberMe: Boolean(rememberMe),
        provider: 'firebase'
      };

      saveSession(sessionData, rememberMe);
      return sessionData;
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }
  }

  // 2. JIKA MODE FALLBACK (LOCAL STORAGE):
  const user = findUserByEmail(trimmedEmail);
  if (!user) {
    throw new Error('Email atau password tidak sesuai.');
  }

  const calculatedHash = await hashPassword(password, user.salt);
  if (calculatedHash !== user.passwordHash) {
    throw new Error('Email atau password tidak sesuai.');
  }

  const assignedRole = isAuthorizedTeacherEmail(user.email) ? 'teacher' : (user.role || 'student');

  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: assignedRole,
    photoUrl: user.photoUrl || '',
    school: user.school || '',
    subject: user.subject || '',
    accountStatus: user.accountStatus || 'Aktif',
    loggedInAt: new Date().toISOString(),
    rememberMe: Boolean(rememberMe),
    provider: 'local'
  };

  saveSession(sessionData, rememberMe);
  return sessionData;
}

/**
 * Otentikasi login khusus Guru (Role-based Teacher Authentication)
 */
export async function loginTeacher({ email, password, rememberMe = false }) {
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) throw new Error('Email wajib diisi.');
  if (!password) throw new Error('Password wajib diisi.');

  // VALIDASI PERAN KETAT (RBAC): Cegah akun non-guru masuk lewat portal guru
  if (!isAuthorizedTeacherEmail(trimmedEmail)) {
    throw new Error('Akses ditolak: Email ini tidak terdaftar sebagai staf pengajar resmi. Silakan masuk melalui Halaman Login Siswa.');
  }

  // 1. JIKA FIREBASE AKTIF:
  if (isFirebaseConfigured() && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;
      const userName = user.displayName || 'Karenina Zulfa, S.Pd.';

      let userProfile = null;
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            userProfile = userDoc.data();
          }
        } catch (e) {
          console.warn('Gagal membaca profil guru dari Firestore:', e);
        }
      }

      const sessionData = {
        id: user.uid,
        name: userProfile?.name || userName,
        email: user.email,
        role: 'teacher',
        school: userProfile?.school || 'SMA Negeri 1 Edukasi',
        subject: userProfile?.subject || 'Kimia SMA',
        accountStatus: 'Aktif',
        photoUrl: userProfile?.photoUrl || '',
        loggedInAt: new Date().toISOString(),
        rememberMe: Boolean(rememberMe),
        provider: 'firebase'
      };

      saveSession(sessionData, rememberMe);
      return sessionData;
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }
  }

  // 2. JIKA MODE FALLBACK (LOCAL STORAGE):
  const user = findUserByEmail(trimmedEmail);
  if (!user) {
    throw new Error('Email atau kata sandi guru tidak sesuai.');
  }

  const calculatedHash = await hashPassword(password, user.salt);
  if (calculatedHash !== user.passwordHash) {
    throw new Error('Email atau kata sandi guru tidak sesuai.');
  }

  if (user.role !== 'teacher' && !isAuthorizedTeacherEmail(user.email)) {
    throw new Error('Akses ditolak: Akun ini tidak memiliki hak akses sebagai Guru.');
  }

  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'teacher',
    school: user.school || 'SMA Negeri 1 Edukasi',
    subject: user.subject || 'Kimia SMA',
    accountStatus: user.accountStatus || 'Aktif',
    photoUrl: user.photoUrl || '',
    loggedInAt: new Date().toISOString(),
    rememberMe: Boolean(rememberMe),
    provider: 'local'
  };

  saveSession(sessionData, rememberMe);
  return sessionData;
}

/**
 * Menyimpan sesi pengguna
 */
export function saveSession(sessionData, rememberMe) {
  const jsonStr = JSON.stringify(sessionData);
  if (rememberMe) {
    localStorage.setItem(SESSION_STORAGE_KEY, jsonStr);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, jsonStr);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

/**
 * Mengambil sesi aktif dari localStorage atau sessionStorage
 */
export function getActiveSession() {
  try {
    let session = null;
    const sessionRaw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionRaw) {
      session = JSON.parse(sessionRaw);
    } else {
      const localRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (localRaw) {
        session = JSON.parse(localRaw);
      }
    }

    if (session) {
      // Pastikan atribut role selalu konsisten dengan email guru
      if (isAuthorizedTeacherEmail(session.email)) {
        session.role = 'teacher';
      } else if (!session.role) {
        const u = findUserByEmail(session.email);
        session.role = (u && u.role) ? u.role : 'student';
      }
      return session;
    }

    return null;
  } catch (err) {
    console.error('Gagal mengambil sesi aktif:', err);
    return null;
  }
}

/**
 * Menghapus sesi login (Logout)
 */
export async function logoutUser() {
  if (isFirebaseConfigured() && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Gagal signOut Firebase:', err);
    }
  }
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Reset password (Lupa Kata Sandi)
 */
export async function resetUserPassword({ email, newPassword, confirmPassword }) {
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) throw new Error('Email akun wajib diisi.');
  if (!validateEmailFormat(trimmedEmail)) {
    throw new Error('Format email tidak valid.');
  }

  // 1. JIKA FIREBASE AKTIF:
  if (isFirebaseConfigured() && auth) {
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      return {
        success: true,
        message: `Instruksi pemulihan kata sandi telah dikirim ke email ${trimmedEmail}. Silakan periksa kotak masuk (inbox) atau folder spam kamu.`
      };
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }
  }

  // 2. JIKA MODE FALLBACK LOKAL:
  if (!newPassword) throw new Error('Kata sandi baru wajib diisi.');
  if (newPassword !== confirmPassword) {
    throw new Error('Kata sandi baru dan konfirmasi tidak cocok.');
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.isValid) throw new Error(strength.message);

  const users = getRegisteredUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === trimmedEmail);
  if (userIndex === -1) {
    throw new Error('Email tidak ditemukan dalam sistem CHEMIFY.');
  }

  const newSalt = generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);

  users[userIndex].salt = newSalt;
  users[userIndex].passwordHash = newHash;
  users[userIndex].updatedAt = new Date().toISOString();

  saveUsers(users);
  return { success: true, message: 'Password berhasil diperbarui. Silakan masuk kembali.' };
}

/**
 * Mengambil profil lengkap pengguna Siswa
 */
export function getUserProfile(userId) {
  if (!userId) return null;
  const users = getRegisteredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'student',
    photoUrl: user.photoUrl || '',
    school: user.school || '',
    educationLevel: user.educationLevel || 'SMA',
    grade: user.grade || 'XI',
    major: user.major || 'MIPA (Matematika & IPA)',
    attendanceNumber: user.attendanceNumber || '',
    bio: user.bio || '',
    createdAt: user.createdAt || ''
  };
}

/**
 * Menyimpan data kemajuan belajar siswa ke storage lokal per-user
 */
export function saveStudentProgressToLocal(userId, progressData) {
  if (!userId) return;
  try {
    const existingRaw = localStorage.getItem(`chem_progress_${userId}`);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const merged = {
      ...existing,
      userId,
      ...progressData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`chem_progress_${userId}`, JSON.stringify(merged));
  } catch (err) {
    console.warn('Gagal menyimpan progress lokal siswa:', err);
  }
}

/**
 * Memperbarui profil Siswa
 */
export function updateUserProfile(userId, profileData) {
  if (!userId) throw new Error('ID pengguna tidak valid.');

  const trimmedName = (profileData.name || '').trim();
  const trimmedSchool = (profileData.school || '').trim();
  const trimmedMajor = (profileData.major || '').trim();

  if (!trimmedName) throw new Error('Nama Lengkap wajib diisi.');
  if (!trimmedSchool) throw new Error('Nama Sekolah wajib diisi.');
  if (!profileData.educationLevel) throw new Error('Jenjang Pendidikan wajib dipilih.');
  if (!profileData.grade) throw new Error('Kelas wajib dipilih.');
  if (!trimmedMajor) throw new Error('Jurusan wajib diisi.');

  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.id === userId);

  const updatedUser = {
    ...(index !== -1 ? users[index] : {}),
    id: userId,
    name: trimmedName,
    photoUrl: profileData.photoUrl !== undefined ? profileData.photoUrl : (index !== -1 ? users[index].photoUrl : ''),
    school: trimmedSchool,
    educationLevel: profileData.educationLevel,
    grade: profileData.grade,
    major: trimmedMajor,
    attendanceNumber: (profileData.attendanceNumber || '').trim(),
    bio: (profileData.bio || '').trim(),
    role: 'student',
    updatedAt: new Date().toISOString()
  };

  if (index !== -1) {
    users[index] = updatedUser;
  } else {
    users.push(updatedUser);
  }
  saveUsers(users);

  const activeSession = getActiveSession();
  if (activeSession && activeSession.id === userId) {
    const updatedSession = {
      ...activeSession,
      name: updatedUser.name,
      photoUrl: updatedUser.photoUrl
    };
    saveSession(updatedSession, activeSession.rememberMe);
  }

  if (isFirebaseConfigured()) {
    saveUserProfile(userId, updatedUser).catch((err) => {
      console.warn('Gagal menyinkronkan profil ke Firestore:', err);
    });
  }

  return getUserProfile(userId);
}

/**
 * Mengambil profil lengkap akun Guru berdasarkan ID
 */
export function getTeacherProfile(teacherId) {
  if (!teacherId) return null;
  const users = getRegisteredUsers();
  const user = users.find(u => u.id === teacherId);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name || 'Karenina Zulfa, S.Pd.',
    email: user.email || 'karenina.zulfa.2403316@students.um.ac.id',
    role: 'teacher',
    photoUrl: user.photoUrl || '',
    school: user.school || 'SMA Negeri 1 Edukasi',
    subject: user.subject || 'Kimia SMA',
    accountStatus: user.accountStatus || 'Aktif',
    bio: user.bio || 'Guru Kimia SMA pengampu media pembelajaran asam-basa 5E CHEMIFY.',
    createdAt: user.createdAt || ''
  };
}

/**
 * Memperbarui profil akun Guru
 */
export function updateTeacherProfile(teacherId, profileData) {
  if (!teacherId) throw new Error('ID akun guru tidak valid.');

  const trimmedName = (profileData.name || '').trim();
  const trimmedSchool = (profileData.school || '').trim();
  const trimmedSubject = (profileData.subject || '').trim();

  if (!trimmedName) throw new Error('Nama Lengkap Guru wajib diisi.');
  if (!trimmedSchool) throw new Error('Nama Sekolah / Institusi wajib diisi.');
  if (!trimmedSubject) throw new Error('Mata Pelajaran yang diampu wajib diisi.');

  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.id === teacherId);
  if (index === -1) {
    throw new Error('Data guru tidak ditemukan dalam sistem.');
  }

  const updatedTeacher = {
    ...users[index],
    name: trimmedName,
    photoUrl: profileData.photoUrl !== undefined ? profileData.photoUrl : (users[index].photoUrl || ''),
    school: trimmedSchool,
    subject: trimmedSubject,
    bio: (profileData.bio || '').trim(),
    role: 'teacher',
    accountStatus: users[index].accountStatus || 'Aktif',
    updatedAt: new Date().toISOString()
  };

  users[index] = updatedTeacher;
  saveUsers(users);

  const activeSession = getActiveSession();
  if (activeSession && activeSession.id === teacherId) {
    const updatedSession = {
      ...activeSession,
      name: updatedTeacher.name,
      photoUrl: updatedTeacher.photoUrl,
      school: updatedTeacher.school,
      subject: updatedTeacher.subject
    };
    saveSession(updatedSession, activeSession.rememberMe);
  }

  if (isFirebaseConfigured()) {
    saveUserProfile(teacherId, updatedTeacher).catch((err) => {
      console.warn('Gagal menyinkronkan profil guru ke Firestore:', err);
    });
  }

  return getTeacherProfile(teacherId);
}

/**
 * Mengambil daftar seluruh Siswa terdaftar beserta aktivitas pembelajarannya
 * Menghubungkan Profil Siswa dan Aktivitas 5E ke Panel Guru
 */
export function getAllStudents() {
  const users = getRegisteredUsers();
  return users
    .filter(u => u.role !== 'teacher' && !isAuthorizedTeacherEmail(u.email))
    .map(u => {
      let progress = null;
      try {
        const rawProgress = localStorage.getItem(`chem_progress_${u.id}`);
        if (rawProgress) {
          progress = JSON.parse(rawProgress);
        }
      } catch (e) {
        console.warn('Gagal memuat progress lokal:', e);
      }

      // Jika data lokal aktif
      const activeSession = getActiveSession();
      if (!progress && activeSession && activeSession.id === u.id) {
        try {
          const userState = getStudentLocalState(u.id);
          progress = {
            currentStep: userState.currentStep,
            completedSteps: userState.completedSteps,
            quizScore: userState.quizScore,
            userPrediction: userState.userPrediction,
            studentReflection: userState.studentReflection,
            updatedAt: new Date().toISOString()
          };
        } catch {
          // ignore
        }
      }

      return {
        id: u.id,
        name: u.name || 'Siswa Chemify',
        email: u.email || '',
        school: u.school || 'SMA Negeri 1 Edukasi',
        educationLevel: u.educationLevel || 'SMA',
        grade: u.grade || 'XI',
        major: u.major || 'MIPA',
        attendanceNumber: u.attendanceNumber || '-',
        bio: u.bio || '',
        photoUrl: u.photoUrl || '',
        createdAt: u.createdAt || '',
        // Data Aktivitas Belajar 5E
        currentStep: progress?.currentStep ?? 0,
        completedSteps: progress?.completedSteps || [],
        quizScore: progress?.quizScore ?? 0,
        userPrediction: progress?.userPrediction || null,
        elaborateProgress: progress?.elaborateProgress || {},
        quizAnswers: progress?.quizAnswers || {},
        studentReflection: progress?.studentReflection || '',
        lastActive: progress?.updatedAt || u.createdAt || ''
      };
    });
}
