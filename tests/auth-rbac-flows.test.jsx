import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from '../src/App.jsx'
import Auth from '../src/pages/Auth.jsx'
import * as authUtils from '../src/utils/auth.js'
import { 
  saveStudentProgress, 
  saveQuizEvaluationRecord, 
  saveUserProfile 
} from '../src/services/firestoreService.js'

describe('CHEMIFY Authentication System & RBAC Multi-Flow Verification', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    window.scrollTo = vi.fn()
    vi.restoreAllMocks()
  })

  // 1. Verifikasi Penghapusan Banner / Tombol Portal Guru & Preservasi Opsi Tamu
  it('should render login and register forms without Masuk Portal Guru banner, preserving Masuk sebagai Tamu', () => {
    const { container } = render(<Auth onLoginSuccess={() => {}} />)

    // A. Tidak boleh ada banner atau tombol "Masuk Portal Guru"
    expect(screen.queryByText(/Masuk Portal Guru/i)).toBeNull()
    expect(container.querySelector('.portal-switcher-top-banner')).toBeNull()

    // B. Opsi "Masuk sebagai Tamu" harus tersedia dan memiliki deskripsi
    const guestBtn = screen.getByRole('button', { name: /Masuk sebagai Tamu/i })
    expect(guestBtn).toBeTruthy()
    expect(screen.getByText(/Akses instan seluruh alur 5E/i)).toBeTruthy()

    // C. Pindah ke tab Registrasi: tidak boleh ada pemilih/input role
    const registerTab = screen.getByRole('tab', { name: /Daftar Akun/i })
    fireEvent.click(registerTab)

    expect(screen.queryByText(/Masuk Portal Guru/i)).toBeNull()
    expect(screen.queryByLabelText(/Role|Peran/i)).toBeNull()
  })

  // 2. Alur Guru: Akun Guru diarahkan otomatis ke Teacher Dashboard
  it('should automatically route teacher to Teacher Dashboard after login', async () => {
    // Mock loginUser untuk mensimulasikan otentikasi akun Guru dari Firebase/DB
    vi.spyOn(authUtils, 'loginUser').mockResolvedValue({
      id: 'teacher_karenina_1',
      name: 'Karenina Zulfa, S.Pd.',
      email: 'karenina.zulfa.2403316@students.um.ac.id',
      role: 'teacher',
      school: 'SMA Negeri 1 Edukasi',
      subject: 'Kimia SMA'
    })

    let container
    await act(async () => {
      const rendered = render(<App />)
      container = rendered.container
    })

    const emailInput = container.querySelector('#login-email')
    const passwordInput = container.querySelector('#login-password')

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'karenina.zulfa.2403316@students.um.ac.id' } })
      fireEvent.change(passwordInput, { target: { value: 'Guru123!' } })
    })

    const submitBtn = container.querySelector('button[type="submit"]')
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    // Tunggu transisi navigasi login guru
    await act(async () => {
      await new Promise(r => setTimeout(r, 800))
    })

    // Harus diarahkan otomatis ke Teacher Dashboard
    expect(container.querySelector('.teacher-dashboard-page') || screen.getByText(/Selamat Datang, Karenina/i)).toBeTruthy()
  })

  // 3. Alur Murid: Registrasi & Login Murid Otomatis Role Student dan Diarahkan ke Student Dashboard
  it('should automatically assign student role to regular users and route them to student 5E module', async () => {
    // Mock loginUser untuk akun murid biasa
    vi.spyOn(authUtils, 'loginUser').mockResolvedValue({
      id: 'student_budi_1',
      name: 'Budi Santoso',
      email: 'budi@example.invalid',
      role: 'student',
      school: 'SMA Negeri 1 Edukasi'
    })

    let container
    await act(async () => {
      const rendered = render(<App />)
      container = rendered.container
    })

    const emailInput = container.querySelector('#login-email')
    const passwordInput = container.querySelector('#login-password')

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'budi@example.invalid' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    })

    const submitBtn = container.querySelector('button[type="submit"]')
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    await act(async () => {
      await new Promise(r => setTimeout(r, 800))
    })

    // Murid berada di modul pembelajaran 5E (bukan Teacher Dashboard)
    expect(container.querySelector('.teacher-dashboard-page')).toBeNull()
    expect(container.querySelector('.navbar')).toBeTruthy()
  })

  // 4. Role Security: Pengguna tidak dapat mengubah role sendiri
  it('should prevent client-side role elevation in updateUserProfile and saveUserProfile', async () => {
    // A. updateUserProfile lokal: role pengguna biasa tidak dapat diubah menjadi teacher
    const studentUser = {
      id: 'student_test_1',
      name: 'Siswa Test',
      email: 'siswa.test@example.invalid',
      role: 'student'
    }
    localStorage.setItem('chem_registered_users', JSON.stringify([studentUser]))

    // Coba injeksi role: 'teacher' lewat payload profil
    const updated = authUtils.updateUserProfile(studentUser.id, {
      name: 'Siswa Test Diubah',
      school: 'SMA 1',
      educationLevel: 'SMA',
      grade: 'XI',
      major: 'MIPA',
      role: 'teacher' // Percobaan eskalasi hak akses
    })

    expect(updated.role).toBe('student')

    // B. saveUserProfile service guard: menolak eskalasi role dari client payload
    const cloudRes = await saveUserProfile('test-student-uid', {
      email: 'regular.student@example.invalid',
      role: 'teacher' // Coba kirim role teacher dari client
    })

    if (cloudRes.role) {
      expect(cloudRes.role).toBe('student')
    }
  })

  // 5. Alur Tamu: Akses penuh tanpa login & isolasi data dari Firebase
  it('should allow guest to access 5E features and strictly forbid sending data to Firebase', async () => {
    let container
    await act(async () => {
      const rendered = render(<App />)
      container = rendered.container
    })

    // Klik Masuk sebagai Tamu
    const guestBtn = screen.getByRole('button', { name: /Masuk sebagai Tamu/i })
    await act(async () => {
      fireEvent.click(guestBtn)
    })

    // Tamu dapat mengakses navbar dan tahapan pembelajaran
    expect(container.querySelector('.navbar')).toBeTruthy()
    expect(screen.getByText(/Mode Tamu/i)).toBeTruthy()

    // Verifikasi penyimpanan guest menggunakan namespace chem_guest_
    authUtils.setStudentLocalField(null, 'current_step', 2)
    authUtils.setStudentLocalField(null, 'completed_steps', [1, 2])
    const guestState = authUtils.getStudentLocalState(null)
    expect(guestState.currentStep).toBe(2)
    expect(guestState.completedSteps).toEqual([1, 2])

    // Pastikan fungsi cloud menolak data tamu secara tegas
    const progRes = await saveStudentProgress('guest', { isGuest: true, currentStep: 2 })
    expect(progRes.success).toBe(false)
    expect(progRes.mode).toBe('local')

    const quizRes = await saveQuizEvaluationRecord('guest', { isGuest: true, quizScore: 80 })
    expect(quizRes.success).toBe(false)
    expect(quizRes.mode).toBe('local')

    const userRes = await saveUserProfile('guest', { isGuest: true, name: 'Siswa Tamu' })
    expect(userRes.success).toBe(false)
    expect(userRes.mode).toBe('local')
  })

  // 6. Isolasi Penyimpanan: Data Tamu tidak tercampur dengan akun terdaftar
  it('should keep guest storage completely isolated from registered user storage', () => {
    // Set data tamu
    authUtils.setStudentLocalField(null, 'quiz_score', 80)
    expect(localStorage.getItem('chem_guest_quiz_score')).toBe('80')

    // Set data user terdaftar
    const registeredUid = 'user_mhs_123'
    authUtils.setStudentLocalField(registeredUid, 'quiz_score', 100)
    expect(localStorage.getItem('chem_user_mhs_123_quiz_score')).toBe('100')

    // Pastikan data tamu tidak tertimpa dan tidak saling mencemari
    expect(authUtils.getStudentLocalState(null).quizScore).toBe(80)
    expect(authUtils.getStudentLocalState(registeredUid).quizScore).toBe(100)
  })
})
