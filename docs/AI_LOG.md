# CATATAN AUDIT AI & INTERVENSI REKAYASA (AI LOG)

Dokumen ini mencatat kronologi tindakan rekayasa perangkat lunak, keputusan arsitektur, penyelesaian hambatan teknis, dan audit pengujian yang dijalankan oleh agen kecerdasan buatan (*AI Agent*) dalam menyelesaikan 10 temuan umpan balik dosen (`05-01` s.d. `05-10`) pada proyek **CHEMIFY**.

---

## 📜 1. Prinsip & Batasan Rekayasa (Engineering Constraints)

Seluruh intervensi mematuhi aturan berikut:
1. **Satu Temuan Per Commit:** Setiap temuan dikerjakan dan di-*commit* secara terpisah dengan pesan terstandarisasi `fix(05-0X): <deskripsi>`.
2. **Bebas Regresi Fitur Utama:** Menjaga alur model 5E, nilai perhitungan laboratorium virtual ($\text{HCl } 0{,}01\text{ M} \to \text{pH } 2{,}00$; $\text{NaOH } 0{,}01\text{ M} \to \text{pH } 12{,}00$; $\text{Air} \to \text{pH } 7{,}00$), kalkulasi skor kuis, dan fungsi reset.
3. **Validasi Berbasis Bukti Faktual:** Tidak pernah menyajikan status "berhasil" tanpa verifikasi pengujian otomatis riil (`vitest`, `oxlint`, `vite build`).
4. **Data Uji Fiktif Terstandarisasi:** Seluruh data akun pengujian menggunakan domain uji standar RFC: `@example.invalid`.
5. **Standar Linter & Build:** Memastikan kode selalu bersih dari galat linter dan berhasil dikompilasi ke bundel produksi.

---

## 🛠️ 2. Kronologi Intervensi per Temuan

### [05-01] Koreksi Inferensi Kekuatan Basa pada Soal 4 Kuis
- **Analisis:** Soal kuis nomor 4 hanya menyebutkan nilai $\text{pOH} = 3{,}00$ pada $25^\circ\text{C}$. Menentukan sifat "basa kuat" merupakan inferensi berlebih tanpa diketahui konsentrasi molaritas awal larutan.
- **Tindakan:**
  - Mengubah opsi kunci jawaban di `src/data/quizData.js` menjadi *"Larutan memiliki nilai pH = 11,00 dan bersifat basa"*.
  - Menyesuaikan opsi pengecoh agar kunci tetap unik.
  - Memperbarui penjelasan ilmiah pada pembahasan soal.
  - Mengaudit 9 butir soal kuis lainnya untuk memastikan tidak ada kesalahan inferensi serupa.
  - Menulis berkas pengujian otomatis `tests/05-01-quiz.test.js`.
- **Commit:** `42e8b5d` (`fix(05-01): perbaiki inferensi kekuatan basa pada soal 4 kuis`).

---

### [05-02] Update Parsial Refleksi Tanpa Menimpa Progres 5E
- **Analisis:** Pada `src/pages/Results.jsx`, penyimpanan refleksi memanggil helper cloud tanpa menyertakan `completedSteps`, lalu payload ditulis dengan array kosong `[]` sehingga menimpa tahap 1–5 yang sudah diselesaikan siswa.
- **Tindakan:**
  - Memperbarui `src/services/firestoreService.js` pada fungsi `saveStudentProgressToCloud` dengan pola *partial payload update*.
  - Menyertakan `{ merge: true }` pada `setDoc`.
  - Memperbarui pemanggilan di `Results.jsx` dan `App.jsx` agar menyertakan `completedSteps` saat ini.
  - Menulis berkas pengujian otomatis `tests/05-02-reflection-steps.test.js`.
- **Commit:** `a13a0a2` (`fix(05-02): terapkan update parsial pada penyimpanan refleksi dan progres`).

---

### [05-03] Isolasi State Memori & Namespacing Kunci Penyimpanan
- **Analisis:** Penyimpanan lokal menggunakan kunci statis global tanpa UID, sehingga akun yang login di peramban yang sama mewarisi progres akun sebelumnya.
- **Tindakan:**
  - Menambahkan pembersihan state memori pada `App.jsx` sebelum memuat data akun baru.
  - Menerapkan format kunci lokal terisolasi: `chem_<uid>_current_step`, `chem_<uid>_completed_steps`, `chem_<uid>_prediction`, dll.
  - Menyiapkan prefiks `chem_guest_*` untuk mode belajar tamu.
  - Menulis berkas pengujian otomatis `tests/05-03-storage-isolation.test.js`.
- **Commit:** `118c37b` (`fix(05-03): terapkan namespacing penyimpanan per akun dan isolasi state`).

---

### [05-04] Idempotensi Hasil Kuis & Analisis Butir Soal di Panel Guru
- **Analisis:** Hasil kuis dikirim via `addDoc`, menciptakan duplikasi dokumen jika tombol diklik berulang kali atau halaman di-refresh. Panel guru belum memiliki rekap daya serap per butir soal.
- **Tindakan:**
  - Mengonfigurasi ID dokumen deterministik: `quiz_<uid>_v<questionVersion>`.
  - Menggunakan `setDoc` dengan `merge: true` dan menyertakan `questionVersion: 1`.
  - Memperbarui `firestore.rules` untuk melindungi integritas dokumen kuis.
  - Menambahkan kartu Analisis Butir Soal (*Item Analysis*) pada `TeacherDashboard.jsx` yang menghitung persentase kebenaran per butir soal.
  - Menulis berkas pengujian otomatis `tests/05-04-idempotent-quiz-and-rules.test.js`.
- **Commit:** `f4b41c1` (`fix(05-04): cegah duplikasi hasil kuis dan lengkapi panel guru dengan rekap butir`).

---

### [05-05] Validasi Kelengkapan Kuis & Ketahanan Kuota Penyimpanan
- **Analisis:** Kuis dapat dikirim dengan soal kosong, menghasilkan skor keliru. Jika kuota localStorage penuh (*QuotaExceededError*), aplikasi dapat mengalami *crash*.
- **Tindakan:**
  - Menambahkan validasi wajib 10 butir soal pada `src/pages/Evaluate.jsx` lengkap dengan modal peringatan dan tombol langsung menuju soal yang belum terjawab (*Jump to Unanswered*).
  - Menghitung skor secara proporsional terhadap pembagi 10 butir soal.
  - Membuat fungsi pelindung `safeLocalStorageSet` dan `safeLocalStorageGet` pada `src/utils/auth.js` yang menangkap *QuotaExceededError*.
  - Melindungi `ProgressBar.jsx` dari nilai `completedSteps` yang bernilai `null`.
  - Menulis berkas pengujian otomatis `tests/05-05-incomplete-quiz-storage.test.jsx`.
- **Commit:** `5ba0701` (`fix(05-05): validasi kelengkapan kuis dan ketahanan penyimpanan lokal`).

---

### [05-06] Mode Belajar Tamu Tanpa Login Awal (Guest Mode)
- **Analisis:** Siswa dipaksa login sebelum dapat mengakses materi 5E dasar atau mencoba simulasi laboratorium virtual.
- **Tindakan:**
  - Menambahkan tombol "Belajar sebagai Tamu" pada `src/pages/Auth.jsx`.
  - Mengonfigurasi sesi tamu dengan `isGuest: true` dan penyimpanan `chem_guest_*`.
  - Menampilkan banner edukatif pada `Results.jsx` yang menyarankan pendaftaran akun untuk menyimpan data permanen.
  - Memproteksi rute `/guru` agar tidak dapat diakses oleh pengguna tamu.
  - Menulis berkas pengujian otomatis `tests/05-06-guest-mode.test.js`.
- **Commit:** `34a1698` (`fix(05-06): sediakan mode belajar sebagai tamu tanpa login awal`).

---

### [05-07] Empat Status Sinkronisasi Cloud & Penanganan Galat
- **Analisis:** Indikator antarmuka langsung menyatakan refleksi tersimpan tanpa menunggu promise Firestore terselesaikan (*false positive*).
- **Tindakan:**
  - Mengelola 4 status sinkronisasi eksplisit pada `src/pages/Results.jsx`: `local_only`, `pending`, `success`, dan `failed`.
  - Menampilkan lencana status dan pesan peringatan jika terjadi *permission-denied*.
  - Menyediakan tombol coba lagi (*Retry Cloud Sync*) dan memastikan data cadangan tersimpan di penyimpanan lokal.
  - Menulis berkas pengujian otomatis `tests/05-07-cloud-status.test.js`.
- **Commit:** `38df6e0` (`fix(05-07): perbaiki verifikasi status penyimpanan cloud dan penanganan galat`).

---

### [05-08] Persistensi Draf Kuis & Posisi Soal Saat Refresh Browser
- **Analisis:** Pilihan jawaban dan posisi nomor soal hilang jika peramban disegarkan saat pengerjaan kuis.
- **Tindakan:**
  - Menyimpan draf pilihan jawaban ke `chem_<uid>_quiz_draft` setiap kali opsi dipilih.
  - Menyimpan indeks nomor soal aktif ke penyimpanan lokal.
  - Memulihkan draf jawaban dan nomor soal secara otomatis saat `Evaluate.jsx` dimuat ulang.
  - Memastikan kunci jawaban dan pembahasan tetap disembunyikan sampai evaluasi diserahkan.
  - Menulis berkas pengujian otomatis `tests/05-08-quiz-draft.test.jsx`.
- **Commit:** `f2fcc6b` (`fix(05-08): persistensikan draf jawaban kuis dan posisi soal saat refresh`).

---

### [05-09] Aksesibilitas Keyboard Radio Prediksi & Modal Dialog Lupa Sandi
- **Analisis:** Pilihan radio apersepsi pada tahap Engage menggunakan `display: none` sehingga tidak dapat difokuskan via tombol `Tab`. Modal lupa kata sandi belum memiliki atribut ARIA dialog dan *focus trap*.
- **Tindakan:**
  - Mengganti gaya CSS radio menjadi *accessible visually hidden* (`:focus-visible`, `opacity: 0`, `position: absolute`).
  - Menambahkan atribut ARIA pada modal lupa kata sandi: `role="dialog"`, `aria-modal="true"`, dan `aria-labelledby`.
  - Mengimplementasikan *focus trap*, penutupan dengan tombol `Escape`, dan pengembalian fokus ke tombol pemicu.
  - Menulis berkas pengujian otomatis `tests/05-09-a11y.test.jsx`.
- **Commit:** `f0f7945` (`fix(05-09): perbaiki aksesibilitas keyboard radio prediksi dan modal lupa password`).

---

### [05-10] Responsivitas Portal Guru pada Viewport Seluler 375px
- **Analisis:** Tabel monitoring siswa dan kartu ringkasan pada Teacher Dashboard mengalami *overflow* horizontal pada layar ponsel cerdas ($375\text{px}$).
- **Tindakan:**
  - Mengonfigurasi wadah `.table-responsive` dengan `max-width: 100%`, `overflow-x: auto`, dan `-webkit-overflow-scrolling: touch;`.
  - Mengatur `.teacher-data-table` dengan `min-width: 600px` agar sel tetap terbaca dan digulir horizontal di dalam kontainernya saja tanpa membuat seluruh layar meluap.
  - Menambahkan aturan `@media (max-width: 480px)` pada `src/App.css` untuk mengubah tata letak bar filter menjadi vertikal (`flex-direction: column`) dan grid butir soal menjadi 1 kolom (`grid-template-columns: 1fr`).
  - Mengoptimalkan ukuran modal detail siswa pada perangkat seluler.
  - Menulis berkas pengujian otomatis `tests/05-10-viewport-375.test.jsx`.
- **Commit:** `36a4b95` (`fix(05-10): perbaiki responsivitas portal guru pada viewport mobile 375px`).

---

## 🎯 3. Rekapitulasi Metrik Kualitas Akhir

- **Test Files:** 10 berkas uji (100% lulus)
- **Tests Passed:** 28 skenario uji lulus (0 gagal)
- **Linter Status:** 0 error (Oxlint)
- **Production Build:** Berhasil dikompilasi (Vite v8.3.4)
- **Dokumentasi:** Seluruh dokumen arsitektur, panduan pengujian, skema basis data, alur pengguna, tim, backlog, dan README telah lengkap.
