// 10 Soal Kuis Asam-Basa Sesuai PRD dengan Feedback Edukatif

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    type: 'multiple_choice',
    topic: 'Teori Asam-Basa',
    question: 'Menurut teori Arrhenius, zat dikatakan bersifat asam jika...',
    options: [
      { id: 'a', text: 'Melepaskan ion OH⁻ dalam air' },
      { id: 'b', text: 'Menghasilkan ion H⁺ (atau H₃O⁺) jika dilarutkan dalam air' },
      { id: 'c', text: 'Menerima pasangan elektron bebas' },
      { id: 'd', text: 'Menerima proton dari zat lain' }
    ],
    correctAnswer: 'b',
    explanation: 'Svante Arrhenius mendefinisikan asam sebagai zat yang berdisosiasi dalam air menghasilkan ion hidrogen (H⁺). Pilihan c adalah teori Lewis, dan pilihan d adalah basa Brønsted-Lowry.'
  },
  {
    id: 2,
    type: 'true_false',
    topic: 'Sifat Asam dan Basa',
    question: 'Pernyataan: "Semua larutan yang terasa licin di kulit dan memiliki pH lebih dari 7 tergolong larutan asam."',
    options: [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ],
    correctAnswer: 'false',
    explanation: 'Salah! Larutan yang terasa licin di kulit dan memiliki pH > 7 adalah karakteristik larutan BASA (alkali). Larutan asam memiliki pH < 7 dan cenderung terasa masam atau kesat.'
  },
  {
    id: 3,
    type: 'calculation',
    topic: 'Perhitungan pH Sederhana',
    question: 'Berapakah nilai pH dari larutan asam kuat HCl dengan konsentrasi 0,01 M (atau 10⁻² M)?',
    options: [
      { id: 'a', text: 'pH = 1' },
      { id: 'b', text: 'pH = 2' },
      { id: 'c', text: 'pH = 12' },
      { id: 'd', text: 'pH = 7' }
    ],
    correctAnswer: 'b',
    explanation: 'Karena HCl adalah asam kuat monoprotik, maka [H⁺] = Molaritas = 0,01 M = 10⁻² M. Rumus pH = -log [H⁺] = -log (10⁻²) = 2.'
  },
  {
    id: 4,
    type: 'calculation',
    topic: 'pH dan pOH',
    question: 'Jika suatu larutan memiliki pOH = 4 pada suhu 25°C, berapakah nilai pH larutan tersebut dan apa sifatnya?',
    options: [
      { id: 'a', text: 'pH = 10, bersifat basa' },
      { id: 'b', text: 'pH = 10, bersifat asam' },
      { id: 'c', text: 'pH = 4, bersifat asam' },
      { id: 'd', text: 'pH = 7, bersifat netral' }
    ],
    correctAnswer: 'a',
    explanation: 'Pada kondisi standar, pH + pOH = 14. Maka pH = 14 - pOH = 14 - 4 = 10. Karena pH = 10 (> 7), maka larutan bersifat basa.'
  },
  {
    id: 5,
    type: 'multiple_choice',
    topic: 'Teori Brønsted-Lowry',
    question: 'Pada reaksi: NH₃ (aq) + H₂O (l) ⇌ NH₄⁺ (aq) + OH⁻ (aq), zat yang bertindak sebagai ASAM menurut Brønsted-Lowry adalah...',
    options: [
      { id: 'a', text: 'NH₃ karena mengikat proton' },
      { id: 'b', text: 'H₂O karena mendonorkan proton (H⁺) kepada NH₃' },
      { id: 'c', text: 'OH⁻ karena menerima proton' },
      { id: 'd', text: 'NH₄⁺ karena bersifat netral' }
    ],
    correctAnswer: 'b',
    explanation: 'Menurut Brønsted-Lowry, asam adalah donor proton (H⁺). Di sini, molekul H₂O menyumbangkan 1 proton H⁺ kepada NH₃ sehingga H₂O berubah menjadi ion OH⁻.'
  },
  {
    id: 6,
    type: 'analysis',
    topic: 'Asam Kuat vs Asam Lemah',
    question: 'Larutan HCl 0,1 M dan larutan CH₃COOH 0,1 M memiliki konsentrasi molar yang sama. Mengapa larutan HCl memiliki nilai pH yang jauh lebih rendah daripada CH₃COOH?',
    options: [
      { id: 'a', text: 'Karena volume larutan HCl lebih banyak.' },
      { id: 'b', text: 'Karena HCl terionisasi 100% (asam kuat) menghasilkan [H⁺] lebih banyak, sedangkan CH₃COOH hanya terionisasi sebagian kecil (asam lemah).' },
      { id: 'c', text: 'Karena CH₃COOH tidak larut dalam air.' },
      { id: 'd', text: 'Karena molekul HCl memiliki massa atom lebih besar.' }
    ],
    correctAnswer: 'b',
    explanation: 'Tepat! Kekuatan asam ditentukan oleh derajat ionisasi (α). Pada HCl (α = 1), semua molekul menjadi H⁺ ([H⁺] = 0,1 M → pH 1). Pada CH₃COOH (α << 1), hanya sedikit ion H⁺ yang terbentuk ([H⁺] ≈ 0,00134 M → pH ~2,87).'
  },
  {
    id: 7,
    type: 'true_false',
    topic: 'Kekuatan vs Kepekatan',
    question: 'Pernyataan: "Istilah \'Asam Kuat\' memiliki makna yang sama persis dengan \'Asam Pekat\'."',
    options: [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ],
    correctAnswer: 'false',
    explanation: 'Salah! "Kuat/Lemah" merujuk pada derajat ionisasi (kemudahan melepas H⁺), sedangkan "Pekat/Encer" merujuk pada konsentrasi zat terlarut (jumlah partikel per liter air). Asam kuat bisa saja sangat encer (0,0001 M), dan asam lemah bisa saja pekat (10 M).'
  },
  {
    id: 8,
    type: 'matching',
    topic: 'Mencocokkan Teori',
    question: 'Manakah pasangan teori asam-basa dan kata kunci intinya yang PALING TEPAT?',
    options: [
      { id: 'a', text: 'Arrhenius ➔ Pasangan elektron; Lewis ➔ Pelarut air; Brønsted-Lowry ➔ Transfer proton' },
      { id: 'b', text: 'Arrhenius ➔ Pelarut air (H⁺/OH⁻); Brønsted-Lowry ➔ Transfer proton; Lewis ➔ Pasangan elektron (PEB)' },
      { id: 'c', text: 'Arrhenius ➔ Transfer proton; Brønsted-Lowry ➔ Pelarut air; Lewis ➔ Gas bertekanan' },
      { id: 'd', text: 'Semua teori di atas menyatakan hal yang identik tanpa perbedaan konsep' }
    ],
    correctAnswer: 'b',
    explanation: 'Arrhenius menekankan ion H⁺ dan OH⁻ dalam pelarut air, Brønsted-Lowry memperluasnya ke transfer proton (donor/akseptor H⁺), dan Lewis memperluasnya ke pembentukan ikatan kovalen koordinasi via pasangan elektron bebas (PEB).'
  },
  {
    id: 9,
    type: 'analysis',
    topic: 'H⁺ dan OH⁻ pada Air',
    question: 'Jika suatu larutan memiliki konsentrasi ion hidrogen [H⁺] sebesar 1,0 × 10⁻¹⁰ M pada 25°C, berapakah konsentrasi ion [OH⁻] larutan tersebut?',
    options: [
      { id: 'a', text: '1,0 × 10⁻⁴ M' },
      { id: 'b', text: '1,0 × 10⁻¹⁴ M' },
      { id: 'c', text: '1,0 × 10⁻⁷ M' },
      { id: 'd', text: '1,0 × 10⁻¹⁰ M' }
    ],
    correctAnswer: 'a',
    explanation: 'Karena Kw = [H⁺][OH⁻] = 1,0 × 10⁻¹⁴, maka [OH⁻] = Kw / [H⁺] = 10⁻¹⁴ / 10⁻¹⁰ = 1,0 × 10⁻⁴ M. Karena [OH⁻] > [H⁺], larutan ini bersifat basa (pH = 10).'
  },
  {
    id: 10,
    type: 'multiple_choice',
    topic: 'Penerapan Asam-Basa',
    question: 'Obat antasida maag yang mengandung magnesium hidroksida Mg(OH)₂ bekerja di dalam lambung berdasarkan prinsip...',
    options: [
      { id: 'a', text: 'Reaksi netralisasi antara basa Mg(OH)₂ dengan kelebihan asam lambung (HCl) membentuk garam dan air' },
      { id: 'b', text: 'Menaikkan keasaman lambung agar kuman penyakit mati' },
      { id: 'c', text: 'Mengubah asam klorida menjadi gas beracun' },
      { id: 'd', text: 'Menghancurkan dinding lambung agar makanan cepat dicerna' }
    ],
    correctAnswer: 'a',
    explanation: 'Prinsip kerja antasida adalah reaksi netralisasi asam-basa: Mg(OH)₂ (basa) + 2HCl (asam lambung) → MgCl₂ (garam netral) + 2H₂O (air). Hal ini mengurangi iritasi pada lambung.'
  }
];
