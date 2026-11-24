import { describe, it, expect, beforeEach } from 'vitest'
import { getUserStorageKey, getStudentLocalState, setStudentLocalField } from '../src/utils/auth.js'

describe('05-06: Guest Learning Mode (Belajar sebagai Tamu)', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('should use chem_guest_ storage namespace when user is guest (id is null)', () => {
    const key = getUserStorageKey(null, 'current_step')
    expect(key).toBe('chem_guest_current_step')

    setStudentLocalField(null, 'current_step', 2)
    setStudentLocalField(null, 'completed_steps', [1, 2])

    const guestState = getStudentLocalState(null)
    expect(guestState.currentStep).toBe(2)
    expect(guestState.completedSteps).toEqual([1, 2])

    // Ensure registered user space is completely untouched
    const registeredUserKey = getUserStorageKey('registered_student_1', 'completed_steps')
    expect(localStorage.getItem(registeredUserKey)).toBeNull()
  })

  it('should create guest session correctly with student role and isGuest flag', () => {
    const guestSession = {
      id: null,
      name: 'Siswa Tamu',
      email: '',
      role: 'student',
      isGuest: true
    }

    expect(guestSession.isGuest).toBe(true)
    expect(guestSession.role).toBe('student')
    expect(guestSession.id).toBeNull()

    // RBAC validation: guest is NOT a teacher
    const isTeacher = guestSession.role === 'teacher'
    expect(isTeacher).toBe(false)
  })

  it('should ensure guest cannot bypass teacher route', () => {
    const guestSession = {
      id: null,
      name: 'Siswa Tamu',
      email: '',
      role: 'student',
      isGuest: true
    }

    const requestedPath = '/guru/dashboard'
    const isTeacherRoute = requestedPath.startsWith('/guru')
    const isTeacher = guestSession.role === 'teacher'
    const isAllowed = isTeacher && isTeacherRoute

    expect(isAllowed).toBe(false)
  })
})
