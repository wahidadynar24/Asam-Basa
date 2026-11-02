// Data Materi Ringkas, Visual, dan Padat untuk Tahap Explain

export const THEORY_MATERIALS = [
  {
    id: 'theories',
    title: '3 Teori Perkembangan Asam-Basa',
    subtitle: 'Arrhenius, Brønsted-Lowry, dan Lewis',
    icon: '🧪',
    cards: [
      {
        name: 'Teori Arrhenius (1884)',
        scientist: 'Svante Arrhenius',
        coreConcept: 'Pelarut Air (Aqueous)',
        acidDef: 'Zat yang menghasilkan ion H⁺ (atau H₃O⁺) jika dilarutkan dalam air.',
        baseDef: 'Zat yang menghasilkan ion OH⁻ jika dilarutkan dalam air.',
        example: 'HCl (aq) → H⁺ (aq) + Cl⁻ (aq)\nNaOH (aq) → Na⁺ (aq) + OH⁻ (aq)',
        limitation: 'Hanya berlaku untuk larutan dalam pelarut air (aq).'
      },
      {
        name: 'Teori Brønsted-Lowry (1923)',
        scientist: 'Johannes Brønsted & Thomas Lowry',
        coreConcept: 'Transfer Proton (H⁺)',
        acidDef: 'Donor proton (zat yang menyumbangkan atau melepas H⁺).',
        baseDef: 'Akseptor proton (zat yang menerima atau mengikat H⁺).',
        example: 'NH₃ (aq) + H₂O (l) ⇌ NH₄⁺ (aq) + OH⁻ (aq)\n(H₂O bertindak sebagai asam donor H⁺, NH₃ sebagai basa akseptor)',
        limitation: 'Memperkenalkan konsep pasangan asam-basa konjugasi.'
      },
      {
        name: 'Teori Lewis (1923)',
        scientist: 'Gilbert N. Lewis',
        coreConcept: 'Pasangan Elektron Bebas (PEB)',
        acidDef: 'Akseptor pasangan elektron (zat penerima PEB).',
        baseDef: 'Donor pasangan elektron (zat penyumbang PEB).',
        example: 'BF₃ + :NH₃ → F₃B—NH₃\n(BF₃ bertindak sebagai asam Lewis, NH₃ sebagai basa Lewis)',
        limitation: 'Mencakup reaksi tanpa pelarut air dan tanpa transfer proton.'
      }
    ]
  },
  {
    id: 'ions_equilibrium',
    title: 'Ion H⁺, OH⁻, dan Kesetimbangan Air',
    subtitle: 'Autoionisasi air dan tetapan kesetimbangan Kw',
    icon: '⚖️',
    summary: 'Air murni bukan isolator sempurna karena mengalami swa-ionisasi (autoionisasi) dalam jumlah sangat kecil.',
    equation: 'H₂O (l) ⇌ H⁺ (aq) + OH⁻ (aq)    atau    2H₂O (l) ⇌ H₃O⁺ (aq) + OH⁻ (aq)',
    points: [
      {
        label: 'Tetapan Kesetimbangan Air (Kw)',
        text: 'Pada suhu 25°C, nilai Kw = [H⁺][OH⁻] = 1,0 × 10⁻¹⁴.'
      },
      {
        label: 'Kondisi Netral',
        text: 'Konsentrasi [H⁺] = [OH⁻] = 1,0 × 10⁻⁷ M, sehingga pH = 7.'
      },
      {
        label: 'Kondisi Asam',
        text: 'Jika [H⁺] > 10⁻⁷ M (dan [OH⁻] < 10⁻⁷ M), maka pH < 7.'
      },
      {
        label: 'Kondisi Basa',
        text: 'Jika [OH⁻] > 10⁻⁷ M (dan [H⁺] < 10⁻⁷ M), maka pH > 7.'
      }
    ]
  },
  {
    id: 'ph_scale',
    title: 'Konsep pH, pOH, dan Hubungannya',
    subtitle: 'Skala logaritma konsentrasi ion hidrogen',
    icon: '📏',
    formulas: [
      {
        title: 'Rumus Derajat Keasaman (pH)',
        formula: 'pH = -log [H⁺]',
        note: 'Diusulkan oleh Søren Sørensen (1909) untuk menyederhanakan angka berpangkat kecil.'
      },
      {
        title: 'Rumus Derajat Kebasaan (pOH)',
        formula: 'pOH = -log [OH⁻]',
        note: 'Digunakan untuk mengukur konsentrasi ion hidroksida dalam larutan.'
      },
      {
        title: 'Hubungan Mutlak pada 25°C',
        formula: 'pH + pOH = 14',
        note: 'Jika pH naik, maka pOH pasti turun, dan sebaliknya, karena hasil kali ion selalu tetap (Kw = 10⁻¹⁴).'
      }
    ]
  },
  {
    id: 'strength_vs_concentration',
    title: 'Kepekatan (Konsentrasi) vs Kekuatan Asam-Basa',
    subtitle: 'Membedakan Molaritas partikel (Pekat/Encer) dan Derajat Ionisasi α (Kuat/Lemah)',
    icon: '⚡',
    analogy: {
      title: '🍵 Analogi Sederhana: Segelas Teh Manis',
      story: 'Bayangkan kamu membuat teh manis di dua gelas berbeda:',
      points: [
        {
          label: 'Kepekatan (Konsentrasi)',
          text: 'Seberapa BANYAK sendok gula yang kamu masukkan. 5 sendok gula dalam segelas kecil teh = SANGAT PEKAT (manis pekat). 1 sendok teh dalam teko besar = ENCER.'
        },
        {
          label: 'Kekuatan Zat (Ionisasi)',
          text: 'Sifat alami zat itu sendiri: Apakah zat tersebut langsung larut dan terurai 100% sempurna tanpa sisa (Kuat), atau sebagian besar butirannya tetap mengendap utuh (Lemah).'
        }
      ]
    },
    comparisons: [
      {
        aspect: 'Kepekatan (Pekat vs Encer)',
        keyMetric: 'Konsentrasi Molaritas (M = mol/Liter)',
        question: 'Berapa banyak zat yang dilarutkan ke dalam wadah?',
        pekatDesc: 'Larutan Pekat: Jumlah molekul zat terlarut sangat banyak dan berdesak-desakan dalam sedikit pelarut (contoh: 2 M, 6 M, 12 M).',
        encerDesc: 'Larutan Encer: Jumlah molekul zat terlarut sangat sedikit dan tersebar renggang di antara banyak molekul pelarut air (contoh: 0,01 M, 0,001 M).'
      },
      {
        aspect: 'Kekuatan (Kuat vs Lemah)',
        keyMetric: 'Derajat Ionisasi (α) dan Ka / Kb',
        question: 'Berapa persen zat yang berhasil pecah menjadi ion H⁺ atau OH⁻?',
        strongDesc: 'Asam/Basa Kuat: Terurai 100% sempurna (α = 1). Reaksi searah (→). Contoh: HCl, HNO₃, H₂SO₄, NaOH, KOH.',
        weakDesc: 'Asam/Basa Lemah: Terurai sebagian kecil saja (α << 1). Reaksi bolak-balik kesetimbangan (⇌). Contoh: CH₃COOH, HF, NH₃.'
      }
    ],
    quadrants: [
      {
        category: 'Kuat & Pekat',
        badge: '⚡💧 Kuat + Pekat',
        example: 'HCl 12 M (Air Keras Industri)',
        desc: 'Molekulnya sangat banyak di dalam air, dan 100% semuanya terurai menjadi ion H⁺ dan Cl⁻.',
        effect: 'Sangat korosif, nilai pH < 0, reaksi sangat hebat.',
        color: '#dc2626'
      },
      {
        category: 'Kuat & Encer',
        badge: '⚡🌊 Kuat + Encer',
        example: 'HCl 0,0001 M (HCl Sangat Encer)',
        desc: 'Hanya sedikit molekul HCl dalam air, namun seluruh molekul yang ada tersebut 100% terurai menjadi ion.',
        effect: 'pH = 4,00. Sifat asamnya lembut dan tidak membakar kulit.',
        color: '#f97316'
      },
      {
        category: 'Lemah & Pekat',
        badge: '🍃💧 Lemah + Pekat',
        example: 'CH₃COOH 10 M (Cuka Biang / Asam Asetat Glasial)',
        desc: 'Molekul asam asetat sangat padat dan banyak, tetapi hanya sekitar 0,1% yang terurai menjadi ion H⁺.',
        effect: 'Baunya sangat menyengat dan dapat mengiritasi mata/kulit karena kepekatannya tinggi!',
        color: '#eab308'
      },
      {
        category: 'Lemah & Encer',
        badge: '🍃🌊 Lemah + Encer',
        example: 'CH₃COOH 0,001 M (Cuka Encer Dapur)',
        desc: 'Molekulnya sedikit, dan yang terurai menjadi ion H⁺ pun hanya sebagian sangat kecil.',
        effect: 'pH mendekati 3,87. Aman dikonsumsi dan rasanya masam ringan.',
        color: '#10b981'
      }
    ]
  }
];
