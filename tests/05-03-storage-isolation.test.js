import { describe, it, expect, beforeEach } from 'vitest'
import { 
  getUserStorageKey, 
  getStudentLocalState, 
  setStudentLocalField, 
  getDefaultStudentState 
} from '../src/utils/auth.js'

describe('05-03: Namespaced Storage and State Isolation Between Accounts', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('should generate distinct namespaced keys for different users and guests', () => {
    const keyUserA = getUserStorageKey('user_alpha', 'completed_steps')
    const keyUserB = getUserStorageKey('user_beta', 'completed_steps')
    const keyGuest = getUserStorageKey(null, 'completed_steps')

    expect(keyUserA).toBe('chem_user_alpha_completed_steps')
    expect(keyUserB).toBe('chem_user_beta_completed_steps')
    expect(keyGuest).toBe('chem_guest_completed_steps')
    expect(keyUserA).not.toBe(keyUserB)
  })

  it('should isolate state completely between User A and User B', () => {
    const userAId = 'user_student_a@example.invalid'
    const userBId = 'user_student_b@example.invalid'

    // User A completes steps 1, 2, 3 and achieves quiz score 90
    setStudentLocalField(userAId, 'current_step', 4)
    setStudentLocalField(userAId, 'completed_steps', [1, 2, 3])
    setStudentLocalField(userAId, 'quiz_score', 90)
    setStudentLocalField(userAId, 'student_reflection', 'Refleksi User A')

    // Verify User A has stored data
    const stateA = getStudentLocalState(userAId)
    expect(stateA.currentStep).toBe(4)
    expect(stateA.completedSteps).toEqual([1, 2, 3])
    expect(stateA.quizScore).toBe(90)
    expect(stateA.studentReflection).toBe('Refleksi User A')

    // Verify User B starts completely fresh with 0 progress
    const stateB = getStudentLocalState(userBId)
    expect(stateB.currentStep).toBe(0)
    expect(stateB.completedSteps).toEqual([])
    expect(stateB.quizScore).toBe(0)
    expect(stateB.studentReflection).toBe('')

    // Verify guest state is also completely untouched
    const guestState = getStudentLocalState(null)
    expect(guestState.currentStep).toBe(0)
    expect(guestState.completedSteps).toEqual([])
  })

  it('should return clean default state for brand new user', () => {
    const defaults = getDefaultStudentState()
    expect(defaults.currentStep).toBe(0)
    expect(defaults.completedSteps).toEqual([])
    expect(defaults.quizScore).toBe(0)
    expect(defaults.quizAnswers).toEqual({})
    expect(defaults.elaborateProgress).toEqual({})
    expect(defaults.studentReflection).toBe('')
  })
})
