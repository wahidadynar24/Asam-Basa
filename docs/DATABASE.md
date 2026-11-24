# SKEMA BASIS DATA & KEAMANAN FIRESTORE (CHEMIFY)

Dokumen ini mendokumentasikan spesifikasi model data, skema koleksi Google Cloud Firestore, aturan keamanan (*Security Rules*), serta pemetaan kunci penyimpanan lokal (*LocalStorage*) yang digunakan pada platform pembelajaran **CHEMIFY**.

---

## 🗄️ 1. Arsitektur Data Dua Tingkat (Dual-Tier Data Architecture)

Platform CHEMIFY menggunakan pendekatan arsitektur data hibrida:
1. **Tier 1 — Cloud Database (Google Cloud Firestore):** Digunakan untuk persistensi jangka panjang data akun, sinkronisasi progres belajar siswa, pengumpulan portofolio kuis, dan penyajian data analitik ke portal pendidik.
2. **Tier 2 — Local Storage Terisolasi (Browser LocalStorage):** Digunakan untuk *caching* sesi instan, draf pengerjaan kuis *real-time*, isolasi data per akun (`chem_<uid>_*`), serta mode belajar tamu (*Guest Mode*) tanpa dependensi jaringan.

---

## ☁️ 2. Skema Koleksi Cloud Firestore

### A. Koleksi `users`
- **Jalur Dokumen:** `users/{uid}`
- **Fungsi:** Menyimpan data identitas pribadi, informasi akademik, dan peran (*role*) pengguna.

| Field | Tipe Data | Keterangan | Contoh Nilai |
|---|---|---|---|
| `id` | `string` | ID unik akun pengguna (UID) | `"usr_karenina_24"` |
| `email` | `string` | Alamat email terdaftar | `"karenina.zulfa.2403316@students.um.ac.id"` |
| `name` | `string` | Nama lengkap pengguna | `"Karenina Zulfa, S.Pd."` |
| `role` | `string` | Hak akses sistem: `'teacher'` atau `'student'` | `'teacher'` |
| `school` | `string` | Nama instansi sekolah | `"SMA Negeri 1 Edukasi"` |
| `grade` | `string` | Tingkatan kelas (`'X'`, `'XI'`, `'XII'`) | `'XI'` |
| `major` | `string` | Peminatan / jurusan (misal: MIPA) | `'MIPA'` |
| `absentNumber`| `string` | Nomor presensi siswa (opsional) | `"14"` |
| `bio` | `string` | Deskripsi singkat profil pengguna | `"Pendidik Kimia SMA"` |
| `photoUrl` | `string` | URL atau data Base64 foto profil | `""` |
| `createdAt` | `string (ISO)`| Waktu pembuatan akun | `"2026-11-24T10:00:00.000Z"` |
| `updatedAt` | `string (ISO)`| Waktu pembaruan profil terakhir | `"2026-11-24T11:20:00.000Z"` |

---

### B. Koleksi `student_progress`
- **Jalur Dokumen:** `student_progress/{uid}`
- **Fungsi:** Menyimpan rekam jejak penyelesaian tahapan model pembelajaran 5E, hipotesis awal (*prediction*), dan catatan refleksi belajar siswa.

| Field | Tipe Data | Keterangan | Contoh Nilai |
|---|---|---|---|
| `uid` | `string` | UID siswa pemilik progres | `"usr_student_01"` |
| `currentStep` | `number` | Indeks tahap aktif saat ini (1–5) | `5` |
| `completedSteps` | `array<number>`| Daftar tahap 5E yang telah tuntas | `[1, 2, 3, 4, 5]` |
| `prediction` | `string` | Prediksi awal siswa pada tahap Engage | `"Larutan asam menghasilkan ion H+"` |
| `quizScore` | `number` | Skor evaluasi kuis akhir (0–100) | `90` |
| `reflection` | `string` | Catatan refleksi akhir siswa (Results) | `"Saya memahami hubungan Kw, pH, dan pOH"`|
| `updatedAt` | `string (ISO)`| Waktu pembaruan data terakhir | `"2026-11-24T11:25:00.000Z"` |

> [!IMPORTANT]
> **Pola Update Parsial (Temuan 05-02):**
> Penyimpanan progres pada fungsi `saveStudentProgressToCloud` wajib menyertakan `{ merge: true }` dan hanya memperbarui field yang terdefinisi (*non-undefined*). Dilarang menimpa `completedSteps` dengan array kosong saat hanya menyimpan `reflection`.

---

### C. Koleksi `quiz_results`
- **Jalur Dokumen:** `quiz_results/{attemptId}`
- **Fungsi:** Menyimpan hasil pengerjaan kuis siswa untuk analisis daya serap pendidik.
- **Konvensi Penamaan ID (Idempotensi — Temuan 05-04):**
  $$\text{attemptId} = \text{"quiz\_"} + \text{uid} + \text{"\_v"} + \text{questionVersion}$$
  Contoh: `quiz_usr_student_01_v1`.

| Field | Tipe Data | Keterangan | Contoh Nilai |
|---|---|---|---|
| `attemptId` | `string` | ID deterministik percobaan kuis | `"quiz_usr_student_01_v1"` |
| `uid` | `string` | UID siswa yang mengerjakan kuis | `"usr_student_01"` |
| `studentName` | `string` | Nama siswa saat evaluasi dikirim | `"Budi Santoso"` |
| `studentEmail`| `string` | Email siswa | `"budi@example.invalid"` |
| `score` | `number` | Skor akhir evaluasi ($0-100$) | `90` |
| `correctCount`| `number` | Jumlah butir soal benar ($0-10$) | `9` |
| `totalQuestions`|`number`| Total butir soal yang diujikan | `10` |
| `answers` | `map<string, string>`| Peta jawaban siswa per butir soal | `{"1": "C", "2": "A", "4": "C", ...}`|
| `questionVersion`|`number`| Versi instrumen soal evaluasi | `1` |
| `submittedAt`| `string (ISO)`| Waktu penyerahan evaluasi kuis | `"2026-11-24T11:15:00.000Z"` |

---

## 🛡️ 3. Aturan Keamanan Firestore (`firestore.rules`)

Aturan keamanan (`firestore.rules`) menerapkan prinsip *least-privilege* dan validasi berbasis peran (RBAC):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper fungsi: Memeriksa apakah pengguna memiliki role 'teacher'
    function isTeacher() {
      return request.auth != null && 
        (
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher' ||
          request.auth.token.email == 'karenina.zulfa.2403316@students.um.ac.id'
        );
    }
    
    // Helper fungsi: Memeriksa apakah pengguna adalah pemilik dokumen
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    // 1. Koleksi Pengguna (users)
    match /users/{userId} {
      // Guru dapat membaca seluruh data pengguna; Siswa hanya dapat membaca miliknya
      allow read: if isTeacher() || isOwner(userId);
      // Setiap pengguna dapat membuat dan memperbarui datanya sendiri
      allow write: if isOwner(userId);
    }

    // 2. Koleksi Progres Siswa (student_progress)
    match /student_progress/{userId} {
      // Guru dapat melihat seluruh kemajuan siswa; Siswa hanya dapat melihat progres miliknya
      allow read: if isTeacher() || isOwner(userId);
      // Siswa dapat memperbarui data progres belajarnya sendiri
      allow write: if isOwner(userId);
    }

    // 3. Koleksi Hasil Kuis (quiz_results)
    match /quiz_results/{attemptId} {
      // Guru dapat membaca seluruh rekapitulasi kuis; Siswa dapat membaca hasil kuisnya sendiri
      allow read: if isTeacher() || 
        (request.auth != null && resource.data.uid == request.auth.uid);
      // Siswa hanya dapat menulis dokumen hasil kuis jika uid dokumen cocok dengan akunnya
      allow create, update: if request.auth != null && request.resource.data.uid == request.auth.uid;
      // Dilarang menghapus hasil evaluasi kuis
      allow delete: if false;
    }
  }
}
```

---

## 📦 4. Skema Penyimpanan Lokal (LocalStorage Keys)

Penyimpanan lokal menggunakan sistem *namespacing* ketat untuk mencegah kebocoran antar akun pada browser yang sama (Temuan 05-03):

### A. Kunci Akun Siswa Terdaftar (`chem_<uid>_*`)
- `chem_<uid>_current_step`: Menyimpan indeks nomor tahap aktif (integer 1–5).
- `chem_<uid>_completed_steps`: Menyimpan array tahapan 5E yang telah tuntas (JSON string).
- `chem_<uid>_prediction`: Menyimpan teks hipotesis awal tahap Engage.
- `chem_<uid>_quiz_score`: Menyimpan nilai skor kuis terakhir (integer 0–100).
- `chem_<uid>_reflection`: Menyimpan draf catatan refleksi siswa.
- `chem_<uid>_quiz_draft`: Menyimpan draf pilihan jawaban kuis yang sedang dikerjakan (JSON string — Temuan 05-08).
- `chem_<uid>_quiz_index`: Menyimpan indeks nomor soal kuis yang sedang aktif.

### B. Kunci Mode Tamu (`chem_guest_*` — Temuan 05-06)
- `chem_guest_current_step`
- `chem_guest_completed_steps`
- `chem_guest_prediction`
- `chem_guest_quiz_score`
- `chem_guest_reflection`
- `chem_guest_quiz_draft`
- `chem_guest_quiz_index`

### C. Kunci Pengelolaan Sesi Global
- `chem_session`: Menyimpan token sesi aktif, UID pengguna, email, dan status `isGuest` (disimpan di `localStorage` jika *Remember Me* aktif, atau di `sessionStorage` jika tidak dicentang).
- `chem_registered_users`: Menyimpan daftar akun pengguna terdaftar untuk simulasi offline.
- `chem_teacher_profile`: Menyimpan data profil khusus pendidik.
