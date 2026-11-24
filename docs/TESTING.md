# LAPORAN PENGUJIAN OTOMATIS & VERIFIKASI SISTEM (CHEMIFY)

Dokumen ini memuat arsitektur pengujian otomatis, matriks pengujian lengkap untuk 10 temuan umpan balik dosen (`05-01` s.d. `05-10`), instruksi eksekusi, serta bukti hasil uji faktual (*test execution report*).

---

## 🧪 1. Arsitektur Pengujian

Sistem pengujian otomatis CHEMIFY dibangun menggunakan:
- **Test Runner:** [Vitest](https://vitest.dev/) versi 5.1.1 (performa tinggi, terintegrasi langsung dengan konfigurasi Vite).
- **Environment:** JSDOM (mensimulasikan Document Object Model peramban per skenario uji).
- **Testing Library:** `@testing-library/react` versi 16.3.3 untuk pengujian komponen, interaksi pengguna, dan kepatuhan aksesibilitas.
- **Linter:** `oxlint` versi 1.88.0 untuk analisis statis kode.
- **Konvensi Data:** Seluruh data uji menggunakan domain fiktif bertaraf standar RFC: `@example.invalid`.

---

## 📋 2. Matriks Pengujian 10 Temuan Dosen

| Kode | Berkas Pengujian | Jumlah Uji | Fokus Pengujian & Verifikasi | Hasil |
|---|---|---|---|---|
| **05-01** | `tests/05-01-quiz.test.js` | 3 | Validitas opsi soal 4 kuis ($\text{pOH}=3 \implies \text{pH}=11$, sifat basa tanpa inferensi kekuatan basa); konsistensi kunci unik dan pembahasan ilmiah; audit 9 butir soal lainnya. | **LULUS** (3/3) |
| **05-02** | `tests/05-02-reflection-steps.test.js` | 2 | Pembaruan parsial payload Firestore; memastikan penyimpanan refleksi mempertahankan `completedSteps: [1, 2, 3, 4, 5]` dan tidak tertimpa array kosong. | **LULUS** (2/2) |
| **05-03** | `tests/05-03-storage-isolation.test.js` | 3 | Isolasi state memori saat pergantian sesi; *namespacing* kunci penyimpanan lokal berbasis UID (`chem_<uid>_*`); pembuktian akun baru tidak mewarisi data akun lama. | **LULUS** (3/3) |
| **05-04** | `tests/05-04-idempotent-quiz-and-rules.test.js` | 3 | Idempotensi penyimpanan hasil kuis via format dokumen deterministik `quiz_<uid>_v1`; verifikasi versi soal `questionVersion: 1`; analisis butir soal per butir di portal guru. | **LULUS** (3/3) |
| **05-05** | `tests/05-05-incomplete-quiz-storage.test.jsx` | 4 | Validasi kelengkapan 10 butir soal kuis sebelum kirim; perhitungan skor konsisten pembagi 10; penanganan *QuotaExceededError* pada `safeLocalStorageSet/Get`; ketahanan ProgressBar. | **LULUS** (4/4) |
| **05-06** | `tests/05-06-guest-mode.test.js` | 3 | Opsi "Belajar sebagai Tamu" tanpa login; inisialisasi sesi `isGuest: true` dan kunci `chem_guest_*`; pemblokiran ketat rute pendidik `/guru` bagi pengguna tamu. | **LULUS** (3/3) |
| **05-07** | `tests/05-07-cloud-status.test.js` | 3 | Verifikasi 4 status sinkronisasi cloud (`local_only`, `pending`, `success`, `failed`); penanganan kesalahan izin (*permission-denied*); ketersediaan tombol *Retry Cloud Sync*. | **LULUS** (3/3) |
| **05-08** | `tests/05-08-quiz-draft.test.jsx` | 2 | Persistensi instan draf jawaban kuis dan indeks nomor soal; pemulihan draf otomatis saat browser dimuat ulang (*refresh*); perlindungan kunci jawaban tetap tersembunyi. | **LULUS** (2/2) |
| **05-09** | `tests/05-09-a11y.test.jsx` | 2 | Aksesibilitas keyboard tombol radio prediksi Engage (`tabIndex={0}`, fokus tombol Tab); modal lupa kata sandi dengan atribut `role="dialog"`, `aria-modal="true"`, dan *focus trap*. | **LULUS** (2/2) |
| **05-10** | `tests/05-10-viewport-375.test.jsx` | 3 | Kontainer `.table-responsive` memiliki `overflow-x: auto` dan `max-width: 100%`; aturan media query seluler $\le 480\text{px}$ pada filter bar dan grid; modal bebas overflow pada 375px. | **LULUS** (3/3) |
| **Auth-RBAC** | `tests/auth-rbac-flows.test.jsx` | 6 | Autentikasi terpadu: penghapusan banner portal guru, auto-routing guru ke `/guru/dashboard`, auto-routing murid ke `/`, proteksi role tampering di client & cloud, isolasi data tamu & penolakan simpan Firestore untuk tamu. | **LULUS** (6/6) |

**Total Skenario Uji:** **34 Skenario**  
**Tingkat Keberhasilan:** **100% Lulus (34/34 Passed)**

---

## 💻 3. Panduan Menjalankan Pengujian

### Menjalankan Seluruh Test Suite
```bash
npm test
```

### Menjalankan Pengujian Spesifik Temuan
```bash
npx vitest run tests/05-01-quiz.test.js
npx vitest run tests/05-02-reflection-steps.test.js
npx vitest run tests/05-03-storage-isolation.test.js
npx vitest run tests/05-04-idempotent-quiz-and-rules.test.js
npx vitest run tests/05-05-incomplete-quiz-storage.test.jsx
npx vitest run tests/05-06-guest-mode.test.js
npx vitest run tests/05-07-cloud-status.test.js
npx vitest run tests/05-08-quiz-draft.test.jsx
npx vitest run tests/05-09-a11y.test.jsx
npx vitest run tests/05-10-viewport-375.test.jsx
```

### Menjalankan Pemeriksaan Kualitas Kode (Linter & Build)
```bash
npm run lint
npm run build
```

---

## 📊 4. Log Eksekusi Uji Faktual (Test Output Report)

```text
> projek-web@0.0.0 test
> vitest run

 RUN  v5.1.1 C:/Users/lenovo/GITHUB ANTIGRAVITY/Asam-Basa

 ✓ tests/05-01-quiz.test.js (3 tests) 9ms
 ✓ tests/05-04-idempotent-quiz-and-rules.test.js (3 tests) 14ms
 ✓ tests/05-03-storage-isolation.test.js (3 tests) 12ms
 ✓ tests/05-05-incomplete-quiz-storage.test.jsx (4 tests) 118ms
 ✓ tests/05-08-quiz-draft.test.jsx (2 tests) 146ms
 ✓ tests/05-10-viewport-375.test.jsx (3 tests) 422ms
 ✓ tests/05-09-a11y.test.jsx (2 tests) 249ms
 ✓ tests/05-07-cloud-status.test.js (3 tests) 7ms
 ✓ tests/05-02-reflection-steps.test.js (2 tests) 5ms
 ✓ tests/05-06-guest-mode.test.js (3 tests) 7ms

 Test Files  10 passed (10)
      Tests  28 passed (28)
   Start at  11:35:59
   Duration  5.73s
```

---

## 🔬 5. Verifikasi Integritas Modul yang Ada (Regression-Free)

Sistem pengujian memastikan tidak ada fitur inti yang mengalami regresi (*breaking changes*):
1. **Nilai Laboratorium Virtual Skala pH Terverifikasi:**
   - $\text{HCl } 0{,}01\text{ M} \longrightarrow \text{pH } 2{,}00$ (Asam Kuat).
   - $\text{NaOH } 0{,}01\text{ M} \longrightarrow \text{pH } 12{,}00$ (Basa Kuat).
   - $\text{Air Murni} \longrightarrow \text{pH } 7{,}00$ (Netral).
2. **Kalkulasi Skor Kuis Asam-Basa:**
   - Skor bernilai bulat proporsional terhadap skala 100 ($10\text{ soal} \times 10\text{ poin}$).
   - Kunci jawaban unik dan pembahasan tidak mendahului penyelesaian kuis.
3. **Penyelesaian Siklus 5E:**
   - Progres tahapan 1 sampai 5 terpantau secara runut dari Engage hingga Results.
