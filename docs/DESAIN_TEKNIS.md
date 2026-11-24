# DESAIN TEKNIS ARSITEKTUR CHEMIFY

Dokumen ini menjelaskan arsitektur perangkat lunak, pola perancangan teknis (*design patterns*), struktur data, serta solusi rekayasa yang diterapkan pada platform media pembelajaran kimia **CHEMIFY**.

---

## 🏛️ Arsitektur Tingkat Tinggi (High-Level Architecture)

CHEMIFY dibangun menggunakan arsitektur **Single Page Application (SPA)** berbasis **React 19** dan **Vite 8**, yang beroperasi dalam mode ganda (*dual-tier data architecture*): sinkronisasi *cloud real-time* menggunakan **Google Firebase** (Auth & Firestore) dan *offline-first resilience* menggunakan **Browser LocalStorage**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANTARMUKA PENGGUNA (REACT 19 UI)                │
│ ┌───────────────┬───────────────────────────────────┬────────────────┐ │
│ │ Modul Tamu    │ Modul Belajar Siswa 5E            │ Portal Guru    │ │
│ │ (Guest Mode)  │ (Engage, Explore, Explain,        │ (Monitoring &  │ │
│ │               │  Elaborate, Evaluate, Results)    │  Item Analysis)│ │
│ └───────┬───────┴─────────────────┬─────────────────┴────────┬───────┘ │
└─────────┼─────────────────────────┼──────────────────────────┼─────────┘
          │                         │                          │
          ▼                         ▼                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       LAPISAN LOGIKA & KONTROL AKSES                   │
│  - Otentikasi & RBAC Guard (Teacher vs Student vs Guest)               │
│  - State Management & Isolasi Memori Pengguna (App.jsx)                │
│  - Engine Laboratorium Virtual & Perhitungan Kimia (chemCalculations)  │
│  - Evaluasi Kuis & Validasi Kelengkapan Jawaban (quizData & Evaluate)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────────────┐ ┌──────────────────────────────┐
│       PENYIMPANAN CLOUD (FIREBASE)    │ │   PENYIMPANAN LOKAL TERISOLASI│
│  - Firebase Authentication            │ │   - Safe Storage Wrapper     │
│  - Cloud Firestore Collections:       │ │     (QuotaExceeded Handler)  │
│    • users/{uid}                      │ │   - Namespacing Kunci:       │
│    • student_progress/{uid}           │ │     • chem_<uid>_*           │
│    • quiz_results/{attemptId}         │ │     • chem_guest_*           │
│  - Firestore Security Rules           │ │   - Persistensi Draf Kuis    │
└───────────────────────────────────────┘ └──────────────────────────────┘
```

---

## 🔒 1. Role-Based Access Control (RBAC) & Proteksi Rute

Sistem membedakan tiga tingkatan peran pengguna:
1. **Teacher (Pendidik):**
   - Hak akses eksklusif ke Portal Guru (`/guru`, `/guru/profil`, `/guru/dashboard`).
   - Email pengampu diverifikasi terhadap whitelist resmi: `karenina.zulfa.2403316@students.um.ac.id` (dan fallback sistem `guru@chemify.edu`).
   - Penetapan peran dilakukan di lapisan data pengguna (`role: 'teacher'`) dan dijaga ketat agar tidak dapat ditingkatkan oleh pengguna biasa (*role tampering prevention*).
   - Setelah login melalui formulir terpadu (tanpa banner portal terpisah), sistem secara otomatis mengarahkan pendidik ke Teacher Dashboard (`/guru/dashboard`).
2. **Student (Siswa):**
   - Seluruh akun baru yang mendaftar secara default memperoleh `role: 'student'`.
   - Setelah login, diarahkan secara otomatis ke Student Dashboard / Modul Pembelajaran 5E (`/`).
   - Mengakses alur pembelajaran 5E, pengerjaan kuis, dan pengisian refleksi.
   - Dilarang keras mengakses `/guru`. Jika siswa mencoba mengakses URL tersebut secara langsung, komponen `App.jsx` memblokir akses dan merender layar **403 Forbidden Access** (`.access-denied-layout`).
3. **Guest (Pengguna Tamu):**
   - Siswa yang memilih "Masuk sebagai Tamu" tanpa mendaftar akun (`isGuest: true`, `role: 'guest'`).
   - Sesi disimpan secara aman di `sessionStorage` (bukan `localStorage`), dan kunci data terisolasi dalam *namespace* `chem_guest_*`.
   - Dapat mengakses penuh alur materi 5E dan simulasi laboratorium virtual.
   - **Defense-in-Depth Cloud Guard:** Fungsi Firestore `saveUserProfile`, `saveStudentProgress`, dan `saveQuizEvaluationRecord` serta debounced sync di `App.jsx` secara ketat menolak pengiriman data tamu ke cloud Firebase Firestore.
   - Akses ke `/guru` diblokir total.

---

## 🔄 2. Isolasi State Memori & Namespacing Penyimpanan (Temuan 05-03)

### Masalah Desain Sebelumnya
Kunci *local storage* sebelumnya menggunakan nama statis tanpa identitas pengguna (misal: `chem_student_current_step`), menyebabkan data akun lama mencemari akun baru pada peramban yang sama.

### Solusi Rekayasa
1. **Reset State Memori Bersih:**
   Pada `src/App.jsx`, ketika pengguna berubah atau melakukan pergantian sesi, `useEffect` pemantau sesi mengosongkan state memori ke nilai *default* terlebih dahulu (`isStateLoadedForUserRef.current = null`) sebelum memuat data akun baru.
2. **Namespacing Kunci Berbasis UID:**
   Setiap data pengguna disimpan menggunakan kunci terisolasi:
   - `chem_<uid>_current_step`
   - `chem_<uid>_completed_steps`
   - `chem_<uid>_prediction`
   - `chem_<uid>_quiz_score`
   - `chem_<uid>_reflection`
   - `chem_<uid>_quiz_draft`
3. **Isolasi Mode Tamu:**
   Untuk pengguna tamu, seluruh data disimpan dengan prefiks `chem_guest_*` sehingga tidak pernah bertabrakan dengan akun yang terdaftar.

---

## 📝 3. Pembaruan Parsial Firestore (Temuan 05-02)

### Masalah Desain Sebelumnya
Saat menyimpan refleksi pada halaman akhir, helper dipanggil tanpa menyertakan `completedSteps`, lalu payload ditulis dengan array kosong `[]` yang menimpa progres tahap 1–5 menjadi kosong.

### Solusi Rekayasa
Menerapkan pola **Partial Payload Update**:
```javascript
// src/services/firestoreService.js
export async function saveStudentProgressToCloud(uid, data) {
  const payload = {
    updatedAt: new Date().toISOString()
  };

  if (data.currentStep !== undefined) payload.currentStep = data.currentStep;
  if (data.completedSteps !== undefined) payload.completedSteps = data.completedSteps;
  if (data.prediction !== undefined) payload.prediction = data.prediction;
  if (data.quizScore !== undefined) payload.quizScore = data.quizScore;
  if (data.reflection !== undefined) payload.reflection = data.reflection;

  await setDoc(doc(db, 'student_progress', uid), payload, { merge: true });
}
```
Dengan pola ini, dokumen yang tidak disertakan dalam pembaruan tidak akan terhapus atau tertimpa dengan nilai kosong.

---

## 🎯 4. Idempotensi Hasil Kuis & Analisis Butir Soal (Temuan 05-04)

### Idempotensi Evaluasi
Untuk mencegah data ganda akibat pengiriman berulang atau penyegaran halaman:
1. ID dokumen Firestore ditetapkan secara deterministik:
   $$\text{attemptId} = \text{quiz\_} + \text{uid} + \text{\_v} + \text{questionVersion}$$
   Contoh: `quiz_user123_v1`.
2. Pengiriman menggunakan `setDoc(doc(db, 'quiz_results', attemptId), payload, { merge: true })`, menjamin operasi bersifat idempoten meskipun tombol ditekan beberapa kali.

### Analisis Butir Soal di Portal Guru
Setiap jawaban siswa dipetakan terhadap kunci jawaban untuk menghitung persentase daya serap per butir soal:
$$\text{Akurasi Butir } i = \frac{\sum \text{Jawaban Benar Soal } i}{\sum \text{Total Siswa Menjawab Soal } i} \times 100\%$$
Status daya serap dikelompokkan menjadi:
- $\ge 75\%$: **Dikuasai Baik** (Lencana Hijau).
- $50\% - 74\%$: **Cukup** (Lencana Kuning).
- $< 50\%$: **Perlu Penguatan Konsep** (Lencana Merah).

---

## 🛡️ 5. Validasi Kelengkapan Kuis & Ketahanan Penyimpanan (Temuan 05-05)

### Validasi Kelengkapan 10 Soal
1. Pada `src/pages/Evaluate.jsx`, sistem memeriksa apakah seluruh 10 butir soal telah memiliki jawaban terdaftar.
2. Jika siswa mencoba mengirimkan kuis dengan butir soal yang belum terjawab:
   - Muncul kotak peringatan interaktif (`.quiz-incomplete-warning-box`) yang mencantumkan nomor soal yang masih kosong.
   - Disediakan tombol jalan pintas (*Jump to Unanswered*) yang langsung memindahkan fokus siswa ke soal yang belum terjawab.
3. Skor evaluasi dihitung secara konsisten terhadap pembagi 10 butir soal:
   $$\text{Skor Kuis} = \frac{\text{Jumlah Benar}}{10} \times 100$$

### Ketahanan Kuota Penyimpanan (Storage Resilience)
Untuk mencegah kegagalan aplikasi akibat kuota peramban penuh (*QuotaExceededError*):
- Dibuat fungsi pelindung `safeLocalStorageSet(key, value)` dan `safeLocalStorageGet(key, fallback)`.
- Jika `localStorage.setItem` melemparkan galat *QuotaExceededError*, sistem mencatat peringatan di konsol tanpa menyebabkan aplikasi berhenti (*crash*).

---

## 💾 6. Persistensi Draf Jawaban & Posisi Soal (Temuan 05-08)

1. **Penyimpanan Draf Instan:**
   Setiap kali siswa memilih opsi jawaban pada kuis, state draf segera disinkronkan ke penyimpanan lokal akun (`chem_<uid>_quiz_draft`).
2. **Penyimpanan Posisi Nomor Soal:**
   Indeks nomor soal yang sedang dikerjakan (`currentQuestionIndex`) juga dipersistensikan.
3. **Pemulihan Otomatis:**
   Ketika halaman disegarkan (*refresh*), komponen `Evaluate.jsx` membaca draf dan indeks nomor soal dari penyimpanan lokal, sehingga siswa melanjutkan persis di posisi sebelum *refresh*.
4. **Pencegahan Kebocoran Kunci:**
   Kunci jawaban dan pembahasan pedagogis tidak dirender ke DOM hingga kuis secara resmi diserahkan (*submitted*).

---

## ☁️ 7. Empat Status Sinkronisasi Cloud (Temuan 05-07)

Komponen `Results.jsx` mengelola 4 status sinkronisasi cloud yang transparan kepada pengguna:
1. `local_only`: Menandakan aplikasi berjalan dalam mode *offline* atau mode tamu, data aman di penyimpanan lokal.
2. `pending`: Menandakan proses pengiriman data refleksi ke Firestore sedang berlangsung (menampilkan spinner/animasi).
3. `success`: Menandakan data telah diverifikasi berhasil tersimpan di Firestore.
4. `failed`: Menandakan terjadi galat (misal: *permission-denied* atau koneksi putus). Menampilkan pesan peringatan jelas, penjelasan bahwa data tetap aman di perangkat lokal, serta tombol coba lagi (*Retry Cloud Sync*).

---

## ♿ 8. Aksesibilitas Keyboard & Standar ARIA (Temuan 05-09)

1. **Input Radio Prediksi (Tahap Engage):**
   - Mengganti teknik `display: none` dengan teknik *accessible hidden* (`opacity: 0`, `position: absolute`, `width: 1px`, `height: 1px`).
   - Elemen radio tetap dapat difokuskan menggunakan tombol `Tab` pada keyboard dan menampilkan *focus ring* visual (`:focus-visible`).
   - Kontainer grup dilengkapi atribut `role="radiogroup"` dan `aria-label`.
2. **Modal Dialog Lupa Kata Sandi:**
   - Dilengkapi atribut `role="dialog"`, `aria-modal="true"`, dan `aria-labelledby="modal-forgot-password-title"`.
   - Mengimplementasikan pengurungan fokus (*focus trap*), penutupan via tombol `Escape`, dan pengembalian fokus ke tombol pemicu saat dialog ditutup.

---

## 📱 9. Tata Letak Responsif & Viewport 375px (Temuan 05-10)

Untuk menjamin antarmuka Portal Guru tidak meluap (*overflow*) horizontal pada layar ponsel kecil:
1. **Pembungkus Tabel:** `.table-responsive` dikonfigurasi dengan:
   ```css
   .table-responsive {
     width: 100%;
     max-width: 100%;
     overflow-x: auto;
     -webkit-overflow-scrolling: touch;
     display: block;
     box-sizing: border-box;
   }
   ```
2. **Lebar Minimum Tabel:** `.teacher-data-table` diberi `min-width: 600px` agar teks dan tombol tidak terjepit, sehingga tabel dapat digulir horizontal secara halus di dalam kontainernya saja tanpa membuat seluruh halaman bergeser.
3. **Media Query Seluler ($\le 480\text{px}$):**
   - `.teacher-filter-bar` beralih ke `flex-direction: column` dengan input pencarian selebar $100\%$.
   - `.quiz-items-analysis-grid` beralih ke `grid-template-columns: 1fr`.
   - `.teacher-stats-grid` beralih ke 1 kolom.
   - Modal detail siswa menyesuaikan lebar terhadap layar (`width: calc(100vw - 20px)`).

---

## ⚗️ 10. Perhitungan Kimia Terverifikasi Laboratorium Virtual

Logika perhitungan pada modul Explore (`src/utils/chemCalculations.js`) mematuhi prinsip kimia larutan encer pada $25^\circ\text{C}$ ($K_w = 1{,}0 \times 10^{-14}$):
- **Asam Klorida ($\text{HCl}$) $0{,}01\text{ M}$:**
  $$[\text{H}^+] = 0{,}01\text{ M} = 10^{-2}\text{ M} \implies \text{pH} = -\log(10^{-2}) = 2{,}00$$
- **Natrium Hidroksida ($\text{NaOH}$) $0{,}01\text{ M}$:**
  $$[\text{OH}^-] = 0{,}01\text{ M} \implies \text{pOH} = -\log(10^{-2}) = 2{,}00 \implies \text{pH} = 14 - 2{,}00 = 12{,}00$$
- **Air Murni ($\text{H}_2\text{O}$):**
  $$[\text{H}^+] = [\text{OH}^-] = 10^{-7}\text{ M} \implies \text{pH} = 7{,}00$$
- **Koreksi Inferensi Soal 4 Kuis (05-01):**
  Diketahui $\text{pOH} = 3{,}00 \implies \text{pH} = 14 - 3{,}00 = 11{,}00 \implies$ larutan bersifat **basa**. Kekuatan basa (kuat vs lemah) tidak disimpulkan tanpa informasi konsentrasi awal.
