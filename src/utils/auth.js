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
  let modified = false;

  if (users.length === 0) {
    const defaultSalt = generateSalt();
    const defaultHash = await hashPassword('Siswa123!', defaultSalt);
    const demoUser = {
      id: 'user_demo_chemify_1',
      name: 'Siswa Chemify',
      email: 'siswa@chemify.edu',
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
    users.push(demoUser);
    modified = true;
  } else {
    // Pastikan user demo siswa memiliki atribut role
    const demoStudent = users.find(u => u.id === 'user_demo_chemify_1' || u.email === 'siswa@chemify.edu');
    if (demoStudent && !demoStudent.role) {
      demoStudent.role = 'student';
      modified = true;
    }
  }

  // Inisialisasi Akun Demo Guru jika belum ada akun guru terdaftar
  const hasTeacher = users.some(u => u.role === 'teacher' || u.email === 'guru@chemify.edu');
  if (!hasTeacher) {
    const teacherSalt = generateSalt();
    const teacherHash = await hashPassword('Guru123!', teacherSalt);
    const demoTeacher = {
      id: 'user_demo_guru_1',
      name: 'Budi Santoso, S.Pd., M.Si.',
      email: 'guru@chemify.edu',
      role: 'teacher',
      salt: teacherSalt,
      passwordHash: teacherHash,
      school: 'SMA Negeri 1 Edukasi',
      subject: 'Kimia',
      accountStatus: 'Aktif',
      bio: 'Guru Kimia SMA yang berfokus pada inovasi pembelajaran visual dan interaktif 5E.',
      photoUrl: '',
      createdAt: new Date().toISOString()
    };
    users.push(demoTeacher);
    modified = true;
  }

  if (modified) {
    saveUsers(users);
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
    role: 'student',
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
    email: newUser.email,
    role: 'student'
  };
}

/**
 * Mendaftarkan akun Guru baru (Teacher Register)
 * @param {object} param0 
 */
export async function registerTeacher({ name, email, password, confirmPassword, school, subject }) {
  const trimmedName = (name || '').trim();
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedSchool = (school || '').trim();
  const trimmedSubject = (subject || '').trim();

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

  // Validasi format email
  if (!validateEmailFormat(trimmedEmail)) {
    throw new Error('Format email tidak valid (contoh: guru@sekolah.sch.id).');
  }

  // Validasi kecocokan password
  if (password !== confirmPassword) {
    throw new Error('Password dan Konfirmasi Password tidak cocok.');
  }

  // Validasi kekuatan password
  const strength = validatePasswordStrength(password);
  if (!strength.isValid) {
    throw new Error(strength.message);
  }

  // Validasi keunikan email di seluruh sistem
  const existingUser = findUserByEmail(trimmedEmail);
  if (existingUser) {
    throw new Error('Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.');
  }

  // Hashing password dengan salt kriptografis
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
    bio: `Guru ${trimmedSubject} di ${trimmedSchool}`,
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
    subject: newTeacher.subject
  };
}

/**
 * Otentikasi login pengguna (Umum / Siswa)
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
    role: user.role || 'student',
    photoUrl: user.photoUrl || '',
    school: user.school || '',
    subject: user.subject || '',
    accountStatus: user.accountStatus || 'Aktif',
    loggedInAt: new Date().toISOString(),
    rememberMe: Boolean(rememberMe)
  };

  saveSession(sessionData, rememberMe);

  return sessionData;
}

/**
 * Otentikasi login khusus Guru (Role-based Teacher Authentication)
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 */
export async function loginTeacher({ email, password, rememberMe = false }) {
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

  // VALIDASI PERAN KETAT (RBAC): Cegah akun non-guru masuk lewat portal guru
  if (user.role !== 'teacher') {
    throw new Error('Akses ditolak: Akun ini terdaftar sebagai Siswa. Silakan masuk melalui Halaman Login Siswa.');
  }

  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'teacher',
    school: user.school || '',
    subject: user.subject || 'Kimia',
    accountStatus: user.accountStatus || 'Aktif',
    photoUrl: user.photoUrl || '',
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
    let session = null;
    // Periksa sessionStorage terlebih dahulu (sesi saat ini)
    const sessionRaw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionRaw) {
      session = JSON.parse(sessionRaw);
    } else {
      // Jika tidak ada di sessionStorage, periksa localStorage (Remember Me)
      const localRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (localRaw) {
        session = JSON.parse(localRaw);
      }
    }

    if (session) {
      // Pastikan atribut role selalu tersedia pada sesi
      if (!session.role) {
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

/**
 * Mengambil profil lengkap pengguna berdasarkan ID
 * @param {string} userId 
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
 * Memperbarui profil pengguna
 * @param {string} userId 
 * @param {object} profileData 
 */
export function updateUserProfile(userId, profileData) {
  if (!userId) {
    throw new Error('ID pengguna tidak valid.');
  }

  const trimmedName = (profileData.name || '').trim();
  const trimmedSchool = (profileData.school || '').trim();
  const trimmedMajor = (profileData.major || '').trim();

  // Validasi kolom wajib diisi
  if (!trimmedName) {
    throw new Error('Nama Lengkap wajib diisi.');
  }
  if (!trimmedSchool) {
    throw new Error('Nama Sekolah wajib diisi.');
  }
  if (!profileData.educationLevel) {
    throw new Error('Jenjang Pendidikan wajib dipilih.');
  }
  if (!profileData.grade) {
    throw new Error('Kelas wajib dipilih.');
  }
  if (!trimmedMajor) {
    throw new Error('Jurusan wajib diisi.');
  }

  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    throw new Error('Data pengguna tidak ditemukan dalam sistem.');
  }

  const updatedUser = {
    ...users[index],
    name: trimmedName,
    photoUrl: profileData.photoUrl !== undefined ? profileData.photoUrl : (users[index].photoUrl || ''),
    school: trimmedSchool,
    educationLevel: profileData.educationLevel,
    grade: profileData.grade,
    major: trimmedMajor,
    attendanceNumber: (profileData.attendanceNumber || '').trim(),
    bio: (profileData.bio || '').trim(),
    updatedAt: new Date().toISOString()
  };

  users[index] = updatedUser;
  saveUsers(users);

  // Perbarui juga sesi aktif jika pengguna yang diupdate adalah sesi yang sedang berjalan
  const activeSession = getActiveSession();
  if (activeSession && activeSession.id === userId) {
    const updatedSession = {
      ...activeSession,
      name: updatedUser.name,
      photoUrl: updatedUser.photoUrl
    };
    saveSession(updatedSession, activeSession.rememberMe);
  }

  return getUserProfile(userId);
}

/**
 * Mengambil profil lengkap akun Guru berdasarkan ID
 * @param {string} teacherId 
 */
export function getTeacherProfile(teacherId) {
  if (!teacherId) return null;
  const users = getRegisteredUsers();
  const user = users.find(u => u.id === teacherId);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    role: 'teacher',
    photoUrl: user.photoUrl || '',
    school: user.school || '',
    subject: user.subject || 'Kimia',
    accountStatus: user.accountStatus || 'Aktif',
    bio: user.bio || '',
    createdAt: user.createdAt || ''
  };
}

/**
 * Memperbarui profil akun Guru
 * @param {string} teacherId 
 * @param {object} profileData 
 */
export function updateTeacherProfile(teacherId, profileData) {
  if (!teacherId) {
    throw new Error('ID akun guru tidak valid.');
  }

  const trimmedName = (profileData.name || '').trim();
  const trimmedSchool = (profileData.school || '').trim();
  const trimmedSubject = (profileData.subject || '').trim();

  // Validasi kolom wajib diisi
  if (!trimmedName) {
    throw new Error('Nama Lengkap Guru wajib diisi.');
  }
  if (!trimmedSchool) {
    throw new Error('Nama Sekolah / Institusi wajib diisi.');
  }
  if (!trimmedSubject) {
    throw new Error('Mata Pelajaran yang diampu wajib diisi.');
  }

  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.id === teacherId);
  if (index === -1) {
    throw new Error('Data guru tidak ditemukan dalam sistem.');
  }

  // PROTEKSI PERAN: Pastikan role tetap 'teacher' dan tidak dapat dimanipulasi
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

  // Perbarui juga sesi aktif jika pengguna yang diupdate adalah sesi yang sedang berjalan
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

  return getTeacherProfile(teacherId);
}

/**
 * Mengambil daftar seluruh Siswa terdaftar untuk dashboard pemantauan Guru
 */
export function getAllStudents() {
  const users = getRegisteredUsers();
  return users
    .filter(u => u.role !== 'teacher')
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      school: u.school || 'SMA Negeri 1 Edukasi',
      grade: u.grade || 'XI',
      major: u.major || 'MIPA',
      photoUrl: u.photoUrl || '',
      createdAt: u.createdAt || ''
    }));
}

