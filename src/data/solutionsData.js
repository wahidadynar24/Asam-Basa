// Data Larutan untuk Fitur Explore Interaktif

export const SOLUTIONS_DATA = {
  HCl: {
    id: 'HCl',
    name: 'Asam Klorida',
    formula: 'HCl',
    type: 'Asam Kuat',
    category: 'acid',
    reaction: 'HCl (aq) → H⁺ (aq) + Cl⁻ (aq)',
    description: 'Terionisasi 100% sempurna (α = 1) di dalam air menghasilkan banyak ion H⁺ bebas.',
    defaultConc: 0.1,
    minConc: 0.001,
    maxConc: 1.0,
    step: 0.005,
    commonUse: 'Komponen utama asam lambung, pembersih kerak keramik.',
    ions: {
      positive: 'H⁺',
      negative: 'Cl⁻',
      ratio: '1 : 1'
    }
  },
  CH3COOH: {
    id: 'CH3COOH',
    name: 'Asam Asetat (Cuka)',
    formula: 'CH₃COOH',
    type: 'Asam Lemah',
    category: 'acid_weak',
    reaction: 'CH₃COOH (aq) ⇌ H⁺ (aq) + CH₃COO⁻ (aq)',
    description: 'Terionisasi sebagian (α < 1, Ka = 1,8 × 10⁻⁵). Sebagian besar molekul tetap utuh dalam air.',
    defaultConc: 0.1,
    minConc: 0.001,
    maxConc: 1.0,
    step: 0.005,
    commonUse: 'Cuka dapur (konsentrasi ~5%), pengawet makanan.',
    ions: {
      positive: 'H⁺',
      negative: 'CH₃COO⁻',
      ratio: 'sebagian kecil terurai'
    }
  },
  NaOH: {
    id: 'NaOH',
    name: 'Natrium Hidroksida',
    formula: 'NaOH',
    type: 'Basa Kuat',
    category: 'base',
    reaction: 'NaOH (aq) → Na⁺ (aq) + OH⁻ (aq)',
    description: 'Terdisosiasi sempurna (α = 1) di dalam air menghasilkan ion OH⁻ dalam konsentrasi tinggi.',
    defaultConc: 0.1,
    minConc: 0.001,
    maxConc: 1.0,
    step: 0.005,
    commonUse: 'Soda api, bahan baku sabun, pembersih saluran pipa tersumbat.',
    ions: {
      positive: 'Na⁺',
      negative: 'OH⁻',
      ratio: '1 : 1'
    }
  },
  H2O: {
    id: 'H2O',
    name: 'Air Murni (Aquades)',
    formula: 'H₂O',
    type: 'Netral',
    category: 'neutral',
    reaction: 'H₂O (l) ⇌ H⁺ (aq) + OH⁻ (aq)',
    description: 'Mengalami autoionisasi sangat sedikit (Kw = 1,0 × 10⁻¹⁴). Jumlah ion [H⁺] sama persis dengan [OH⁻] = 10⁻⁷ M pada 25°C.',
    defaultConc: 1.0,
    minConc: 1.0,
    maxConc: 1.0,
    step: 0,
    isFixedConc: true,
    commonUse: 'Pelarut universal kehidupan, standar netralitas pH = 7.',
    ions: {
      positive: 'H⁺',
      negative: 'OH⁻',
      ratio: '1 : 1 (sangat sedikit)'
    }
  }
};
