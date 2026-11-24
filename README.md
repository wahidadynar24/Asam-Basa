# CHEMIFY — Media Pembelajaran Kimia Asam-Basa Berbasis Model 5E

![CHEMIFY Banner](https://img.shields.io/badge/CHEMIFY-Kimia%20Asam%20Basa-0284c7?style=for-the-badge&logo=atom)
![React](https://img.shields.io/badge/React-19.3.1-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.3.4-646cff?style=for-the-badge&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-ffca28?style=for-the-badge&logo=firebase)
![Tests](https://img.shields.io/badge/Tests-28%20Passed-22c55e?style=for-the-badge&logo=vitest)

CHEMIFY adalah platform pembelajaran kimia digital interaktif yang dirancang khusus untuk siswa SMA Kelas XI pada materi **Asam dan Basa**. Website ini mengimplementasikan siklus belajar **Model 5E** (*Engage, Explore, Explain, Elaborate, Evaluate*) secara terpadu, dilengkapi dengan laboratorium virtual, visualisasi interaktif pergeseran ion, evaluasi kuis komprehensif, serta sistem pemantauan pendidik (*Teacher Portal*) berbasis Role-Based Access Control (RBAC).

---

## 🌟 Fitur Utama

### 1. Siklus Pembelajaran 5E Komprehensif
- **Engage (Apersepsi):** Eksplorasi fenomena asam-basa dalam kehidupan nyata (lemon, cuka, sabun, soda) dengan input prediksi hipotesis awal siswa.
- **Explore (Laboratorium Virtual Skala pH & Konsentrasi Ion):**
  - Simulasi larutan interaktif dengan slider konsentrasi ($0{,}001\text{ M} - 1{,}0\text{ M}$).
  - Verifikasi nilai perhitungan kimia akurat:
    - $\text{HCl } 0{,}01\text{ M} \longrightarrow \text{pH } 2{,}00$ (Asam Kuat).
    - $\text{NaOH } 0{,}01\text{ M} \longrightarrow \text{pH } 12{,}00$ (Basa Kuat).
    - $\text{Air Murni} \longrightarrow \text{pH } 7{,}00$ (Netral).
  - *Ion Visualizer* dinamis: merepresentasikan perbandingan jumlah ion $\text{H}^+$ dan $\text{OH}^-$.
- **Explain (Konsep & Teori Asam-Basa):**
  - Teori Arrhenius, Brønsted-Lowry, dan Lewis dalam kartu interaktif terstruktur.
  - Konsep pH, pOH, tetapan kesetimbangan air ($K_w$), serta asam-basa kuat vs lemah.
- **Elaborate (Penerapan Kontekstual):**
  - Analisis kasus dunia nyata: pengasaman air laut (*ocean acidification*), pengelompokan bahan pembersih rumah tangga, dan keasaman minuman kemasan.
- **Evaluate (Evaluasi & Kuis Pemahaman):**
  - 10 butir soal kuis pilihan ganda komprehensif (versi soal `v1.0`).
  - Umpan balik pedagogis dan pembahasan ilmiah langsung setelah evaluasi diselesaikan.
  - Validasi kelengkapan jawaban (seluruh 10 soal wajib dijawab sebelum kirim).
  - Ketahanan draf jawaban: pilihan jawaban dan indeks nomor soal tetap tersimpan saat halaman dimuat ulang (*refresh*).
- **Results & Reflection (Hasil Belajar & Refleksi):**
  - Skor evaluasi akhir, rekapitulasi tahapan 5E, serta formulir refleksi pemahaman siswa.
  - Umpan balik status sinkronisasi cloud 4 kondisi (*local only*, *pending*, *success*, *failed*) dilengkapi tombol coba lagi (*retry*).

### 2. Dual-Mode Pembelajaran: Akun Terdaftar & Mode Tamu
- **Mode Tamu (Belajar Tanpa Login Awal):** Siswa dapat langsung memulai belajar dari beranda tanpa hambatan registrasi. Seluruh progres dan draf disimpan aman di penyimpanan lokal terisolasi (`chem_guest_*`).
- **Mode Akun Terdaftar:** Siswa yang memiliki akun dapat menyinkronkan data profil, progres 5E, dan nilai kuis secara otomatis ke Google Cloud Firestore.

### 3. Role-Based Access Control (RBAC) & Portal Guru
- **Akun Guru (Teacher):** Ditetapkan secara aman via backend/database pada email:
  `karenina.zulfa.2403316@students.um.ac.id`.
- **Portal Pendidik (`/guru`):**
  - Pemantauan progres belajar 5E siswa secara *real-time*.
  - Analisis daya serap dan akurasi per butir soal kuis (*Item Analysis* 10 soal).
  - Pratinjau modul siswa (*Student Preview Mode*).
  - Desain antarmuka responsif ramah layar ponsel cerdas (*viewport* $\le 375\text{px}$) dengan tabel gulir horizontal yang rapi.
- **Proteksi Rute Ketat:** Siswa dan pengguna tamu yang mencoba mengakses `/guru` diblokir langsung oleh *route guard* dan dialihkan ke layar *403 Forbidden*.

---

## 🛠️ Arsitektur Teknologi

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Framework UI** | React 19.3.1 | Komponen modular dan reaktif |
| **Build Tool** | Vite 8.3.4 | Kompilasi cepat dan HMR instan |
| **Database & Auth** | Firebase 12.16.0 | Firebase Auth & Cloud Firestore |
| **Linter** | Oxlint 1.88.0 | Linter kode performa tinggi |
| **Unit & Integration Test**| Vitest 5.1.1 + Testing Library | Pengujian otomatis 10/10 temuan dosen |
| **Styling** | Vanilla CSS Modern | Desain minimalis edukatif responsif |

---

## 🚀 Panduan Memulai Cepat

### 1. Prasyarat Sistem
- Node.js versi 18 atau lebih baru.
- npm versi 9 atau lebih baru.

### 2. Pemasangan Dependensi
```bash
# Clone repositori
git clone https://github.com/username/chemify-asam-basa.git
cd chemify-asam-basa

# Pasang pustaka dependensi
npm install
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban pada alamat `http://localhost:5173`.

### 4. Menjalankan Pengujian Otomatis
```bash
# Menjalankan seluruh test suite Vitest
npm test

# Menjalankan linter kode
npm run lint

# Membangun bundel produksi
npm run build
```

---

## 📚 Indeks Dokumentasi

Dokumentasi lengkap pengembangan dan penyempurnaan sistem CHEMIFY tersedia di direktori `docs/`:
- [Desain Teknis Arsitektur Sistem (`docs/DESAIN_TEKNIS.md`)](file:///c:/Users/lenovo/GITHUB%20ANTIGRAVITY/Asam-Basa/docs/DESAIN_TEKNIS.md)
- [Alur Pengguna & State Diagram (`docs/USER_FLOW.md`)](file:///c:/Users/lenovo/GITHUB%20ANTIGRAVITY/Asam-Basa/docs/USER_FLOW.md)
- [Daftar Backlog & Riwayat Perbaikan Temuan Dosen (`docs/BACKLOG.md`)](file:///c:/Users/lenovo/GITHUB%20ANTIGRAVITY/Asam-Basa/docs/BACKLOG.md)
- [Struktur Database & Keamanan Firestore (`docs/DATABASE.md`)](file:///c:/Users/lenovo/GITHUB%20ANTIGRAVITY/Asam-Basa/docs/DATABASE.md)
- [Laporan Pengujian Otomatis & Skenario Uji (`docs/TESTING.md`)](file:///c:/Users/lenovo/GITHUB%20ANTIGRAVITY/Asam-Basa/docs/TESTING.md)
- [Struktur Tim & Pembagian Peran (`docs/TEAM.md`)](file:///c:/Users/lenovo/GITHUB%20ANTIGRAVITY/Asam-Basa/docs/TEAM.md)
- [Catatan Audit AI & Intervensi Sistem (`docs/AI_LOG.md`)](file:///c:/Users/lenovo/GITHUB%20ANTIGRAVITY/Asam-Basa/docs/AI_LOG.md)

---

## 🧪 Bukti Verifikasi Kimia & Pengujian
Seluruh logika ilmiah dan stabilitas aplikasi diverifikasi melalui 10 berkas pengujian otomatis di direktori `tests/`:
1. `tests/05-01-quiz.test.js`: Validitas opsi dan inferensi ilmiah soal kuis nomor 4.
2. `tests/05-02-reflection-steps.test.js`: Pembaruan parsial refleksi tanpa menimpa progres 5E.
3. `tests/05-03-storage-isolation.test.js`: Isolasi memori dan *namespacing* penyimpanan per UID.
4. `tests/05-04-idempotent-quiz-and-rules.test.js`: Idempotensi penyimpanan kuis dan aturan keamanan Firestore.
5. `tests/05-05-incomplete-quiz-storage.test.jsx`: Validasi kelengkapan 10 butir soal kuis & penanganan kuota penyimpanan.
6. `tests/05-06-guest-mode.test.js`: Mode belajar tamu tanpa login awal dan pembatasan rute guru.
7. `tests/05-07-cloud-status.test.js`: Verifikasi 4 status sinkronisasi cloud dan tombol coba lagi.
8. `tests/05-08-quiz-draft.test.jsx`: Ketahanan draf jawaban dan nomor soal saat halaman disegarkan.
9. `tests/05-09-a11y.test.jsx`: Aksesibilitas keyboard tombol radio prediksi dan modal dialog lupa kata sandi.
10. `tests/05-10-viewport-375.test.jsx`: Penataan responsif portal guru bebas *overflow* horizontal pada layar 375px.
