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
    title: 'Asam-Basa Kuat vs Lemah vs Pekat',
    subtitle: 'Membedakan derajat ionisasi (α) dan kepekatan (Molaritas)',
    icon: '⚡',
    comparisons: [
      {
        aspect: 'Kekuatan (Kuat vs Lemah)',
        detail: 'Ditentukan oleh DERAJAT IONISASI (α), yaitu seberapa banyak zat yang terurai menjadi ion di air.',
        strong: 'Asam/Basa Kuat: Terionisasi 100% sempurna (α = 1). Reaksi berkesudahan (→). Contoh: HCl, H₂SO₄, HNO₃, NaOH, KOH.',
        weak: 'Asam/Basa Lemah: Terionisasi sebagian kecil (α << 1, memiliki Ka atau Kb). Reaksi bolak-balik (⇌). Contoh: CH₃COOH, HF, NH₃.'
      },
      {
        aspect: 'Kepekatan (Pekat vs Encer)',
        detail: 'Ditentukan oleh KONSENTRASI ZAT TERLARUT (Molaritas / mol per liter), BUKAN kekuatannya!',
        crucialDifference: 'PENTING: Asam lemah bisa saja pekat (misal CH₃COOH 10 M), dan asam kuat bisa saja sangat encer (misal HCl 0,0001 M). Kekuatan ≠ Kepekatan!'
      }
    ]
  }
];
