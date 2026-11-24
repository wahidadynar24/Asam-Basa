import { describe, it, expect, vi } from 'vitest'

// Mock firebase firestore
vi.mock('../src/services/firebase.js', () => ({
  isFirebaseConfigured: () => true,
  db: {}
}))

let lastWrittenData = null
let lastWrittenOptions = null

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, coll, id) => ({ db, coll, id })),
  setDoc: vi.fn(async (docRef, data, options) => {
    lastWrittenData = data
    lastWrittenOptions = options
    return Promise.resolve()
  }),
  getDoc: vi.fn(),
  serverTimestamp: () => 'SERVER_TIMESTAMP'
}))

import { saveStudentProgress } from '../src/services/firestoreService.js'

describe('05-02: Reflection save does not wipe completedSteps (Partial Update Pattern)', () => {
  it('should not include completedSteps when saving only reflection and currentStep', async () => {
    lastWrittenData = null
    lastWrittenOptions = null

    const partialPayload = {
      userName: 'Test Student',
      userEmail: 'student@example.invalid',
      currentStep: 6,
      studentReflection: 'Refleksi pemahaman saya sangat baik.'
    }

    const res = await saveStudentProgress('user-123', partialPayload)
    expect(res.success).toBe(true)
    expect(lastWrittenOptions).toEqual({ merge: true })

    // Crucial: completedSteps must NOT be written as [] when undefined in payload!
    expect(lastWrittenData.completedSteps).toBeUndefined()
    expect(lastWrittenData.studentReflection).toBe('Refleksi pemahaman saya sangat baik.')
    expect(lastWrittenData.currentStep).toBe(6)
  })

  it('should include completedSteps when explicitly provided', async () => {
    lastWrittenData = null

    const fullPayload = {
      userName: 'Test Student',
      userEmail: 'student@example.invalid',
      currentStep: 6,
      completedSteps: [1, 2, 3, 4, 5],
      studentReflection: 'Tahap 1-5 tuntas.'
    }

    const res = await saveStudentProgress('user-123', fullPayload)
    expect(res.success).toBe(true)
    expect(lastWrittenData.completedSteps).toEqual([1, 2, 3, 4, 5])
    expect(lastWrittenData.studentReflection).toBe('Tahap 1-5 tuntas.')
  })
})
