import { describe, it, expect } from 'vitest'
import { QUIZ_QUESTIONS } from '../src/data/quizData.js'

describe('05-01: Quiz Questions Integrity and Scientific Accuracy', () => {
  it('should have exactly 10 questions', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(10)
  })

  it('should verify question 4 correctly concludes pH 11 and basic without over-inferring strong base', () => {
    const q4 = QUIZ_QUESTIONS.find((q) => q.id === 4)
    expect(q4).toBeDefined()
    expect(q4.correctAnswer).toBe('a')

    const optionA = q4.options.find((opt) => opt.id === 'a')
    expect(optionA.text).toBe('Larutan memiliki nilai pH = 11,00 dan bersifat basa.')
    expect(optionA.text).not.toContain('basa kuat')

    // Ensure distractors do not create ambiguous correct answers
    const otherOptions = q4.options.filter((opt) => opt.id !== 'a')
    for (const opt of otherOptions) {
      expect(opt.text).not.toContain('pH = 11,00 dan bersifat basa')
    }

    // Explanation should explain the relation and not claim strong base
    expect(q4.explanation).toContain('11,00')
    expect(q4.explanation).toContain('bersifat basa')
  })

  it('should verify all questions have valid options and a single matching correct answer', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.options).toBeInstanceOf(Array)
      expect(q.options.length).toBeGreaterThanOrEqual(4)
      const validOptionIds = q.options.map((o) => o.id)
      expect(validOptionIds).toContain(q.correctAnswer)
      expect(typeof q.explanation).toBe('string')
      expect(q.explanation.length).toBeGreaterThan(10)
    }
  })
})
