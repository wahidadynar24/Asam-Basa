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
import { auth, isFirebaseConfigured } from '../services/firebase';
import { saveUserProfile } from '../services/firestoreService';

const USERS_STORAGE_KEY = 'chem_users';
const SESSION_STORAGE_KEY = 'chem_auth_session';

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
      return err.message || 'Terjadi kendala pada proses autentikasi Firebase.';
  }
}

/**
 * Mengonversi ArrayBuffer ke string heksadesimal
 */
function bufferToHex(buffer) {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Menghasilkan salt acak menggunakan window.crypto
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
 * Mengambil daftar seluruh pengguna dari localStorage (Mode Fallback)
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
 * Menyimpan daftar pengguna ke localStorage (Mode Fallback)
 */
function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Mencari pengguna berdasarkan email (Mode Fallback)
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const users = getRegisteredUsers();
  return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

/**
 * Inisialisasi akun demo bawaan untuk mode offline
 */
export async function initDefaultDemoUser() {
  // Hanya buat user demo lokal jika belum terhubung ke Firebase
  if (isFirebaseConfigured()) return;

  const users = getRegisteredUsers();
  if (users.length === 0) {
    const defaultSalt = generateSalt();
    const defaultHash = await hashPassword('Siswa123!', defaultSalt);
    const demoUser = {
      id: 'user_demo_chemify_1',
      name: 'Siswa Chemify',
      email: 'siswa@chemify.edu',
      salt: defaultSalt,
      passwordHash: defaultHash,
      createdAt: new Date().toISOString()
    };
    saveUsers([demoUser]);
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
 * Mendaftarkan akun baru (Register)
 * Mendukung Firebase Auth & sinkronisasi Firestore.
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

  // 1. JIKA FIREBASE AKTIF: Daftarkan langsung ke Firebase Authentication
  if (isFirebaseConfigured() && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      // Update Display Name di profile Firebase Auth
      if (trimmedName) {
        await updateProfile(user, { displayName: trimmedName });
      }

      // Simpan data siswa ke Firestore
      await saveUserProfile(user.uid, {
        name: trimmedName,
        email: trimmedEmail
      });

      return {
        id: user.uid,
        name: trimmedName,
        email: trimmedEmail,
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
    provider: 'local'
  };
}

/**
 * Otentikasi login pengguna
 * Mendukung Firebase Auth & Sesi Lokal
 */
export async function loginUser({ email, password, rememberMe = false }) {
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) throw new Error('Email wajib diisi.');
  if (!password) throw new Error('Password wajib diisi.');

  // 1. JIKA FIREBASE AKTIF: Login dengan Firebase Auth
  if (isFirebaseConfigured() && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;
      const userName = user.displayName || trimmedEmail.split('@')[0];

      const sessionData = {
        id: user.uid,
        name: userName,
        email: user.email,
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

  // Verifikasi hash
  const calculatedHash = await hashPassword(password, user.salt);
  if (calculatedHash !== user.passwordHash) {
    throw new Error('Email atau password tidak sesuai.');
  }

  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
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
    const sessionRaw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionRaw) {
      return JSON.parse(sessionRaw);
    }

    const localRaw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (localRaw) {
      return JSON.parse(localRaw);
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
 * Jika Firebase aktif: Kirim link reset password resmi via email Firebase.
 * Jika Mode lokal: Atur password baru di storage lokal.
 */
export async function resetUserPassword({ email, newPassword, confirmPassword }) {
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) throw new Error('Email akun wajib diisi.');
  if (!validateEmailFormat(trimmedEmail)) {
    throw new Error('Format email tidak valid.');
  }

  // 1. JIKA FIREBASE AKTIF: Kirim email pemulihan sandi via Firebase
  if (isFirebaseConfigured() && auth) {
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      return { 
        success: true, 
        message: 'Tautan pemulihan kata sandi telah dikirim oleh Firebase ke email kamu. Silakan periksa kotak masuk (inbox) atau folder spam.' 
      };
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }
  }

  // 2. JIKA MODE FALLBACK (LOCAL STORAGE):
  if (!newPassword) throw new Error('Password baru wajib diisi.');
  if (newPassword !== confirmPassword) {
    throw new Error('Password baru dan konfirmasi tidak cocok.');
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.isValid) {
    throw new Error(strength.message);
  }

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
