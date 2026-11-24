import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import Evaluate from '../src/pages/Evaluate.jsx'
import { getUserStorageKey } from '../src/utils/auth.js'

describe('05-08: Quiz Draft Persistence Across Refreshes', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('should persist unsubmitted answer draft and question index to namespaced key', () => {
    const user = { id: 'student_tester_draft', role: 'student' }
    const draftKey = getUserStorageKey(user.id, 'quiz_draft')

    let answersState = {}
    let scoreState = 0

    const { unmount } = render(
      <Evaluate
        onPrev={() => {}}
        onComplete={() => {}}
        quizAnswers={answersState}
        setQuizAnswers={(fn) => { answersState = typeof fn === 'function' ? fn(answersState) : fn }}
        quizScore={scoreState}
        setQuizScore={(s) => { scoreState = s }}
        currentUser={user}
      />
    )

    // Select option 'a' on Question 1 without clicking "Simpan Jawaban"
    const optionA = screen.getByText(/Mampu menghasilkan ion hidrogen/i).closest('button')
    fireEvent.click(optionA)

    expect(optionA.className).toContain('opt-selected')

    // Verify stored in localStorage draft
    const rawDraft = localStorage.getItem(draftKey)
    expect(rawDraft).toBeTruthy()
    const parsedDraft = JSON.parse(rawDraft)
    expect(parsedDraft.currentIndex).toBe(0)
    expect(parsedDraft.selectedAnswers['1']).toBe('a')

    // Crucial: Explanation feedback MUST NOT be rendered while still a draft!
    expect(screen.queryByText(/Menurut Svante Arrhenius/i)).toBeNull()
    unmount()

    // Simulate page reload/refresh with existing draft
    render(
      <Evaluate
        onPrev={() => {}}
        onComplete={() => {}}
        quizAnswers={{}}
        setQuizAnswers={() => {}}
        quizScore={0}
        setQuizScore={() => {}}
        currentUser={user}
      />
    )

    // Option 'a' should still have 'opt-selected' class from draft!
    const restoredOptionA = screen.getByText(/Mampu menghasilkan ion hidrogen/i).closest('button')
    expect(restoredOptionA.className).toContain('opt-selected')

    // Explanation feedback still NOT shown
    expect(screen.queryByText(/Menurut Svante Arrhenius/i)).toBeNull()
  })

  it('should restore question index when draft had advanced to question 3', () => {
    const user = { id: 'student_tester_index', role: 'student' }
    const draftKey = getUserStorageKey(user.id, 'quiz_draft')

    // Pre-seed draft at index 2 (Question 3)
    localStorage.setItem(draftKey, JSON.stringify({
      currentIndex: 2,
      selectedAnswers: { 3: 'b' }
    }))

    render(
      <Evaluate
        onPrev={() => {}}
        onComplete={() => {}}
        quizAnswers={{}}
        setQuizAnswers={() => {}}
        quizScore={0}
        setQuizScore={() => {}}
        currentUser={user}
      />
    )

    // Should be on Soal 3
    expect(screen.getByText(/Berapakah nilai derajat keasaman/i)).toBeTruthy()
    const optionB = screen.getByText(/Larutan asam memiliki nilai pH = 2,00/i).closest('button')
    expect(optionB.className).toContain('opt-selected')
  })
})
