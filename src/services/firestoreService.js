import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase.js';

/**
 * Daftar email yang secara aman diotorisasi sebagai Guru di tingkat sistem
 */
export const AUTHORIZED_TEACHER_EMAILS = [
  'karenina.zulfa.2403316@students.um.ac.id',
  'guru@chemify.edu'
];

export function isAuthorizedTeacherEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return AUTHORIZED_TEACHER_EMAILS.some(t => t.toLowerCase() === email.trim().toLowerCase());
}

/**
 * Menyimpan profil pengguna ke Firestore dengan validasi Role aman (RBAC)
 */
export async function saveUserProfile(userId, profileData) {
  if (!isFirebaseConfigured() || !db || !userId) {
    return { success: false, mode: 'local' };
  }

  try {
    const userEmail = (profileData.email || '').trim().toLowerCase();
    // Penetapan role aman di backend: jika email guru resmi -> teacher, default -> student
    const assignedRole = isAuthorizedTeacherEmail(userEmail) ? 'teacher' : (profileData.role === 'teacher' && isAuthorizedTeacherEmail(userEmail) ? 'teacher' : 'student');

    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      id: userId,
      name: profileData.name || '',
      email: userEmail,
      role: assignedRole,
      school: profileData.school || '',
      educationLevel: profileData.educationLevel || 'SMA',
      grade: profileData.grade || 'XI',
      major: profileData.major || 'MIPA',
      subject: profileData.subject || (assignedRole === 'teacher' ? 'Kimia SMA' : ''),
      attendanceNumber: profileData.attendanceNumber || '',
      bio: profileData.bio || '',
      photoUrl: profileData.photoUrl || '',
      updatedAt: serverTimestamp(),
      ...(profileData.createdAt ? { createdAt: profileData.createdAt } : { createdAt: serverTimestamp() })
    }, { merge: true });

    return { success: true, mode: 'firestore', role: assignedRole };
  } catch (error) {
    console.warn('⚠️ [Firestore] Gagal menyimpan profil pengguna:', error);
    return { success: false, error };
  }
}

/**
 * Menyimpan kemajuan belajar siswa (Tahap 5E) ke Cloud Firestore
 * @param {string} userId - ID Pengguna / UID Firebase
 * @param {object} progressData - Data kemajuan belajar 5E
 */
export async function saveStudentProgress(userId, progressData = {}) {
  if (!isFirebaseConfigured() || !db || !userId) {
    return { success: false, mode: 'local' };
  }

  try {
    const progressDocRef = doc(db, 'student_progress', userId);
    // Pola update parsial: hanya kirim field yang didefinisikan dalam progressData agar tidak menimpa data yang ada
    const updatePayload = {
      userId,
      updatedAt: serverTimestamp()
    };

    if (progressData.userName !== undefined) updatePayload.userName = progressData.userName;
    if (progressData.userEmail !== undefined) updatePayload.userEmail = progressData.userEmail;
    if (progressData.currentStep !== undefined) updatePayload.currentStep = progressData.currentStep;
    if (progressData.completedSteps !== undefined) updatePayload.completedSteps = progressData.completedSteps;
    if (progressData.userPrediction !== undefined) updatePayload.userPrediction = progressData.userPrediction;
    if (progressData.elaborateProgress !== undefined) updatePayload.elaborateProgress = progressData.elaborateProgress;
    if (progressData.quizAnswers !== undefined) updatePayload.quizAnswers = progressData.quizAnswers;
    if (progressData.quizScore !== undefined) updatePayload.quizScore = progressData.quizScore;
    if (progressData.studentReflection !== undefined) updatePayload.studentReflection = progressData.studentReflection;

    await setDoc(progressDocRef, updatePayload, { merge: true });

    return { success: true, mode: 'firestore' };
  } catch (error) {
    console.warn('⚠️ [Firestore] Gagal menyinkronkan progress siswa ke cloud:', error);
    return { success: false, error };
  }
}

/**
 * Mengambil kemajuan belajar siswa yang tersimpan di Cloud Firestore
 * @param {string} userId - ID Pengguna / UID Firebase
 */
export async function getStudentProgress(userId) {
  if (!isFirebaseConfigured() || !db || !userId) {
    return { success: false, data: null, mode: 'local' };
  }

  try {
    const progressDocRef = doc(db, 'student_progress', userId);
    const docSnap = await getDoc(progressDocRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data(), mode: 'firestore' };
    }
    return { success: true, data: null, mode: 'firestore' };
  } catch (error) {
    console.warn('⚠️ [Firestore] Gagal memuat data progress siswa:', error);
    return { success: false, data: null, error };
  }
}

/**
 * Mengambil seluruh data Siswa beserta aktivitas pembelajarannya dari Cloud Firestore
 * Digunakan pada Panel Dashboard Guru
 */
export async function getStudentsFromCloud() {
  if (!isFirebaseConfigured() || !db) {
    return { success: false, data: [] };
  }

  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const progressSnap = await getDocs(collection(db, 'student_progress'));

    const progressMap = {};
    progressSnap.forEach((docSnap) => {
      progressMap[docSnap.id] = docSnap.data();
    });

    const students = [];
    usersSnap.forEach((docSnap) => {
      const u = docSnap.data();
      const email = (u.email || '').toLowerCase();
      // Pastikan akun bukan guru
      if (u.role !== 'teacher' && !isAuthorizedTeacherEmail(email)) {
        const prog = progressMap[docSnap.id] || {};
        students.push({
          id: docSnap.id,
          name: u.name || 'Siswa',
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
          currentStep: prog.currentStep ?? 0,
          completedSteps: prog.completedSteps || [],
          quizScore: prog.quizScore ?? 0,
          userPrediction: prog.userPrediction || null,
          elaborateProgress: prog.elaborateProgress || {},
          quizAnswers: prog.quizAnswers || {},
          studentReflection: prog.studentReflection || '',
          lastActive: prog.updatedAt || u.updatedAt || ''
        });
      }
    });

    return { success: true, data: students };
  } catch (error) {
    console.warn('⚠️ [Firestore] Gagal memuat data siswa untuk guru:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Menyimpan rekapitulasi hasil evaluasi kuis & refleksi siswa ke koleksi 'quiz_results'
 */
export async function saveQuizEvaluationRecord(userId, evaluationData) {
  if (!isFirebaseConfigured() || !db || !userId) {
    return { success: false, mode: 'local' };
  }

  try {
    const resultsColRef = collection(db, 'quiz_results');
    const docRef = await addDoc(resultsColRef, {
      userId,
      studentName: evaluationData.studentName || '',
      studentEmail: evaluationData.studentEmail || '',
      quizScore: evaluationData.quizScore ?? 0,
      quizAnswers: evaluationData.quizAnswers || {},
      userPrediction: evaluationData.userPrediction || null,
      studentReflection: evaluationData.studentReflection || '',
      submittedAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, mode: 'firestore' };
  } catch (error) {
    console.warn('⚠️ [Firestore] Gagal menyimpan riwayat evaluasi kuis:', error);
    return { success: false, error };
  }
}
