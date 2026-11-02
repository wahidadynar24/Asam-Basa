// 10 Soal Kuis Evaluasi Asam-Basa (Chemify 5E)
// Format: Pilihan Ganda 5 Opsi (A, B, C, D, E) dengan panjang seimbang dan kunci jawaban tidak mencolok

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    type: 'multiple_choice',
    topic: 'Teori Asam-Basa Arrhenius',
    question: 'Menurut teori asam-basa Arrhenius, suatu zat digolongkan sebagai asam apabila dilarutkan ke dalam air karena...',
    options: [
      { id: 'a', text: 'Mampu menghasilkan ion hidrogen (H⁺) bebas di dalam pelarut air.' },
      { id: 'b', text: 'Mampu menghasilkan ion hidroksida (OH⁻) bebas di dalam pelarut air.' },
      { id: 'c', text: 'Mampu menerima pasangan elektron bebas dari spesi senyawa kimia lain.' },
      { id: 'd', text: 'Mampu memberikan pasangan elektron bebas kepada spesi senyawa kimia.' },
      { id: 'e', text: 'Mampu mengikat proton hidrogen bebas dari molekul pelarut sekitarnya.' }
    ],
    correctAnswer: 'a',
    explanation: 'Menurut Svante Arrhenius (1884), asam adalah zat yang apabila dilarutkan dalam air akan terionisasi menghasilkan ion hidrogen (H⁺/H₃O⁺). Pilihan b adalah basa Arrhenius, pilihan c adalah asam Lewis, pilihan d adalah basa Lewis, dan pilihan e adalah basa Brønsted-Lowry.'
  },
  {
    id: 2,
    type: 'multiple_choice',
    topic: 'Karakteristik Asam dan Basa',
    question: 'Suatu larutan pembersih diuji di laboratorium dan menunjukkan rasa licin di kulit serta mengubah lakmus merah menjadi biru. Pernyataan yang paling tepat mengenai larutan tersebut adalah...',
    options: [
      { id: 'a', text: 'Larutan tergolong asam karena memiliki derajat keasaman pH kurang dari 7.' },
      { id: 'b', text: 'Larutan tergolong basa karena memiliki derajat keasaman pH lebih dari 7.' },
      { id: 'c', text: 'Larutan tergolong netral karena tidak mengubah konsentrasi ion hidrogen.' },
      { id: 'd', text: 'Larutan tergolong garam netral karena memiliki nilai pH tepat sama dengan 7.' },
      { id: 'e', text: 'Larutan tergolong amfoter karena mampu bereaksi cepat dengan semua jenis zat.' }
    ],
    correctAnswer: 'b',
    explanation: 'Ciri khas larutan basa adalah terasa licin saat disentuh (akibat reaksi saponifikasi asam lemak kulit), membirukan kertas lakmus merah, dan memiliki nilai pH > 7 (konsentrasi [OH⁻] > [H⁺]).'
  },
  {
    id: 3,
    type: 'calculation',
    topic: 'Perhitungan pH Asam Kuat',
    question: 'Berapakah nilai derajat keasaman (pH) dari larutan asam klorida (HCl) dengan konsentrasi 0,01 M pada suhu 25°C?',
    options: [
      { id: 'a', text: 'Larutan asam memiliki nilai pH = 1,00' },
      { id: 'b', text: 'Larutan asam memiliki nilai pH = 2,00' },
      { id: 'c', text: 'Larutan asam memiliki nilai pH = 7,00' },
      { id: 'd', text: 'Larutan asam memiliki nilai pH = 12,0' },
      { id: 'e', text: 'Larutan asam memiliki nilai pH = 14,0' }
    ],
    correctAnswer: 'b',
    explanation: 'HCl adalah asam kuat monoprotik terionisasi sempurna (α = 1), sehingga [H⁺] = Molaritas = 0,01 M = 10⁻² M. Nilai pH dihitung dengan rumus: pH = -log [H⁺] = -log (10⁻²) = 2,00.'
  },
  {
    id: 4,
    type: 'calculation',
    topic: 'Hubungan pH dan pOH',
    question: 'Suatu sampel cairan pembersih diketahui memiliki nilai pOH sebesar 3,00 pada suhu 25°C. Karakteristik larutan tersebut adalah...',
    options: [
      { id: 'a', text: 'Larutan memiliki nilai pH = 11,00 dan bersifat basa kuat.' },
      { id: 'b', text: 'Larutan memiliki nilai pH = 11,00 dan bersifat asam kuat.' },
      { id: 'c', text: 'Larutan memiliki nilai pH = 3,00 serta bersifat asam lemah.' },
      { id: 'd', text: 'Larutan memiliki nilai pH = 7,00 serta bersifat netral murni.' },
      { id: 'e', text: 'Larutan memiliki nilai pH = 4,00 serta bersifat amfoterik air.' }
    ],
    correctAnswer: 'a',
    explanation: 'Pada suhu 25°C berlaku rumus mutlak pH + pOH = 14. Maka nilai pH = 14 - pOH = 14 - 3,00 = 11,00. Karena pH = 11,00 (> 7), larutan tersebut bersifat basa.'
  },
  {
    id: 5,
    type: 'multiple_choice',
    topic: 'Teori Brønsted-Lowry',
    question: 'Perhatikan reaksi kesetimbangan: NH₃ (aq) + H₂O (l) ⇌ NH₄⁺ (aq) + OH⁻ (aq). Berdasarkan teori Brønsted-Lowry, zat yang berperan sebagai asam beserta alasannya adalah...',
    options: [
      { id: 'a', text: 'Zat NH₃ karena bertindak sebagai spesi penerima ion proton hidrogen.' },
      { id: 'b', text: 'Zat H₂O karena bertindak sebagai spesi penyumbang ion proton hidrogen.' },
      { id: 'c', text: 'Zat OH⁻ karena bertindak sebagai spesi penerima ion proton hidrogen.' },
      { id: 'd', text: 'Zat NH₄⁺ karena bertindak sebagai spesi pelarut netral tanpa muatan.' },
      { id: 'e', text: 'Zat H₂O karena bertindak sebagai spesi akseptor pasangan elektron.' }
    ],
    correctAnswer: 'b',
    explanation: 'Menurut Brønsted-Lowry, asam adalah donor proton (H⁺). Pada reaksi tersebut, H₂O menyerahkan 1 ion H⁺ kepada NH₃ sehingga H₂O berubah menjadi OH⁻, sedangkan NH₃ bertindak sebagai basa akseptor proton.'
  },
  {
    id: 6,
    type: 'analysis',
    topic: 'Asam Kuat vs Asam Lemah',
    question: 'Larutan HCl 0,1 M dan larutan CH₃COOH 0,1 M memiliki konsentrasi yang sama, namun nilai pH HCl jauh lebih rendah. Hal ini terjadi karena...',
    options: [
      { id: 'a', text: 'Molekul HCl memiliki massa molar molekul yang jauh lebih berat di air.' },
      { id: 'b', text: 'Molekul HCl terionisasi sempurna sehingga menghasilkan ion H⁺ melimpah.' },
      { id: 'c', text: 'Molekul CH₃COOH memiliki daya kelarutan fisik yang sangat buruk di air.' },
      { id: 'd', text: 'Molekul CH₃COOH mengikat kembali semua molekul pelarut air di wadahnya.' },
      { id: 'e', text: 'Molekul HCl melepaskan seluruh pasangan elektron bebas ke udara sekitar.' }
    ],
    correctAnswer: 'b',
    explanation: 'Meskipun konsentrasinya sama (0,1 M), HCl adalah asam kuat yang terionisasi 100% sempurna (α = 1) menghasilkan [H⁺] = 0,1 M (pH = 1). Sedangkan CH₃COOH adalah asam lemah yang hanya terionisasi sebagian kecil (α ≈ 1,3%), sehingga [H⁺] jauh lebih sedikit dan pH-nya lebih tinggi (~2,87).'
  },
  {
    id: 7,
    type: 'multiple_choice',
    topic: 'Kekuatan vs Kepekatan',
    question: 'Manakah pernyataan di bawah ini yang membedakan secara tepat antara konsep "Kekuatan Asam" dan konsep "Kepekatan Asam"?',
    options: [
      { id: 'a', text: 'Kekuatan asam ditentukan oleh nilai Molaritas, sedangkan kepekatan ditentukan derajat ionisasi.' },
      { id: 'b', text: 'Kekuatan asam ditentukan oleh derajat ionisasi, sedangkan kepekatan ditentukan jumlah zat terlarut.' },
      { id: 'c', text: 'Kekuatan asam ditentukan oleh volume pelarut air, sedangkan kepekatan ditentukan oleh wadah uji.' },
      { id: 'd', text: 'Kekuatan asam ditentukan oleh warna indikator, sedangkan kepekatan ditentukan oleh massa jenis.' },
      { id: 'e', text: 'Kekuatan asam dan kepekatan asam bermakna identik sehingga nilainya selalu sebanding konstan.' }
    ],
    correctAnswer: 'b',
    explanation: 'Kekuatan asam ditentukan oleh kemudahan molekul terurai menjadi ion (derajat ionisasi α atau tetapan Ka), sedangkan kepekatan ditentukan oleh banyaknya partikel zat terlarut dalam volume larutan (konsentrasi Molaritas M).'
  },
  {
    id: 8,
    type: 'multiple_choice',
    topic: 'Mencocokkan Teori Asam-Basa',
    question: 'Pasangan teori perkembangan konsep asam-basa berikut yang menghubungkan teori penemu dengan prinsip kuncinya secara benar adalah...',
    options: [
      { id: 'a', text: 'Arrhenius: donor proton; Brønsted-Lowry: pelarut air; Lewis: pasangan elektron.' },
      { id: 'b', text: 'Arrhenius: pelarut air; Brønsted-Lowry: transfer proton; Lewis: pasangan elektron.' },
      { id: 'c', text: 'Arrhenius: pasangan elektron; Brønsted-Lowry: pelarut air; Lewis: transfer proton.' },
      { id: 'd', text: 'Arrhenius: transfer elektron; Brønsted-Lowry: donor proton; Lewis: pelarut murni.' },
      { id: 'e', text: 'Arrhenius: pelarut organik; Brønsted-Lowry: gas mulia; Lewis: ikatan hidrogen.' }
    ],
    correctAnswer: 'b',
    explanation: 'Teori Arrhenius fokus pada ion H⁺/OH⁻ dalam pelarut air, teori Brønsted-Lowry fokus pada transfer proton H⁺ (donor/akseptor), dan teori Lewis memperluas cakupan pada serah-terima pasangan elektron bebas (PEB).'
  },
  {
    id: 9,
    type: 'calculation',
    topic: 'Hasil Kali Ion Air (Kw)',
    question: 'Jika suatu larutan memiliki konsentrasi ion hidrogen [H⁺] sebesar 1,0 × 10⁻¹⁰ M pada suhu 25°C, konsentrasi ion hidroksida [OH⁻] larutan tersebut adalah...',
    options: [
      { id: 'a', text: 'Konsentrasi ion hidroksida [OH⁻] terhitung sebesar 1,0 × 10⁻⁴ M.' },
      { id: 'b', text: 'Konsentrasi ion hidroksida [OH⁻] terhitung sebesar 1,0 × 10⁻⁷ M.' },
      { id: 'c', text: 'Konsentrasi ion hidroksida [OH⁻] terhitung sebesar 1,0 × 10⁻¹⁰ M.' },
      { id: 'd', text: 'Konsentrasi ion hidroksida [OH⁻] terhitung sebesar 1,0 × 10⁻¹⁴ M.' },
      { id: 'e', text: 'Konsentrasi ion hidroksida [OH⁻] terhitung sebesar 1,0 × 10⁻¹² M.' }
    ],
    correctAnswer: 'a',
    explanation: 'Berdasarkan tetapan autoionisasi air Kw = [H⁺][OH⁻] = 1,0 × 10⁻¹⁴ pada 25°C, maka [OH⁻] = Kw / [H⁺] = 1,0 × 10⁻¹⁴ / 1,0 × 10⁻¹⁰ = 1,0 × 10⁻⁴ M. Karena [OH⁻] > [H⁺], larutan bersifat basa.'
  },
  {
    id: 10,
    type: 'multiple_choice',
    topic: 'Aplikasi Reaksi Netralisasi',
    question: 'Obat antasida yang mengandung senyawa basa magnesium hidroksida Mg(OH)₂ bekerja di lambung berdasarkan prinsip kimia yaitu...',
    options: [
      { id: 'a', text: 'Reaksi netralisasi antara basa antasida dengan asam lambung menghasilkan garam dan air.' },
      { id: 'b', text: 'Reaksi reduksi yang mengubah seluruh asam klorida lambung menjadi gas hidrogen bertekanan.' },
      { id: 'c', text: 'Reaksi pengendapan cepat yang mengkristalkan asam klorida lambung menjadi senyawa padatan.' },
      { id: 'd', text: 'Reaksi pengenceran mekanis yang membakar tuntas seluruh asam lambung tanpa sisa molekul.' },
      { id: 'e', text: 'Reaksi pembentukan gas beracun yang melumpuhkan sel-sel lambung agar berhenti bekerja.' }
    ],
    correctAnswer: 'a',
    explanation: 'Antasida bekerja berdasarkan reaksi netralisasi: Mg(OH)₂ (basa) + 2HCl (asam lambung) → MgCl₂ (garam netral) + 2H₂O (air). Reaksi ini menaikkan pH lambung ke rentang yang nyaman dan aman bagi dinding mukosa lambung.'
  }
];
