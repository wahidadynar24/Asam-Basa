# BACKLOG PERBAIKAN SISTEM & UMPAN BALIK DOSEN (CHEMIFY)

Dokumen ini mencatat seluruh temuan umpan balik dosen (kode `05-01` s.d. `05-10`), prioritas penanganan, berkas yang diubah, solusi teknis yang diterapkan, nomor *commit*, serta bukti pengujian otomatis yang memvalidasi perbaikan.

---

## 📊 Ringkasan Status Backlog

| Kode | Prioritas | Topik Temuan | Status | Commit | Berkas Pengujian |
|---|---|---|---|---|---|
| **05-01** | P1 | Koreksi inferensi kekuatan basa pada soal 4 kuis | **SELESAI** | `42e8b5d` | `tests/05-01-quiz.test.js` |
| **05-02** | P1 | Update parsial refleksi tanpa mengosongkan completedSteps | **SELESAI** | `a13a0a2` | `tests/05-02-reflection-steps.test.js` |
| **05-03** | P1 | Isolasi state memori & namespacing penyimpanan akun | **SELESAI** | `118c37b` | `tests/05-03-storage-isolation.test.js` |
| **05-04** | P1 | Idempotensi hasil kuis & rekap analisis butir panel guru | **SELESAI** | `f4b41c1` | `tests/05-04-idempotent-quiz-and-rules.test.js` |
| **05-05** | P2 | Validasi kelengkapan 10 soal kuis & ketahanan storage | **SELESAI** | `5ba0701` | `tests/05-05-incomplete-quiz-storage.test.jsx` |
| **05-06** | P2 | Mode belajar tamu tanpa login awal (*Guest Mode*) | **SELESAI** | `34a1698` | `tests/05-06-guest-mode.test.js` |
| **05-07** | P2 | 4 Status sinkronisasi cloud & penanganan galat izin | **SELESAI** | `38df6e0` | `tests/05-07-cloud-status.test.js` |
| **05-08** | P2 | Persistensi draf jawaban kuis & nomor soal saat refresh | **SELESAI** | `f2fcc6b` | `tests/05-08-quiz-draft.test.jsx` |
| **05-09** | P2 | Aksesibilitas keyboard radio prediksi & modal lupa sandi | **SELESAI** | `f0f7945` | `tests/05-09-a11y.test.jsx` |
| **05-10** | P2 | Responsivitas portal guru pada layar mobile 375px | **SELESAI** | `36a4b95` | `tests/05-10-viewport-375.test.jsx` |

---

## 🔍 Rincian Temuan & Solusi Implementasi

### [05-01] Soal 4 menyimpulkan "basa kuat" hanya dari pOH 3
- **Masalah:** Pada soal nomor 4, informasi yang diberikan hanya nilai $\text{pOH} = 3{,}00$ pada suhu $25^\circ\text{C}$. Secara kimia, informasi ini hanya membuktikan bahwa $\text{pH} = 11{,}00$ dan larutan bersifat basa. Menentukan apakah larutan tersebut merupakan basa kuat atau basa lemah membutuhkan informasi konsentrasi molaritas awal larutan.
- **Perbaikan:**
  - Kunci jawaban diubah menjadi: *"Larutan memiliki nilai pH = 11,00 dan bersifat basa"*.
  - Opsi pengecoh disesuaikan agar tidak menimbulkan kunci ganda.
  - Pembahasan ilmiah diperbarui agar konsisten dengan soal, opsi, dan kunci.
  - Dilakukan penelaahan menyeluruh terhadap 9 soal lainnya untuk memastikan tidak ada kesalahan inferensi serupa.
- **Commit:** `42e8b5d` (`fix(05-01): perbaiki inferensi kekuatan basa pada soal 4 kuis`)
- **Pengujian:** `tests/05-01-quiz.test.js` (3 pengujian lulus).

---

### [05-02] Simpan refleksi mengosongkan completedSteps (jalur cloud)
- **Masalah:** Fungsi penyimpanan refleksi memanggil helper progres tanpa menyertakan `completedSteps`, lalu payload tersebut ditulis dengan array kosong `[]`, sehingga tahap 1–5 yang sudah diselesaikan siswa tertimpa menjadi belum selesai.
- **Perbaikan:**
  - Pada `src/services/firestoreService.js`, fungsi `saveStudentProgressToCloud` dimodifikasi menggunakan pola *partial payload*. Field yang bernilai `undefined` tidak diikutsertakan dalam payload `setDoc({ ... }, { merge: true })`.
  - Pada `src/pages/Results.jsx`, pemanggilan fungsi hanya memperbarui `reflection` dan menyertakan `completedSteps` saat ini.
- **Commit:** `a13a0a2` (`fix(05-02): terapkan update parsial pada penyimpanan refleksi dan progres`)
- **Pengujian:** `tests/05-02-reflection-steps.test.js` (2 pengujian lulus).

---

### [05-03] Akun baru mewarisi progres akun sebelumnya di browser yang sama
- **Masalah:** Kunci penyimpanan lokal bersifat global (`chem_student_current_step`, dll.), sehingga saat satu pengguna logout dan pengguna lain login pada browser yang sama, pengguna kedua melihat progres akun pertama.
- **Perbaikan:**
  - Menerapkan isolasi state memori di `src/App.jsx`: saat pengguna berganti, seluruh state memori dikosongkan terlebih dahulu ke nilai default sebelum memuat state pengguna baru.
  - Menerapkan *namespacing* kunci penyimpanan lokal berbasis UID pengguna: `chem_<uid>_current_step`, `chem_<uid>_completed_steps`, `chem_<uid>_prediction`, `chem_<uid>_quiz_score`, `chem_<uid>_reflection`, `chem_<uid>_quiz_draft`.
  - Untuk mode tamu, kunci dipisahkan dengan prefiks `chem_guest_*`.
- **Commit:** `118c37b` (`fix(05-03): terapkan namespacing penyimpanan per akun dan isolasi state`)
- **Pengujian:** `tests/05-03-storage-isolation.test.js` (3 pengujian lulus).

---

### [05-04] Duplikasi hasil kuis di cloud & rekap butir soal di panel guru
- **Masalah:** Pengiriman evaluasi kuis menghasilkan dokumen baru dengan `addDoc`, sehingga jika siswa menekan tombol berulang kali atau menyegarkan halaman, terjadi data ganda. Panel guru juga belum memiliki visualisasi daya serap per butir soal.
- **Perbaikan:**
  - Pengiriman kuis menggunakan ID dokumen deterministik berbasis format `quiz_<uid>_v1` dengan `setDoc(..., { merge: true })`, menjamin sifat idempoten.
  - Setiap rekaman kuis menyertakan `questionVersion: 1`.
  - Aturan keamanan `firestore.rules` dikonfigurasi untuk mencegah duplikasi serta melindungi hak baca/tulis dokumen kuis.
  - Menambahkan panel Analisis Butir Soal (*Item Analysis*) pada Teacher Dashboard yang menghitung persentase kebenaran per butir soal secara dinamis.
- **Commit:** `f4b41c1` (`fix(05-04): cegah duplikasi hasil kuis dan lengkapi panel guru dengan rekap butir`)
- **Pengujian:** `tests/05-04-idempotent-quiz-and-rules.test.js` (3 pengujian lulus).

---

### [05-05] Kuis terkirim dengan soal kosong & skor keliru saat localStorage penuh
- **Masalah:** Siswa dapat mengirimkan kuis meskipun belum menjawab seluruh soal, menghasilkan skor yang tidak merepresentasikan 10 butir soal. Selain itu, jika kuota localStorage penuh (*QuotaExceededError*), aplikasi dapat mengalami kegagalan fungsi (*crash*).
- **Perbaikan:**
  - Menambahkan validasi ketat pada `src/pages/Evaluate.jsx`: jika ada soal yang belum terjawab, tombol kirim dinonaktifkan atau menampilkan modal peringatan daftar butir soal yang belum selesai, lengkap dengan tombol langsung menuju nomor soal tersebut.
  - Skor kuis dihitung secara ketat terhadap pembagi 10 soal ($(\text{benar} / 10) \times 100$).
  - Membuat pembungkus aman `safeLocalStorageSet` dan `safeLocalStorageGet` pada `src/utils/auth.js` yang menangkap galat kuota penyimpanan dan menyediakan *fallback* memori tanpa memicu *crash*.
  - Menambahkan perlindungan pada `ProgressBar.jsx` agar menangani nilai `completedSteps` yang bernilai `null` atau korup tanpa galat kalkulasi.
- **Commit:** `5ba0701` (`fix(05-05): validasi kelengkapan kuis dan ketahanan penyimpanan lokal`)
- **Pengujian:** `tests/05-05-incomplete-quiz-storage.test.jsx` (4 pengujian lulus).

---

### [05-06] Siswa wajib login sebelum belajar materi 5E
- **Masalah:** Siswa dipaksa harus memiliki akun dan login terlebih dahulu sebelum dapat membaca materi dasar atau mencoba simulasi virtual lab, menciptakan hambatan awal belajar (*friction*).
- **Perbaikan:**
  - Menambahkan opsi "Belajar sebagai Tamu" (*Guest Mode*) pada halaman `Auth.jsx` dan navigasi.
  - Pengguna tamu langsung diarahkan ke tahap Engage dengan sesi tamu terisolasi (`isGuest: true`).
  - Menyediakan banner edukatif pada halaman `Results.jsx` yang menginformasikan bahwa data tersimpan di perangkat lokal, dengan opsi pendaftaran akun permanen.
  - Akses rute `/guru` tetap diproteksi secara ketat sehingga pengguna tamu tidak dapat mengakses panel guru.
- **Commit:** `34a1698` (`fix(05-06): sediakan mode belajar sebagai tamu tanpa login awal`)
- **Pengujian:** `tests/05-06-guest-mode.test.js` (3 pengujian lulus).

---

### [05-07] Refleksi tampil "Tersimpan" meski Firestore gagal (permission-denied)
- **Masalah:** Indikator antarmuka langsung menyatakan data tersimpan tanpa menunggu hasil verifikasi dari promise Firestore, sehingga saat terjadi penolakan izin (*permission-denied*) atau kegagalan jaringan, pengguna menerima informasi yang salah (*false positive*).
- **Perbaikan:**
  - Mengimplementasikan 4 status sinkronisasi yang jelas: `local_only`, `pending`, `success`, dan `failed`.
  - Menampilkan lencana status dan pesan galat spesifik jika sinkronisasi cloud gagal, disertai tombol coba lagi (*Retry Cloud Sync*).
  - Data siswa tetap aman tersimpan di penyimpanan lokal sebagai cadangan (*fallback*).
- **Commit:** `38df6e0` (`fix(05-07): perbaiki verifikasi status penyimpanan cloud dan penanganan galat`)
- **Pengujian:** `tests/05-07-cloud-status.test.js` (3 pengujian lulus).

---

### [05-08] Draf kuis hilang saat refresh browser
- **Masalah:** Ketika siswa sedang mengerjakan kuis lalu tidak sengaja memuat ulang (*refresh*) browser, seluruh pilihan jawaban dan posisi nomor soal hilang, memaksa siswa mengulang dari nomor 1.
- **Perbaikan:**
  - Setiap perubahan pilihan jawaban kuis dipersistensikan secara instan ke draf lokal pengguna (`chem_<uid>_quiz_draft`).
  - Indeks nomor soal yang sedang aktif juga disimpan ke penyimpanan lokal.
  - Saat komponen `Evaluate.jsx` dimuat ulang, draf jawaban dan posisi soal dipulihkan secara otomatis.
  - Kunci jawaban dan pembahasan tetap disembunyikan sampai siswa benar-benar menyelesaikan kuis.
- **Commit:** `f2fcc6b` (`fix(05-08): persistensikan draf jawaban kuis dan posisi soal saat refresh`)
- **Pengujian:** `tests/05-08-quiz-draft.test.jsx` (2 pengujian lulus).

---

### [05-09] Radio prediksi & modal lupa password tidak ramah keyboard
- **Masalah:** Input radio pada tahap Engage disembunyikan dengan `display: none`, sehingga pengguna papan ketik (*keyboard*) dan pembaca layar (*screen reader*) tidak dapat memfokuskan opsi via tombol `Tab`. Modal lupa kata sandi juga belum memiliki atribut aksesibilitas dialog dan pengurungan fokus (*focus trap*).
- **Perbaikan:**
  - Memperbarui gaya radio input pada `src/App.css` menggunakan teknik *visually hidden* yang tetap mempertahankan fokus keyboard (`tabIndex={0}`, `:focus-visible`).
  - Menambahkan atribut ARIA pada modal lupa kata sandi: `role="dialog"`, `aria-modal="true"`, dan `aria-labelledby`.
  - Menerapkan *focus trap* di dalam modal, penutupan dengan tombol `Escape`, dan pengembalian fokus ke tombol pemicu saat dialog ditutup.
- **Commit:** `f0f7945` (`fix(05-09): perbaiki aksesibilitas keyboard radio prediksi dan modal lupa password`)
- **Pengujian:** `tests/05-09-a11y.test.jsx` (2 pengujian lulus).

---

### [05-10] Tampilan Portal Guru meluap (overflow) horizontal pada layar 375px
- **Masalah:** Pada perangkat seluler dengan lebar layar sempit (seperti iPhone SE / viewport 375px), tabel monitoring dan kartu ringkasan di Teacher Dashboard mengalami *overflow* horizontal yang merusak tata letak antarmuka.
- **Perbaikan:**
  - Memastikan container tabel `.table-responsive` memiliki properti `max-width: 100%`, `overflow-x: auto`, dan `-webkit-overflow-scrolling: touch;`.
  - Mengonfigurasi `.teacher-data-table` dengan `min-width: 600px` agar sel tetap terbaca dan dapat digulir horizontal di dalam kontainernya saja tanpa membuat halaman meluap.
  - Menambahkan aturan `@media (max-width: 480px)` pada `src/App.css`:
    - Mengubah `.teacher-filter-bar` menjadi `flex-direction: column` dengan input pencarian `width: 100%` dan `min-width: 0`.
    - Mengatur `.quiz-items-analysis-grid` menjadi `grid-template-columns: 1fr`.
    - Mengoptimalkan ukuran banner, padding kartu, dan modal detail siswa.
- **Commit:** `36a4b95` (`fix(05-10): perbaiki responsivitas portal guru pada viewport mobile 375px`)
- **Pengujian:** `tests/05-10-viewport-375.test.jsx` (3 pengujian lulus).
