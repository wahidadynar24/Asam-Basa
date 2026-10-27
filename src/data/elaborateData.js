// Data Kasus Kontekstual untuk Tahap Elaborate

export const ELABORATE_CASES = {
  beverages: {
    title: 'Aktivitas 1: Komparasi Keasaman Minuman & Kesehatan Gigi',
    intro: 'Banyak minuman populer memiliki pH di bawah batas kritis email gigi (pH 5,5). Bandingkan tingkat keasamannya:',
    items: [
      {
        id: 'lime',
        name: 'Jus Jeruk Nipis',
        pH: 2.1,
        acidType: 'Asam Sitrat',
        effect: 'Sangat asam, berisiko tinggi mengikis email gigi jika terpapar lama.',
        color: '#ef4444'
      },
      {
        id: 'cola',
        name: 'Minuman Bersoda (Kola)',
        pH: 2.6,
        acidType: 'Asam Fosfat & Karbonat',
        effect: 'pH sangat rendah + kandungan gula tinggi mempercepat demineralisasi gigi.',
        color: '#f97316'
      },
      {
        id: 'coffee',
        name: 'Kopi Hitam',
        pH: 5.0,
        acidType: 'Asam Klorogenat',
        effect: 'Asam ringan, mendekati batas kritis enamel gigi (5,5).',
        color: '#eab308'
      },
      {
        id: 'milk',
        name: 'Susu Sapi Murni',
        pH: 6.7,
        acidType: 'Asam Laktat (sangat sedikit)',
        effect: 'Mendekati netral, kaya kalsium dan kasein yang melindungi gigi.',
        color: '#84cc16'
      },
      {
        id: 'water',
        name: 'Air Mineral Pegunungan',
        pH: 7.4,
        acidType: 'Mengandung bikarbonat (HCO₃⁻)',
        effect: 'Aman dan membantu menetralkan keasaman di rongga mulut setelah makan.',
        color: '#10b981'
      }
    ],
    question: {
      prompt: 'Mengapa dokter gigi menyarankan berkumur dengan air putih setelah meminum kola atau jus lemon?',
      options: [
        { id: 'a', text: 'Air putih mengencerkan asam dan menaikkan pH mulut kembali mendekati netral (pH 7).', correct: true },
        { id: 'b', text: 'Air putih mengubah asam fosfat menjadi asam kuat yang berbahaya.', correct: false },
        { id: 'c', text: 'Air putih membuat suhu rongga mulut menjadi sangat dingin.', correct: false }
      ],
      explanation: 'Benar! Air putih memiliki pH netral (~7) yang membilas asam sisa, merangsang air liur (saliva), dan mengembalikan pH mulut di atas ambang kritis 5,5.'
    }
  },

  classificationGame: {
    title: 'Aktivitas 2: Klasifikasi Produk Rumah Tangga',
    intro: 'Kelompokkan bahan-bahan berikut ke dalam kategori Asam, Netral, atau Basa berdasarkan sifat kimianya:',
    substances: [
      { id: 'item1', name: 'Cuka Makan', icon: '🍶', correctCategory: 'acid', hint: 'Mengandung asam asetat' },
      { id: 'item2', name: 'Jus Tomat', icon: '🍅', correctCategory: 'acid', hint: 'pH sekitar 4.0 – 4.5' },
      { id: 'item3', name: 'Air Aki (Zuur)', icon: '🔋', correctCategory: 'acid', hint: 'Mengandung asam sulfat (H₂SO₄)' },
      { id: 'item4', name: 'Air Murni / Garam Dapur (NaCl)', icon: '🧂', correctCategory: 'neutral', hint: 'pH = 7, garam dari asam kuat dan basa kuat' },
      { id: 'item5', name: 'Sabun Cuci / Deterjen', icon: '🧼', correctCategory: 'base', hint: 'Terasa licin di kulit, pH > 9' },
      { id: 'item6', name: 'Baking Soda (NaHCO₃)', icon: '🧁', correctCategory: 'base', hint: 'Larutannya bersifat basa lemah (pH ~8.4)' },
      { id: 'item7', name: 'Obat Maag (Antasida)', icon: '💊', correctCategory: 'base', hint: 'Mengandung Mg(OH)₂ atau Al(OH)₃ untuk menetralkan asam lambung' },
      { id: 'item8', name: 'Cairan Pemutih Pakaian', icon: '🧴', correctCategory: 'base', hint: 'Mengandung NaOCl yang sangat basa (pH ~11-12)' }
    ]
  },

  oceanAcidification: {
    title: 'Aktivitas 3: Analisis Fenomena Pengasaman Laut (Ocean Acidification)',
    intro: 'Fenomena global pengasaman laut terjadi akibat penyerapan kelebihan gas karbon dioksida (CO₂) atmosfer ke dalam air laut.',
    steps: [
      {
        step: 1,
        title: 'Pelarutan CO₂',
        reaction: 'CO₂ (g) + H₂O (l) ⇌ H₂CO₃ (aq)',
        desc: 'Gas CO₂ berlebih di atmosfer larut dalam air laut membentuk asam karbonat (H₂CO₃).'
      },
      {
        step: 2,
        title: 'Pelepasan Ion H⁺',
        reaction: 'H₂CO₃ (aq) ⇌ H⁺ (aq) + HCO₃⁻ (aq)',
        desc: 'Asam karbonat terurai melepaskan ion hidrogen (H⁺). Peningkatan [H⁺] menyebabkan pH air laut menurun (menjadi lebih asam).'
      },
      {
        step: 3,
        title: 'Perebutan Ion Karbonat (CO₃²⁻)',
        reaction: 'H⁺ (aq) + CO₃²⁻ (aq) ⇌ HCO₃⁻ (aq)',
        desc: 'Ion H⁺ bebas berikatan dengan ion karbonat (CO₃²⁻) membentuk bikarbonat.'
      },
      {
        step: 4,
        title: 'Dampak pada Biota Laut Berkapur',
        reaction: 'CaCO₃ (s) ⇌ Ca²⁺ (aq) + CO₃²⁻ (aq)',
        desc: 'Hewan laut (kerang, moluska, dan terumbu karang) kekurangan ion CO₃²⁻ untuk membentuk cangkang kalsium karbonat (CaCO₃), bahkan cangkang yang ada mulai terlarut rapuh!'
      }
    ],
    question: {
      prompt: 'Berdasarkan reaksi di atas, apa akar penyebab utama rapuhnya cangkang kalsium karbonat (CaCO₃) pada biota laut?',
      options: [
        { id: 'opt1', text: 'Kenaikan konsentrasi ion H⁺ yang merebut ion karbonat (CO₃²⁻), sehingga biota laut kekurangan bahan baku penyusun cangkang.', correct: true },
        { id: 'opt2', text: 'Air laut menguap terlalu cepat sehingga cangkang menjadi kering.', correct: false },
        { id: 'opt3', text: 'Air laut berubah menjadi larutan basa kuat yang membakar cangkang.', correct: false }
      ],
      explanation: 'Tepat sekali! Peningkatan ion H⁺ bebas menurunkan pH laut dan bereaksi dengan ion CO₃²⁻, menyisakan sedikit sekali ion karbonat yang dibutuhkan biota laut untuk membentuk dan mempertahankan cangkang CaCO₃.'
    }
  }
};
