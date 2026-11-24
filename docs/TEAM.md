# STRUKTUR TIM & PERAN PENGEMBANGAN CHEMIFY

Dokumen ini menjelaskan struktur pemangku kepentingan (*stakeholders*), peran guru pengampu, tim pengembang, serta dosen reviewer dalam proyek media pembelajaran **CHEMIFY**.

---

## 👥 Struktur Tim & Pemangku Kepentingan

```
                          ┌───────────────────────────────┐
                          │     Dosen Pembimbing &        │
                          │      Reviewer Ahli            │
                          │ (Evaluasi Materi & Pedagogi)  │
                          └──────────────┬────────────────┘
                                         │ Umpan Balik (05-01 s.d. 05-10)
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Guru Pengampu Kimia                             │
│                  Karenina Zulfa, S.Pd. (Teacher)                       │
│             karenina.zulfa.2403316@students.um.ac.id                   │
│          - Pemilik Akun Role Teacher di Sistem CHEMIFY                 │
│          - Pemantau Aktivitas Pembelajaran 5E & Hasil Kuis             │
└────────────────────────────────────────┬───────────────────────────────┘
                                         │ Kebutuhan Pembelajaran & Data
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Tim Pengembang CHEMIFY                           │
│  ┌──────────────────────────┬──────────────────────────┬────────────┐  │
│  │     Front-End & UI       │   Arsitektur & Firebase  │  QA & Test │  │
│  │ (React 19, Vite, CSS)    │ (Firestore, Auth, RBAC)  │  (Vitest)  │  │
│  └──────────────────────────┴──────────────────────────┴────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 👩‍🏫 Pendidik / Guru Kimia (Teacher Role)

- **Nama:** Karenina Zulfa, S.Pd.
- **Afiliasi / Universitas:** Universitas Negeri Malang (UM)
- **Akun Sistem:** `karenina.zulfa.2403316@students.um.ac.id`
- **Hak Akses Sistem (RBAC):** `role: 'teacher'` (Diverifikasi secara ketat melalui backend Firestore dan utilitas otentikasi).
- **Tanggung Jawab:**
  1. Mengelola modul pembelajaran kimia asam-basa berbasis model 5E.
  2. Memantau progres belajar siswa secara langsung melalui Teacher Dashboard (`/guru`).
  3. Menganalisis daya serap konsep siswa melalui panel Analisis Butir Soal (*Item Analysis* 10 soal).
  4. Meninjau draf hipotesis awal (*Engage prediction*) dan catatan refleksi siswa pada akhir pembelajaran.
  5. Melakukan pratinjau modul siswa (*Student Preview Mode*) sebelum pembelajaran di kelas dimulai.

---

## 🎓 Tim Penilai & Dosen Reviewer

- **Peran:** Penguji Validitas Ahli Materi Kimia, Ahli Media Pembelajaran, dan Desain Instruksional.
- **Kontribusi:**
  - Memberikan 10 catatan temuan evaluatif (`05-01` s.d. `05-10`) untuk meningkatkan akurasi konsep kimia, keandalan penyimpanan data, aksesibilitas inklusif, dan kegunaan antarmuka pada perangkat seluler.
  - Memvalidasi bahwa penetapan sifat larutan pada soal nomor 4 kuis tidak over-generalisasi menjadi basa kuat tanpa informasi konsentrasi molaritas.
  - Memastikan hak akses guru terlindungi dan tidak dapat ditembus oleh siswa atau pengguna tamu.

---

## 💻 Tim Pengembang CHEMIFY

### 1. Front-End & Desain Interaksi (UI/UX)
- Merancang alur pembelajaran 5E yang mulus dan intuitif.
- Mengembangkan simulator laboratorium virtual skala pH dengan visualisasi partikel ion $\text{H}^+$ dan $\text{OH}^-$.
- Mengoptimalkan responsivitas antarmuka pada berbagai ukuran layar, termasuk pengoptimalan viewport ponsel cerdas $375\text{px}$.
- Menjamin kepatuhan standar aksesibilitas keyboard (WCAG 2.1 AA) pada seluruh komponen interaktif.

### 2. Back-End & Sinkronisasi Cloud (Firebase & Storage)
- Mengonfigurasi skema penyimpanan Firestore dan aturan keamanan (*Security Rules*) berbasis peran (RBAC).
- Mengimplementasikan mekanisme penyimpanan data idempoten (`attemptId` deterministik) untuk mencegah duplikasi hasil evaluasi.
- Mengembangkan lapisan abstraksi penyimpanan lokal yang tahan terhadap *QuotaExceededError* dan terisolasi per akun pengguna (`chem_<uid>_*`).
- Mengintegrasikan penanganan kegagalan cloud dengan 4 status terperinci (*local only*, *pending*, *success*, *failed*) serta fitur coba lagi.

### 3. Jaminan Kualitas & Pengujian Otomatis (QA & Automation)
- Menyusun arsitektur pengujian otomatis menggunakan Vitest dan React Testing Library.
- Menulis dan memelihara 10 berkas pengujian otomatis (`tests/05-01` s.d. `tests/05-10`) dengan 28 skenario uji.
- Memastikan tidak ada regresi pada fitur yang sudah berjalan: alur 5E, perhitungan pH laboratorium virtual, dan kalkulasi skor kuis.
- Menjalankan analisis statis kode menggunakan Oxlint untuk menjaga kebersihan dan performa basis kode.
