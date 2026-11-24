import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QUIZ_QUESTIONS } from '../src/data/quizData.js'
import ProgressBar from '../src/components/ProgressBar.jsx'
import { safeLocalStorageSet, safeLocalStorageGet } from '../src/utils/auth.js'

describe('05-05: Incomplete Quiz Validation & Storage Resilience', () => {
  it('should identify unanswered questions and prevent early submission', () => {
    // Simulate user only answered 3 questions: 1, 2, 3
    const partialAnswers = {
      1: { selected: 'a', isCorrect: true },
      2: { selected: 'b', isCorrect: true },
      3: { selected: 'b', isCorrect: true }
    }

    const unanswered = QUIZ_QUESTIONS.filter(q => !partialAnswers[q.id]).map(q => q.id)
    expect(unanswered).toEqual([4, 5, 6, 7, 8, 9, 10])
    expect(unanswered.length).toBe(7)

    // Score calculation must be out of 10 total questions (3 correct = 30%, not 100%)
    let correctCount = 0
    QUIZ_QUESTIONS.forEach(q => {
      if (partialAnswers[q.id]?.isCorrect) correctCount++
    })
    const score = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100)
    expect(score).toBe(30)
    expect(score).not.toBe(100)
  })

  it('should render ProgressBar gracefully when completedSteps is null or corrupt non-array', () => {
    // Corrupted null
    expect(() => {
      render(<ProgressBar currentStep={2} setStep={() => {}} completedSteps={null} />)
    }).not.toThrow()

    // Corrupted string
    expect(() => {
      render(<ProgressBar currentStep={2} setStep={() => {}} completedSteps="corrupt_string" />)
    }).not.toThrow()

    // Corrupted object
    expect(() => {
      render(<ProgressBar currentStep={2} setStep={() => {}} completedSteps={{ bad: true }} />)
    }).not.toThrow()
  })

  it('should handle QuotaExceededError in safeLocalStorageSet without crashing', () => {
    const originalSetItem = Storage.prototype.setItem
    const quotaError = new Error('Quota exceeded')
    quotaError.name = 'QuotaExceededError'

    Storage.prototype.setItem = vi.fn().mockImplementation(() => {
      throw quotaError
    })

    const success = safeLocalStorageSet('test_key', { data: 'test' })
    expect(success).toBe(false) // Safely returned false without throwing

    Storage.prototype.setItem = originalSetItem
  })

  it('should safely read with fallback on storage error in safeLocalStorageGet', () => {
    const originalGetItem = Storage.prototype.getItem
    Storage.prototype.getItem = vi.fn().mockImplementation(() => {
      throw new Error('Access denied')
    })

    const res = safeLocalStorageGet('any_key', 'fallback_val')
    expect(res).toBe('fallback_val')

    Storage.prototype.getItem = originalGetItem
  })
})
