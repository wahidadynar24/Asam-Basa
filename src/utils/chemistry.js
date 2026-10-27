// Utilitas Perhitungan Kimia Asam-Basa Akurat

/**
 * Format angka ke notasi ilmiah standar dengan superskrip
 * Contoh: 1.8e-5 -> 1.80 × 10⁻⁵
 */
export function formatScientific(num) {
  if (num === 0 || !num || isNaN(num)) return '0';
  if (num >= 0.01 && num < 100) {
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }

  const expStr = num.toExponential(2);
  const [base, exp] = expStr.split('e');
  const expNum = parseInt(exp, 10);

  // Peta superskrip
  const superscriptMap = {
    '-': '⁻',
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹'
  };

  const expFormatted = String(expNum)
    .split('')
    .map((c) => superscriptMap[c] || c)
    .join('');

  return `${base} × 10${expFormatted} M`;
}

/**
 * Menghitung parameter larutan kimia:
 * - HCl (Asam kuat, [H+] = M)
 * - CH3COOH (Asam lemah, Ka = 1.8e-5, [H+] = sqrt(Ka * M))
 * - NaOH (Basa kuat, [OH-] = M, pOH = -log[OH-], pH = 14 - pOH)
 * - H2O (Netral murni, [H+] = 1e-7, [OH-] = 1e-7, pH = 7, pOH = 7)
 */
export function calculateSolution(type, concentration) {
  const c = Math.max(0.0001, Math.min(1.0, parseFloat(concentration) || 0.1));
  const Kw = 1e-14;

  let H_conc = 0;
  let OH_conc = 0;
  let pH = 7.0;
  let pOH = 7.0;
  let alpha = 1.0; // derajat ionisasi
  let nature = 'Netral';
  let categoryColor = '#10b981';

  switch (type) {
    case 'HCl': {
      // Asam Kuat Monoprotik
      H_conc = c;
      OH_conc = Kw / H_conc;
      pH = -Math.log10(H_conc);
      pOH = 14 - pH;
      alpha = 1.0;
      nature = 'Asam Kuat';
      categoryColor = '#ef4444';
      break;
    }
    case 'CH3COOH': {
      // Asam Lemah Monoprotik (Ka = 1.8 × 10⁻⁵)
      const Ka = 1.8e-5;
      H_conc = Math.sqrt(Ka * c);
      OH_conc = Kw / H_conc;
      pH = -Math.log10(H_conc);
      pOH = 14 - pH;
      alpha = H_conc / c;
      nature = 'Asam Lemah';
      categoryColor = '#f97316';
      break;
    }
    case 'NaOH': {
      // Basa Kuat Monoprotik
      OH_conc = c;
      H_conc = Kw / OH_conc;
      pOH = -Math.log10(OH_conc);
      pH = 14 - pOH;
      alpha = 1.0;
      nature = 'Basa Kuat';
      categoryColor = '#3b82f6';
      break;
    }
    case 'H2O':
    default: {
      // Air Murni Netral
      H_conc = 1.0e-7;
      OH_conc = 1.0e-7;
      pH = 7.0;
      pOH = 7.0;
      alpha = 1.8e-9;
      nature = 'Netral';
      categoryColor = '#10b981';
      break;
    }
  }

  // Batas nilai numerik wajar
  pH = Math.max(0, Math.min(14, pH));
  pOH = Math.max(0, Math.min(14, pOH));

  return {
    type,
    concentration: c,
    H_conc,
    OH_conc,
    pH: parseFloat(pH.toFixed(2)),
    pOH: parseFloat(pOH.toFixed(2)),
    alpha: parseFloat(alpha.toFixed(4)),
    nature,
    categoryColor,
    colorHex: getPHColor(pH)
  };
}

/**
 * Mendapatkan warna indikator universal berdasarkan nilai pH (0-14)
 */
export function getPHColor(pH) {
  const clamped = Math.max(0, Math.min(14, pH));
  // Warna universal indicator standar:
  // 0-1: Merah tua (#d32f2f)
  // 2-3: Merah oranye (#e64a19)
  // 4-5: Oranye / Kuning (#f57c00 / #fbc02d)
  // 6: Kuning kehijauan (#cddc39)
  // 7: Hijau netral (#4caf50)
  // 8: Hijau kebiruan (#009688)
  // 9-10: Biru (#1976d2)
  // 11-12: Indigo (#3f51b5)
  // 13-14: Ungu violet (#673ab7)
  if (clamped <= 1) return '#dc2626'; // Merah cerah
  if (clamped <= 2.5) return '#ea580c'; // Merah-oranye
  if (clamped <= 4) return '#f59e0b'; // Oranye
  if (clamped <= 5.5) return '#eab308'; // Kuning pekat
  if (clamped <= 6.5) return '#84cc16'; // Kuning kehijauan
  if (clamped <= 7.5) return '#10b981'; // Hijau zamrud (Netral)
  if (clamped <= 8.5) return '#06b6d4'; // Sian / Teal
  if (clamped <= 10) return '#3b82f6'; // Biru cerah
  if (clamped <= 11.5) return '#6366f1'; // Indigo
  if (clamped <= 13) return '#8b5cf6'; // Ungu
  return '#7c3aed'; // Deep Violet
}
