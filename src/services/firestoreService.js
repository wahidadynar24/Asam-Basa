import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

/**
 * Menyimpan profil pengguna/siswa ke Firestore
 */
export async function saveUserProfile(userId, profileData) {
  if (!isFirebaseConfigured() || !db || !userId) {
    return { success: false, mode: 'local' };
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      id: userId,
      name: profileData.name || '',
      email: profileData.email || '',
      role: 'siswa',
      updatedAt: serverTimestamp(),
      ...(profileData.createdAt ? { createdAt: profileData.createdAt } : { createdAt: serverTimestamp() })
    }, { merge: true });

    return { success: true, mode: 'firestore' };
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
export async function saveStudentProgress(userId, progressData) {
  if (!isFirebaseConfigured() || !db || !userId) {
    return { success: false, mode: 'local' };
  }

  try {
    const progressDocRef = doc(db, 'student_progress', userId);
    await setDoc(progressDocRef, {
      userId,
      userName: progressData.userName || '',
      userEmail: progressData.userEmail || '',
      currentStep: progressData.currentStep ?? 0,
      completedSteps: progressData.completedSteps || [],
      userPrediction: progressData.userPrediction || null,
      elaborateProgress: progressData.elaborateProgress || {},
      quizAnswers: progressData.quizAnswers || {},
      quizScore: progressData.quizScore ?? 0,
      studentReflection: progressData.studentReflection || '',
      updatedAt: serverTimestamp()
    }, { merge: true });

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
 * Menyimpan rekapitulasi hasil evaluasi kuis & refleksi siswa ke koleksi 'quiz_results'
 * Berguna bagi guru/peneliti untuk melihat riwayat nilai seluruh siswa.
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

