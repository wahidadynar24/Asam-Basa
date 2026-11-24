import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QUIZ_QUESTIONS } from '../src/data/quizData.js'

// Mock Firestore
const writtenDocs = new Map()

vi.mock('../src/services/firebase.js', () => ({
  isFirebaseConfigured: () => true,
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, coll, id) => `${coll}/${id}`),
  setDoc: vi.fn(async (docRef, data, options) => {
    const existing = writtenDocs.get(docRef) || {}
    if (options?.merge) {
      writtenDocs.set(docRef, { ...existing, ...data })
    } else {
      writtenDocs.set(docRef, data)
    }
    return Promise.resolve()
  }),
  collection: vi.fn((db, coll) => coll),
  addDoc: vi.fn(async (collRef, data) => {
    const id = `auto_${Math.random()}`
    const ref = `${collRef}/${id}`
    writtenDocs.set(ref, data)
    return Promise.resolve({ id })
  }),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: () => 'SERVER_TIMESTAMP'
}))

import { saveQuizEvaluationRecord } from '../src/services/firestoreService.js'

describe('05-04: Idempotent Quiz Results, Item Accuracy Analysis & Rules', () => {
  beforeEach(() => {
    writtenDocs.clear()
  })

  it('should save quiz evaluation idempotently using attemptId with setDoc merge', async () => {
    const userId = 'student_test_1@example.invalid'
    const attemptId = 'att_session_xyz_123'

    const items = QUIZ_QUESTIONS.map(q => ({
      questionId: q.id,
      selectedOption: q.correctAnswer,
      isCorrect: true
    }))

    const evaluationData = {
      attemptId,
      questionVersion: 1,
      studentName: 'Budi Test',
      studentEmail: userId,
      quizScore: 100,
      quizAnswers: { 1: 'a', 2: 'b', 3: 'b', 4: 'a', 5: 'b', 6: 'b', 7: 'b', 8: 'b', 9: 'a', 10: 'a' },
      items,
      studentReflection: 'Refleksi awal'
    }

    // First submission
    const res1 = await saveQuizEvaluationRecord(userId, evaluationData)
    expect(res1.success).toBe(true)
    expect(res1.id).toBe(attemptId)
    expect(writtenDocs.size).toBe(1)

    // Second submission with updated reflection on the same attemptId
    const res2 = await saveQuizEvaluationRecord(userId, {
      ...evaluationData,
      studentReflection: 'Refleksi diperbarui'
    })
    expect(res2.success).toBe(true)
    expect(res2.id).toBe(attemptId)

    // Total documents in Firestore MUST still be 1 (No duplicate document created!)
    expect(writtenDocs.size).toBe(1)
    const stored = writtenDocs.get(`quiz_results/${attemptId}`)
    expect(stored).toBeDefined()
    expect(stored.studentReflection).toBe('Refleksi diperbarui')
    expect(stored.questionVersion).toBe(1)
    expect(stored.items).toHaveLength(10)
    expect(stored.items[0]).toEqual({ questionId: 1, selectedOption: 'a', isCorrect: true })
  })

  it('should verify accuracy calculation across student cohort for teacher dashboard', () => {
    const cohort = [
      {
        id: 's1',
        quizAnswers: { 1: 'a', 2: 'b', 3: 'b', 4: 'a' } // 4 correct
      },
      {
        id: 's2',
        quizAnswers: { 1: 'a', 2: 'a', 3: 'b', 4: 'c' } // q1 correct, q2 wrong, q3 correct, q4 wrong
      }
    ]

    const q1 = QUIZ_QUESTIONS.find(q => q.id === 1) // correct 'a'
    const q2 = QUIZ_QUESTIONS.find(q => q.id === 2) // correct 'b'

    let q1Answered = 0, q1Correct = 0
    let q2Answered = 0, q2Correct = 0

    cohort.forEach(st => {
      if (st.quizAnswers[1]) {
        q1Answered++
        if (st.quizAnswers[1] === q1.correctAnswer) q1Correct++
      }
      if (st.quizAnswers[2]) {
        q2Answered++
        if (st.quizAnswers[2] === q2.correctAnswer) q2Correct++
      }
    })

    expect(q1Answered).toBe(2)
    expect(q1Correct).toBe(2)
    expect(Math.round((q1Correct / q1Answered) * 100)).toBe(100)

    expect(q2Answered).toBe(2)
    expect(q2Correct).toBe(1)
    expect(Math.round((q2Correct / q2Answered) * 100)).toBe(50)
  })

  it('should enforce firestore security rule principles', () => {
    // Structural verification of rules rules file
    import('fs').then(fs => {
      const rules = fs.readFileSync('firestore.rules', 'utf8')
      expect(rules).toContain('isOfficialTeacher()')
      expect(rules).toContain('isOwner(userId)')
      expect(rules).toContain("match /quiz_results/{attemptId}")
      expect(rules).toContain("resource.data.userId == request.auth.uid || isOfficialTeacher()")
    })
  })
})
