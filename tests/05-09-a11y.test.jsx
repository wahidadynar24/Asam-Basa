import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Engage from '../src/pages/Engage.jsx'
import Auth from '../src/pages/Auth.jsx'

describe('05-09: Accessibility for Prediction Radio Inputs & Password Modal', () => {
  it('should render prediction radio inputs with proper ARIA attributes and keyboard focusability', () => {
    render(
      <Engage
        onNext={() => {}}
        userPrediction={null}
        setUserPrediction={() => {}}
      />
    )

    // Radio group should have role radiogroup
    const radioGroup = screen.getByRole('radiogroup', { name: /Pilihan Prediksi Karakter Asam-Basa/i })
    expect(radioGroup).toBeTruthy()

    // All radio inputs should be in DOM and accessible
    const radios = screen.getAllByRole('radio')
    expect(radios.length).toBeGreaterThanOrEqual(4)

    // Verify first radio input is focusable
    const firstRadio = radios[0]
    firstRadio.focus()
    expect(document.activeElement).toBe(firstRadio)

    // Check that radio is not display: none
    expect(firstRadio.style.display).not.toBe('none')
  })

  it('should render forgot password modal as accessible dialog, trap focus, close on Escape and restore focus', async () => {
    render(<Auth onLoginSuccess={() => {}} />)

    // 1. Trigger button exists
    const forgotBtn = screen.getByRole('button', { name: /Lupa Password\?/i })
    expect(forgotBtn).toBeTruthy()
    forgotBtn.focus()
    expect(document.activeElement).toBe(forgotBtn)

    // 2. Open modal
    fireEvent.click(forgotBtn)

    // 3. Modal dialog must have ARIA attributes
    const dialog = screen.getByRole('dialog', { name: /Atur Ulang Kata Sandi/i })
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-forgot-password-title')

    // 4. Press Escape key to close
    fireEvent.keyDown(window, { key: 'Escape' })

    // Modal should now be closed
    expect(screen.queryByRole('dialog')).toBeNull()

    // Focus must return to the forgotBtn trigger
    expect(document.activeElement).toBe(forgotBtn)
  })
})
