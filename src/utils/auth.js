/**
 * Modul Autentikasi dan Pengelolaan Sesi CHEMIFY
 * 
 * Fitur Keamanan:
 * - Tidak menyimpan password dalam bentuk teks biasa (plaintext).
 * - Menggunakan Web Crypto API (SHA-256 dengan Salt kriptografis acak).
 * - Mendukung sesi persisten (Remember Me via localStorage) dan sesi sementara (sessionStorage).
 * - Sesi hanya menyimpan identitas publik (id, nama, email), bukan hash atau password.
 */

const USERS_STORAGE_KEY = 'chem_users';
const SESSION_STORAGE_KEY = 'chem_auth_session';

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
 * @param {string} password 
 * @param {string} salt 
 * @returns {Promise<string>}
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
 * Inisialisasi akun demo bawaan jika belum ada pengguna terdaftar sama sekali
 */
export async function initDefaultDemoUser() {
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
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @param {string} confirmPassword 
 */
export async function registerUser({ name, email, password, confirmPassword }) {
  const trimmedName = (name || '').trim();
  const trimmedEmail = (email || '').trim().toLowerCase();

  // Validasi seluruh kolom wajib diisi
  if (!trimmedName) {
    throw new Error('Nama Lengkap wajib diisi.');
  }
  if (!trimmedEmail) {
    throw new Error('Email wajib diisi.');
  }
  if (!password) {
    throw new Error('Password wajib diisi.');
  }
  if (!confirmPassword) {
    throw new Error('Konfirmasi Password wajib diisi.');
  }

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

  // Validasi keunikan email
  const existingUser = findUserByEmail(trimmedEmail);
  if (existingUser) {
    throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
  }

  // Hashing password dengan salt
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

  // Return identitas publik pengguna
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email
  };
}

/**
 * Otentikasi login pengguna
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 */
export async function loginUser({ email, password, rememberMe = false }) {
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) {
    throw new Error('Email wajib diisi.');
  }
  if (!password) {
    throw new Error('Password wajib diisi.');
  }

  const user = findUserByEmail(trimmedEmail);
  if (!user) {
    throw new Error('Email atau password tidak sesuai.');
  }

  // Verifikasi hash
  const calculatedHash = await hashPassword(password, user.salt);
  if (calculatedHash !== user.passwordHash) {
    throw new Error('Email atau password tidak sesuai.');
  }

  // Buat sesi pengguna publik (bebas password dan hash)
  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    loggedInAt: new Date().toISOString(),
    rememberMe: Boolean(rememberMe)
  };

  saveSession(sessionData, rememberMe);

  return sessionData;
}

/**
 * Menyimpan sesi pengguna:
 * - Jika rememberMe = true: simpan di localStorage
 * - Jika rememberMe = false: simpan di sessionStorage
 * Bersihkan media lain untuk menghindari duplikasi status
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
    // Periksa sessionStorage terlebih dahulu (sesi saat ini)
    const sessionRaw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionRaw) {
      return JSON.parse(sessionRaw);
    }

    // Jika tidak ada di sessionStorage, periksa localStorage (Remember Me)
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
export function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Reset password (mekanisme pemulihan akun)
 */
export async function resetUserPassword({ email, newPassword, confirmPassword }) {
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) {
    throw new Error('Email wajib diisi.');
  }
  if (!newPassword) {
    throw new Error('Password baru wajib diisi.');
  }
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

  // Buat salt baru dan hash baru
  const newSalt = generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);

  users[userIndex].salt = newSalt;
  users[userIndex].passwordHash = newHash;
  users[userIndex].updatedAt = new Date().toISOString();

  saveUsers(users);

  return { success: true, message: 'Password berhasil diperbarui. Silakan masuk kembali.' };
}

