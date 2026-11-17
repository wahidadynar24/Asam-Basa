import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Konfigurasi Firebase dari variabel lingkungan (Vite Environment Variables).
 * Menggunakan prefix VITE_ agar dapat diakses di sisi klien.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * Mengecek apakah konfigurasi Firebase sudah diisi dengan benar di file .env
 */
export function isFirebaseConfigured() {
  const apiKey = firebaseConfig.apiKey;
  const projectId = firebaseConfig.projectId;
  const appId = firebaseConfig.appId;

  return Boolean(
    apiKey &&
    projectId &&
    appId &&
    apiKey.trim() !== '' &&
    !apiKey.startsWith('AIzaSy...') &&
    projectId.trim() !== ''
  );
}

// Inisialisasi Firebase App, Auth, dan Firestore secara aman (fault-tolerant)
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.info('🔥 [Firebase] Berhasil terhubung ke proyek:', firebaseConfig.projectId);
  } catch (error) {
    console.error('❌ [Firebase] Gagal menginisialisasi Firebase:', error);
  }
} else {
  console.info('ℹ️ [Firebase] Belum terhubung. Kredensial di file .env masih kosong atau belum lengkap. Aplikasi berjalan menggunakan mode penyimpanan lokal (offline-first).');
}

export { app, auth, db };

