// Data Kasus Kontekstual untuk Tahap Elaborate

export const ELABORATE_CASES = {
  beverages: {
    title: 'Aktivitas 1: Studi Kasus Nyata: Asam Lambung, Begadang, & Antasida',
    intro: 'Pelajari narasi fenomena nyata di bawah ini dan lakukan analisis kimia secara mendalam dalam bentuk esai.',
    narrative: {
      patient: 'Rian (16 tahun, Siswa Kelas XI SMA)',
      scenario: 'Menjelang ujian semester, Rian terbiasa belajar hingga larut malam. Untuk menahan rasa kantuk, ia meminum 2 kaleng minuman bersoda (pH 2,5) dan secangkir kopi hitam (pH 5,0) tanpa makan malam terlebih dahulu. Setelah dua minggu menjalani rutinitas tersebut, Rian mulai merasakan sensasi perih terbakar di ulu hati (heartburn), mulut terasa asam, dan giginya terasa sangat ngilu saat meminum air dingin.',
      diagnosis: 'Dokter mendiagnosis Rian mengalami iritasi asam lambung berlebih (hiperasiditas lambung akibat lonjakan HCl) dan tanda awal erosi email gigi. Dokter memberikan obat tablet kunyah antasida yang mengandung Magnesium Hidroksida [Mg(OH)₂] dan menyarankan agar ia membilas mulut dengan air putih serta menghindari konsumsi zat asam pekat saat perut kosong.'
    },
    items: [
      {
        id: 'stomach',
        name: 'Asam Lambung Alami (HCl)',
        pH: 1.5,
        acidType: 'Asam Klorida (HCl)',
        effect: 'Normalnya membantu pencernaan protein, namun jika berlebih tanpa ada makanan akan mengikis dinding lambung.',
        color: '#dc2626'
      },
      {
        id: 'cola',
        name: 'Minuman Bersoda (Kola)',
        pH: 2.5,
        acidType: 'Asam Fosfat & Karbonat',
        effect: 'pH sangat asam memperparah iritasi lambung kosong dan mempercepat demineralisasi email gigi.',
        color: '#ea580c'
      },
      {
        id: 'coffee',
        name: 'Kopi Hitam Pekat',
        pH: 5.0,
        acidType: 'Asam Klorogenat & Kafein',
        effect: 'Merangsang sel parietal lambung memproduksi lebih banyak cairan asam lambung HCl.',
        color: '#eab308'
      },
      {
        id: 'water',
        name: 'Air Putih Bersih / Saliva',
        pH: 7.2,
        acidType: 'Mengandung bikarbonat (HCO₃⁻)',
        effect: 'Membilas keasaman di kerongkongan dan mengencerkan konsentrasi asam lambung menuju netral.',
        color: '#10b981'
      },
      {
        id: 'antacid',
        name: 'Tablet Obat Antasida',
        pH: 9.0,
        acidType: 'Magnesium Hidroksida [Mg(OH)₂]',
        effect: 'Basa lemah aman yang menetralkan kelebihan ion H⁺ lambung tanpa merusak jaringan mukosa.',
        color: '#0284c7'
      }
    ],
    essayChallenge: {
      prompt: 'Berdasarkan narasi studi kasus di atas, analisislah:\n1. Mengapa konsumsi minuman asam (soda/kopi) saat perut kosong memicu nyeri lambung?\n2. Bagaimana mekanisme reaksi netralisasi kimia antasida Mg(OH)₂ dalam mengatasi kelebihan asam lambung (HCl)?\n3. Mengapa tablet antasida dirancang menggunakan basa lemah [seperti Mg(OH)₂ atau Al(OH)₃] dan BUKAN basa kuat seperti NaOH?',
      guidingQuestions: [
        'Kaitkan konsentrasi ion H⁺ dalam lambung dengan rasa nyeri/iritasi.',
        'Tuliskan persamaan reaksi netralisasi antara Mg(OH)₂ dengan HCl.',
        'Jelaskan dampak bahaya sifat kaustik basa kuat jika tertelan oleh manusia.'
      ],
      rubricPoints: [
        'Menjelaskan bahwa asam lambung mengandung HCl (ion H⁺ tinggi); penambahan soda dan stimulasi kafein menaikkan konsentrasi [H⁺] sehingga pH turun drastis dan mengiritasi mukosa lambung.',
        'Menuliskan reaksi netralisasi: Mg(OH)₂ (s) + 2HCl (aq) → MgCl₂ (aq) + 2H₂O (l), menghasilkan garam netral dan air.',
        'Menganalisis bahwa NaOH adalah basa kuat (α = 1) yang sangat kaustik/korosif dan dapat menghancurkan jaringan dinding lambung, sedangkan Mg(OH)₂ adalah basa lemah dengan kelarutan rendah sehingga bekerja lembut dan aman melepaskan OH⁻ secara bertahap.'
      ],
      modelAnswer: 'Konsumsi soda dan kopi saat lambung kosong menyebabkan lonjakan konsentrasi ion H⁺ ([H⁺] meningkat, pH turun hingga < 2) yang mengikis lapisan lendir (mukosa) lambung sehingga menimbulkan rasa perih terbakar. Tablet antasida Mg(OH)₂ bekerja melalui reaksi penetralan: Mg(OH)₂ + 2HCl → MgCl₂ + 2H₂O, di mana ion OH⁻ dari antasida mengikat ion H⁺ berlebih menjadi molekul air netral (H₂O). Formulasi antasida wajib menggunakan basa lemah karena kelarutannya kecil dan terionisasi perlahan (aman untuk jaringan lunak tubuh). Jika menggunakan basa kuat seperti NaOH, sifat kaustiknya yang terurai 100% akan membakar kerongkongan dan melubangi dinding lambung (perforasi lambung).'
    }
  },

  classificationGame: {
    title: 'Aktivitas 2: Klasifikasi Produk Rumah Tangga',
    intro: 'Kelompokkan bahan-bahan rumah tangga berikut ke dalam wadah Asam, Netral, atau Basa. Perhatikan bahwa urutan bahan telah diacak agar kamu menganalisis sifat kimianya:',
    substances: [
      { id: 'item5', name: 'Sabun Cuci / Deterjen', icon: '🧼', correctCategory: 'base', hint: 'Terasa licin di kulit, pH > 9' },
      { id: 'item1', name: 'Cuka Makan', icon: '🍶', correctCategory: 'acid', hint: 'Mengandung asam asetat (CH₃COOH)' },
      { id: 'item4', name: 'Garam Dapur (NaCl) / Air Murni', icon: '🧂', correctCategory: 'neutral', hint: 'pH = 7, garam dari asam kuat dan basa kuat' },
      { id: 'item8', name: 'Cairan Pemutih Pakaian', icon: '🧴', correctCategory: 'base', hint: 'Mengandung NaOCl yang sangat basa (pH ~11-12)' },
      { id: 'item2', name: 'Jus Tomat Segar', icon: '🍅', correctCategory: 'acid', hint: 'Mengandung asam sitrat dan malat, pH ~4,0' },
      { id: 'item7', name: 'Obat Maag (Antasida)', icon: '💊', correctCategory: 'base', hint: 'Mengandung Mg(OH)₂ untuk menetralkan asam' },
      { id: 'item3', name: 'Air Aki Kendaraan (Zuur)', icon: '🔋', correctCategory: 'acid', hint: 'Mengandung asam sulfat pekat (H₂SO₄)' },
      { id: 'item6', name: 'Baking Soda Kue (NaHCO₃)', icon: '🧁', correctCategory: 'base', hint: 'Larutannya menghasilkan ion OH⁻ (basa lemah)' }
    ]
  },

  oceanAcidification: {
    title: 'Aktivitas 3: Analisis Fenomena Pengasaman Laut (Pilihan Ganda 2-Tier)',
    intro: 'Pahami 4 tahapan reaksi kimia pengasaman laut di bawah ini, kemudian selesaikan 2 soal diagnostik 2-Tier (Tier 1: Pilihan Jawaban Konsep, Tier 2: Alasan Ilmiah).',
    steps: [
      {
        step: 1,
        title: 'Pelarutan CO₂',
        reaction: 'CO₂ (g) + H₂O (l) ⇌ H₂CO₃ (aq)',
        desc: 'Gas CO₂ atmosfer larut ke dalam air laut membentuk asam karbonat (H₂CO₃).'
      },
      {
        step: 2,
        title: 'Pelepasan Ion H⁺',
        reaction: 'H₂CO₃ (aq) ⇌ H⁺ (aq) + HCO₃⁻ (aq)',
        desc: 'Asam karbonat terurai melepaskan ion hidrogen (H⁺) yang meningkatkan keasaman laut.'
      },
      {
        step: 3,
        title: 'Perebutan Ion Karbonat',
        reaction: 'H⁺ (aq) + CO₃²⁻ (aq) ⇌ HCO₃⁻ (aq)',
        desc: 'Ion H⁺ bebas berikatan dengan ion karbonat (CO₃²⁻) membentuk ion bikarbonat.'
      },
      {
        step: 4,
        title: 'Dampak pada Kalsium Karbonat',
        reaction: 'CaCO₃ (s) ⇌ Ca²⁺ (aq) + CO₃²⁻ (aq)',
        desc: 'Cangkang terumbu karang dan moluska terancam rapuh dan larut karena kehilangan ion CO₃²⁻.'
      }
    ],
    twoTierQuestions: [
      {
        id: 'tierQ1',
        title: 'Soal 1: Perubahan Derajat Keasaman (pH) Air Laut',
        tier1: {
          prompt: 'Tier 1 (Konsep): Ketika emisi gas CO₂ diserap dalam jumlah besar oleh air laut, apa yang terjadi pada nilai pH air laut?',
          options: [
            { id: 'a', text: 'Nilai pH air laut mengalami penurunan (air laut menjadi lebih asam).' },
            { id: 'b', text: 'Nilai pH air laut mengalami kenaikan (air laut menjadi lebih basa).' },
            { id: 'c', text: 'Nilai pH air laut tetap konstan pada angka 7,00 tanpa perubahan.' },
            { id: 'd', text: 'Nilai pH air laut melonjak drastis hingga mencapai pH 14,00.' }
          ],
          correct: 'a'
        },
        tier2: {
          prompt: 'Tier 2 (Alasan Ilmiah): Alasan ilmiah yang paling tepat mendasari jawabanmu pada Tier 1 adalah...',
          options: [
            { id: 'opt1', text: 'Pelarutan gas CO₂ membentuk H₂CO₃ yang melepaskan tambahan ion H⁺ bebas ke perairan.' },
            { id: 'opt2', text: 'Gas CO₂ bereaksi menyerap seluruh ion hidrogen sehingga konsentrasi [H⁺] di laut lenyap.' },
            { id: 'opt3', text: 'Suhu air laut yang menghangat menguapkan semua ion garam sehingga laut berubah netral.' },
            { id: 'opt4', text: 'Gas CO₂ mendonorkan pasangan elektron bebas langsung kepada garam mineral natrium.' }
          ],
          correct: 'opt1'
        },
        explanation: 'Kombinasi Tepat: Tier 1 [A] dan Tier 2 [1]. Pelarutan CO₂ membentuk asam karbonat (H₂CO₃) yang berdisosiasi melepaskan ion H⁺. Bertambahnya konsentrasi [H⁺] secara matematis menyebabkan nilai pH = -log[H⁺] menurun (derajat keasaman bertambah).'
      },
      {
        id: 'tierQ2',
        title: 'Soal 2: Kerentanan Cangkang Kalsium Karbonat (CaCO₃) Biota Laut',
        tier1: {
          prompt: 'Tier 1 (Konsep): Apa dampak peningkatan ion H⁺ di laut terhadap kelestarian terumbu karang dan hewan bercangkang?',
          options: [
            { id: 'a', text: 'Pertumbuhan cangkang kalsium karbonat menjadi jauh lebih tebal dan kokoh.' },
            { id: 'b', text: 'Pembentukan cangkang terhambat dan cangkang yang sudah ada rentan rapuh atau larut.' },
            { id: 'c', text: 'Biota laut tidak terpengaruh sama sekali karena cangkang kebal terhadap zat asam.' },
            { id: 'd', text: 'Terumbu karang mengganti struktur cangkangnya menjadi lapisan logam murni.' }
          ],
          correct: 'b'
        },
        tier2: {
          prompt: 'Tier 2 (Alasan Ilmiah): Alasan ilmiah yang paling tepat mendasari jawabanmu pada Tier 1 adalah...',
          options: [
            { id: 'opt1', text: 'Ion H⁺ bebas merebut ion karbonat (CO₃²⁻) membentuk HCO₃⁻, memicu pelarutan CaCO₃ cangkang.' },
            { id: 'opt2', text: 'Peningkatan ion H⁺ memadatkan ion kalsium sehingga cangkang menjadi kelebihan massa.' },
            { id: 'opt3', text: 'Keasaman air laut merangsang laju fotosintesis alga karang secara berlebihan.' },
            { id: 'opt4', text: 'Cangkang kalsium karbonat hanya dapat larut dalam larutan basa kuat dengan pH > 12.' }
          ],
          correct: 'opt1'
        },
        explanation: 'Kombinasi Tepat: Tier 1 [B] dan Tier 2 [1]. Ion H⁺ yang berlebih bereaksi dengan ion karbonat (H⁺ + CO₃²⁻ ⇌ HCO₃⁻), menyebabkan ketersediaan ion CO₃²⁻ berkurang drastis. Akibatnya, kesetimbangan CaCO₃ (s) ⇌ Ca²⁺ + CO₃²⁻ bergeser ke kanan (pelarutan), membuat cangkang biota laut rapuh.'
      }
    ]
  }
};
