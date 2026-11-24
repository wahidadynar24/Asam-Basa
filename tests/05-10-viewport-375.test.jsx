import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import TeacherDashboard from '../src/pages/TeacherDashboard.jsx'

vi.mock('../src/services/firestoreService', () => ({
  getStudentsFromCloud: vi.fn().mockResolvedValue({ success: false, data: [] })
}))

vi.mock('../src/utils/auth', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getAllStudents: vi.fn().mockReturnValue([
      {
        id: 'student-1',
        name: 'Budi Santoso',
        email: 'budi@example.invalid',
        school: 'SMA Negeri 1 Edukasi',
        grade: 'XI',
        major: 'MIPA',
        completedSteps: [1, 2, 3, 4, 5],
        quizScore: 90,
        quizAnswers: { 1: 'C', 2: 'A' },
        userPrediction: 'Asam',
        userReflection: 'Saya memahami konsep asam basa.'
      }
    ]),
    getTeacherProfile: vi.fn().mockReturnValue({
      name: 'Karenina Zulfa, S.Pd.',
      school: 'SMA Negeri 1 Edukasi',
      subject: 'Kimia SMA'
    })
  }
})

describe('05-10: Responsiveness & 375px Mobile Viewport on Teacher Portal', () => {
  it('should render teacher dashboard with table-responsive container and mobile-friendly classes', async () => {
    const mockUser = {
      id: 'teacher-1',
      name: 'Karenina Zulfa, S.Pd.',
      email: 'karenina.zulfa.2403316@students.um.ac.id',
      role: 'teacher'
    }

    let container
    await act(async () => {
      const rendered = render(
        <TeacherDashboard 
          currentUser={mockUser} 
          onNavigate={() => {}} 
          onPreviewStudentModule={() => {}} 
        />
      )
      container = rendered.container
    })

    // 1. Page container should be present
    const page = container.querySelector('.teacher-dashboard-page')
    expect(page).toBeTruthy()

    // 2. Table must be wrapped in .table-responsive for horizontal scroll containment
    const tableResponsive = container.querySelector('.table-responsive')
    expect(tableResponsive).toBeTruthy()
    const table = tableResponsive.querySelector('table.teacher-data-table')
    expect(table).toBeTruthy()

    // 3. Stats grid, filter bar, and quiz item analysis should have proper class wrappers
    expect(container.querySelector('.teacher-stats-grid')).toBeTruthy()
    expect(container.querySelector('.teacher-filter-bar')).toBeTruthy()
    expect(container.querySelector('.quiz-items-analysis-grid')).toBeTruthy()
  })

  it('should define robust CSS rules in App.css preventing 375px viewport horizontal overflow', () => {
    const cssPath = path.resolve(__dirname, '../src/App.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    // 1. table-responsive has overflow-x: auto and max-width: 100%
    expect(cssContent).toMatch(/\.table-responsive\s*\{[^}]*overflow-x:\s*auto/i)
    expect(cssContent).toMatch(/\.table-responsive\s*\{[^}]*max-width:\s*100%/i)

    // 2. teacher-data-table has min-width for table readability
    expect(cssContent).toMatch(/\.teacher-data-table\s*\{[^}]*min-width:\s*600px/i)

    // 3. Media query for <= 480px / 375px handles teacher filter bar and items analysis
    expect(cssContent).toContain('@media (max-width: 480px)')
    expect(cssContent).toMatch(/\.teacher-filter-bar\s*\{[^}]*flex-direction:\s*column/i)
    expect(cssContent).toMatch(/\.search-input-wrapper\s*\{[^}]*min-width:\s*0/i)
    expect(cssContent).toMatch(/\.quiz-items-analysis-grid\s*\{[^}]*grid-template-columns:\s*1fr/i)
  })

  it('should allow filtering and opening/closing student detail modal in mobile layout', async () => {
    const mockUser = {
      id: 'teacher-1',
      name: 'Karenina Zulfa, S.Pd.',
      email: 'karenina.zulfa.2403316@students.um.ac.id',
      role: 'teacher'
    }

    let container
    await act(async () => {
      const rendered = render(
        <TeacherDashboard 
          currentUser={mockUser} 
          onNavigate={() => {}} 
          onPreviewStudentModule={() => {}} 
        />
      )
      container = rendered.container
    })

    // 1. Filter input can be typed into
    const searchInput = screen.getByPlaceholderText(/Cari nama, email, atau sekolah/i)
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Budi' } })
    })
    expect(searchInput.value).toBe('Budi')

    // 2. Detail button can be clicked to open student modal
    const detailButtons = screen.getAllByRole('button', { name: /Detail/i })
    expect(detailButtons.length).toBeGreaterThan(0)
    act(() => {
      fireEvent.click(detailButtons[0])
    })

    // Modal dialog is displayed
    const modal = container.querySelector('.student-detail-modal-card')
    expect(modal).toBeTruthy()

    // 3. Modal close button works
    const closeBtn = screen.getByRole('button', { name: /Tutup Detail Siswa/i })
    act(() => {
      fireEvent.click(closeBtn)
    })
    expect(container.querySelector('.student-detail-modal-card')).toBeNull()
  })
})
