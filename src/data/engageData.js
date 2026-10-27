// Data untuk Tahap Engage: Eksplorasi Fenomena Kehidupan Sehari-hari

export const PHENOMENA_ITEMS = [
  {
    id: 'lemon',
    name: 'Buah Lemon',
    category: 'Asam',
    taste: 'Sangat masam',
    feel: 'Kesat / perih jika kena luka',
    chemical: 'Asam Sitrat (C₆H₈O₇)',
    approxPH: '2.0 – 2.5',
    icon: '🍋',
    description: 'Rasa masam yang tajam pada jeruk lemon berasal dari kandungan asam sitrat alami.',
    fact: 'Asam sitrat sering digunakan sebagai bahan pengawet alami dan penambah cita rasa segar.'
  },
  {
    id: 'cuka',
    name: 'Cuka Dapur',
    category: 'Asam',
    taste: 'Masam menyengat',
    feel: 'Cair encer',
    chemical: 'Asam Asetat (CH₃COOH ~5%)',
    approxPH: '2.4 – 3.0',
    icon: '🍶',
    description: 'Cuka masak yang ada di dapur memiliki aroma tajam khas asam karboksilat.',
    fact: 'Dapat digunakan untuk melarutkan kerak kapur (kalsium karbonat) pada ketel air!'
  },
  {
    id: 'soda',
    name: 'Minuman Bersoda',
    category: 'Asam',
    taste: 'Masam manis menggigit',
    feel: 'Bergelembung (buih gas)',
    chemical: 'Asam Karbonat (H₂CO₃) & Asam Fosfat',
    approxPH: '2.8 – 3.5',
    icon: '🥤',
    description: 'Gas CO₂ yang dilarutkan dalam tekanan tinggi membentuk asam karbonat yang memberikan sensasi "menggigit".',
    fact: 'Tingkat keasaman soda cukup tinggi sehingga jika sering diminum dapat melarutkan enamel gigi.'
  },
  {
    id: 'air',
    name: 'Air Mineral / Murni',
    category: 'Netral',
    taste: 'Tawar / segar',
    feel: 'Biasa (tidak licin, tidak kesat)',
    chemical: 'H₂O',
    approxPH: '7.0',
    icon: '💧',
    description: 'Air murni pada suhu kamar memiliki jumlah ion H⁺ dan OH⁻ yang sama persis.',
    fact: 'Menjadi standar titik tengah (netral) pada skala pH larutan berair.'
  },
  {
    id: 'sabun',
    name: 'Sabun Mandi / Deterjen',
    category: 'Basa',
    taste: 'Pahit (tidak boleh dicicipi!)',
    feel: 'Licin di jari tangan',
    chemical: 'Garam Natrium/Kalium Karboksilat / NaOH sisa',
    approxPH: '9.0 – 10.0',
    icon: '🧼',
    description: 'Sabun terasa licin saat disentuh karena bereaksi dengan minyak alami kulit dan mengemulsi kotoran.',
    fact: 'Rasa licin adalah salah satu ciri fisik utama larutan yang mengandung basa.'
  }
];

export const ENGAGE_PROMPT_QUESTION = 
  "Menurutmu, apa yang menyebabkan suatu zat atau larutan dapat bersifat asam atau basa?";

export const PREDICTION_OPTIONS = [
  {
    id: 'opt1',
    text: 'Zat asam memiliki ion hidrogen (H⁺), sedangkan basa memiliki ion hidroksida (OH⁻).',
    isAccurate: true,
    hint: 'Berdasarkan teori Arrhenius, keberadaan ion H⁺ dan OH⁻ inilah penentu utama!'
  },
  {
    id: 'opt2',
    text: 'Sifat asam atau basa hanya ditentukan oleh rasanya (manis, masam, atau asin).',
    isAccurate: false,
    hint: 'Rasa hanyalah efek inderawi. Di laboratorium banyak asam/basa berbahaya yang tidak boleh dicicipi!'
  },
  {
    id: 'opt3',
    text: 'Asam selalu berupa cairan beracun, sedangkan basa selalu berupa padatan sabun.',
    isAccurate: false,
    hint: 'Ada asam yang aman dikonsumsi (vitamin C/asam sitrat) dan ada basa berupa gas (amonia).'
  },
  {
    id: 'opt4',
    text: 'Adanya transfer partikel proton (H⁺) atau pasangan elektron antar molekul zat.',
    isAccurate: true,
    hint: 'Ini adalah pandangan modern menurut Brønsted-Lowry dan Gilbert Lewis!'
  }
];
