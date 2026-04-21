export type Lang = 'id' | 'en';

export interface TranslationDict {
  [key: string]: { id: string; en: string };
}

export const translations: TranslationDict = {
  // Navigation
  nav_cause: { id: 'Penyebab', en: 'Causes' },
  nav_data: { id: 'Data', en: 'Data' },
  nav_steps: { id: 'Langkah Hemat Air', en: 'Water Saving Steps' },
  nav_impact: { id: 'Dampak', en: 'Impact' },
  nav_cause_m: { id: 'Penyebab Krisis Air', en: 'Causes of Water Crisis' },
  nav_data_m: { id: 'Data Indonesia', en: 'Indonesian Data' },
  nav_steps_m: { id: 'Langkah Hemat Air', en: 'Water Saving Steps' },
  nav_impact_m: { id: 'Dampak', en: 'Impact' },

  // Hero
  hero_badge: { id: 'Untuk Generasi Muda Indonesia', en: "For Indonesia's Young Generation" },
  hero_title_accent: { id: 'Hemat Air', en: 'Save Water' },
  hero_title_before: { id: 'Jadi Perubahan,', en: 'Be The Change,' },
  hero_desc: {
    id: 'Indonesia punya 5.590 sungai, tapi jutaan warga masih kekurangan air bersih. Sebagai pelajar, kamu bisa mulai dari hal kecil yang berdampak besar.',
    en: 'Indonesia has 5,590 rivers, yet millions of people still lack access to clean water. As a student, you can start with small things that make a big impact.',
  },
  hero_btn1: { id: 'Lihat Langkahnya', en: 'See the Steps' },
  hero_btn2: { id: 'Penyebab Krisis Air', en: 'Causes of Water Crisis' },
  hero_scroll: { id: 'Scroll', en: 'Scroll' },

  // Causes
  cause_badge: { id: 'Penyebab Krisis Air', en: 'Causes of Water Crisis' },
  cause_title_accent: { id: 'di Indonesia', en: 'in Indonesia' },
  cause_title: { id: 'Penyebab Krisis Air', en: 'Causes of Water Crisis' },
  cause_desc: {
    id: 'Krisis air di Indonesia bukan karena airnya sedikit — tapi karena cara kita mengelolanya salah',
    en: "The water crisis in Indonesia isn't because water is scarce — it's because we manage it poorly",
  },
  c1_title: { id: 'Pencemaran Industri', en: 'Industrial Pollution' },
  c1_desc: {
    id: 'Limbah pabrik dibuang ke sungai tanpa pengolahan memadai. Data KLHK dalam BPS mencatat sekitar 73% sungai yang dipantau di Indonesia berstatus tercemar ringan hingga berat berdasarkan Indeks Pencemaran (IP) tahun 2023.',
    en: 'Factory waste is dumped into rivers without adequate treatment. KLHK data cited by BPS records that approximately 73% of monitored rivers in Indonesia are mildly to heavily polluted based on Pollution Index (IP) 2023.',
  },
  c2_title: { id: 'Deforestasi Masif', en: 'Massive Deforestation' },
  c2_desc: {
    id: 'Hutan yang mengatur siklus hidrologi terus ditebang. Global Forest Watch mencatat Indonesia kehilangan sekitar 1,7 juta hektar hutan alam dari 2021 hingga 2024.',
    en: "Forests that regulate the hydrological cycle are continuously cut down. Global Forest Watch records that Indonesia lost ~1.7 million hectares of natural forest from 2021 to 2024.",
  },
  c3_title: { id: 'Kebiasaan Pemborosan', en: 'Wasteful Habits' },
  c3_desc: {
    id: 'Keran yang lupa ditutup mengalirkan 6 liter/menit (WHO), mandi terlalu lama memboroskan 45-60 liter (PDAM). Secara kumulatif, kebiasaan sepele ini menyumbang pemborosan besar di level rumah tangga.',
    en: 'A forgotten running tap flows 6 liters/min (WHO), excessively long showers waste 45-60 liters (PDAM). Cumulatively, these trivial habits contribute to massive household water waste.',
  },
  c4_title: { id: 'Perubahan Iklim', en: 'Climate Change' },
  c4_desc: {
    id: 'BMKG mencatat rata-rata musim kemarau di Indonesia makin panjang 10-20 hari dan pola curah hujan semakin tidak menentu dalam dekade terakhir akibat fenomena ENSO yang lebih ekstrem.',
    en: 'BMKG records the average dry season in Indonesia is 10-20 days longer and rainfall patterns are increasingly erratic over the past decade due to more extreme ENSO events.',
  },
  c5_title: { id: 'Urbanisasi Padat', en: 'Dense Urbanization' },
  c5_desc: {
    id: 'BPS 2023: 57,5% penduduk Indonesia tinggal di perkotaan. Pulau Jawa yang hanya 6,9% luas Indonesia menampung 56% populasi, menekan sumber air secara drastis.',
    en: "BPS 2023: 57.5% of Indonesians live in urban areas. Java, only 6.9% of Indonesia's land area, hosts 56% of the population, drastically pressuring water resources.",
  },
  c6_title: { id: 'Infrastruktur Buruk', en: 'Poor Infrastructure' },
  c6_desc: {
    id: 'Ditjen Cipta Karya mencatat rata-rata air hilang (water loss/NRW) PDAM sebesar ~37% akibat kebocoran pipa distribusi dan pencurian, jauh di atas standar ideal WHO sebesar 20%.',
    en: 'Directorate General of Human Settlements (Cipta Karya) records average PDAM water loss (NRW) at ~37% due to distribution pipe leaks and theft, far above the WHO ideal standard of 20%.',
  },

  // Data
  data_badge: { id: 'Data Indonesia', en: 'Indonesian Data' },
  data_title_accent: { id: 'Mengkhawatirkan', en: 'Figures' },
  data_title: { id: 'Angka yang', en: 'Alarming' },
  data_desc: { id: 'Data dari BPS, KLHK, WHO, dan World Resources Institute', en: 'Data from BPS, KLHK, WHO, and World Resources Institute' },
  d1_desc: { id: 'Rumah tangga belum punya akses air minum layak (BPS, Susenas 2022)', en: 'Households without access to safe drinking water (BPS, Susenas 2022)' },
  d2_desc: { id: 'Sungai yang dipantau di Indonesia tercemar ringan hingga berat (BPS, Statistik Indonesia 2023)', en: 'Monitored rivers in Indonesia are mildly to heavily polluted (BPS, Statistics Indonesia 2023)' },
  d3_desc: { id: 'Rata-rata air hilang dari PDAM sebelum sampai ke pelanggan (KPPIP, 2022)', en: 'Average PDAM water lost before reaching customers (KPPIP, 2022)' },
  d4_desc: { id: 'Indonesia masuk kategori Medium-High water stress (WRI Aqueduct, 2023)', en: 'Indonesia is in the Medium-High water stress category (WRI Aqueduct, 2023)' },
  chart_title: { id: 'Penggunaan Air Rumah Tangga Indonesia', en: 'Indonesian Household Water Usage' },
  b1_label: { id: 'Mandi & Kebersihan Diri', en: 'Bathing & Personal Hygiene' },
  b2_label: { id: 'Toilet / Kakus', en: 'Toilet' },
  b3_label: { id: 'Cuci Pakaian', en: 'Laundry' },
  b4_label: { id: 'Masak & Minum', en: 'Cooking & Drinking' },
  b5_label: { id: 'Lainnya', en: 'Others' },
  chart_src: { id: '*Sumber: Kementerian PUPR — Direktorat Pengembangan Air Minum, 2022', en: '*Source: Ministry of PUPR — Directorate of Drinking Water Development, 2022' },

  // Steps
  steps_badge: { id: '10 Langkah Hemat Air', en: '10 Water Saving Steps' },
  steps_title_accent: { id: 'Lakukan Hari Ini', en: 'Do Today' },
  steps_title: { id: 'Yang Bisa Kamu', en: 'You Can' },
  steps_campaign_label: { id: 'Kampanye oleh', en: 'Campaign by' },
  steps_desc: { id: 'Semua langkah ini bisa dilakukan oleh pelajar dari SD sampai SMA — di sekolah maupun di rumah', en: 'All these steps can be done by students from elementary to high school — at school or at home' },
  steps_quote: { id: '"Every drop matters for our future"', en: '"Every drop matters for our future"' },

  // Step items
  s1_title: { id: 'Matikan Keran Saat Sikat Gigi', en: 'Turn Off the Tap While Brushing Teeth' },
  s1_desc: { id: 'WHO mencatat keran terbuka penuh mengalirkan rata-rata 6 liter/menit. Basahi sikat, matikan keran, sikat 2 menit, baru bilas — hemat hingga 12 liter.', en: 'WHO records that a fully open tap flows an average of 6 liters/min. Wet the brush, turn off the tap, brush for 2 minutes, then rinse — saving up to 12 liters.' },
  s1_stat: { id: '~12 liter/hari', en: '~12 liters/day' },
  s2_title: { id: 'Wudhu Pakai 1 Gayung', en: 'Use 1 Dipper for Wudu' },
  s2_desc: { id: '1 gayung sekitar 0,5 liter sudah cukup sesuai tuntunan sunnah Rasulullah SAW. Jauh lebih irit dibandingkan biarkan keran mengalir saat berwudhu.', en: '1 dipper of about 0.5 liters is sufficient following the Sunnah of Prophet Muhammad SAW. Much more efficient than letting the tap run during Wudu.' },
  s2_stat: { id: '~1,5 liter/kali', en: '~1.5 liters/time' },
  s3_title: { id: 'Mandi Tanpa Menggunakan Banyak Air', en: 'Shower Without Using Excessive Water' },
  s3_desc: { id: 'PDAM mencatat shower standar mengalirkan 9-12 liter/menit. Shower 5 menit = 45-60 liter. Mandi gayung 5-7 kali hanya sekitar 20-30 liter.', en: 'PDAM records that a standard showerhead flows 9-12 liters/min. 5-minute shower = 45-60 liters. Bucket bath 5-7 times = only about 20-30 liters.' },
  s3_stat: { id: '~15-30 liter/mandi', en: '~15-30 liters/shower' },
  s4_title: { id: 'Cuci Tangan: Basahi-Sabuni-Bilas', en: 'Handwashing: Wet-Soap-Rinse' },
  s4_desc: { id: 'WHO menganjurkan cuci tangan 20 detik. Matikan keran saat menyabuni — trik sederhana ini menghemat sekitar 1 liter air setiap kali cuci tangan.', en: 'WHO recommends 20-second handwashing. Turn off the tap while soaping — this simple trick saves about 1 liter of water each time.' },
  s4_stat: { id: '~1 liter/kali', en: '~1 liter/time' },
  s5_title: { id: 'Bawa Tumbler dari Rumah', en: 'Bring a Tumbler from Home' },
  s5_desc: { id: 'Water Footprint Network menghitung produksi 1 botol plastik 500ml membutuhkan sekitar 3 liter air. Tumbler = hemat air + kurangi sampah plastik.', en: 'Water Footprint Network calculates that producing one 500ml plastic bottle requires about 3 liters of water. Tumbler = save water + reduce plastic waste.' },
  s5_stat: { id: '~3 liter + zero plastik', en: '~3 liters + zero plastic' },
  s6_title: { id: 'Lapor Keran/WC Bocor ke Guru', en: 'Report Leaky Taps/Toilets to Teachers' },
  s6_desc: { id: 'EPA (AS) menghitung 1 keran bocor kecil meneteskan sekitar 11.350 liter air per tahun. Lihat keran atau WC bocor di sekolah? Langsung lapor!', en: 'EPA (US) calculates 1 small leaky tap drips about 11,350 liters of water per year. See a leaky tap or toilet at school? Report it immediately!' },
  s6_stat: { id: '~11.350 liter/tahun', en: '~11,350 liters/year' },
  s7_title: { id: 'Jangan Bermain-Main Air', en: "Don't Play with Water" },
  s7_desc: { id: 'Bermain air di toilet, menyipratkan air ke teman, atau menyalakan keran tanpa keperluan — terlihat sepele tapi bisa memboroskan 5-20 liter per kejadian.', en: 'Playing with water in the toilet, splashing water at friends, or turning on taps for no reason — seems trivial but can waste 5-20 liters per incident.' },
  s7_stat: { id: '~5-20 liter/kali', en: '~5-20 liters/time' },
  s8_title: { id: 'Gunakan Air Bekas untuk Menyiram Tanaman', en: 'Use Wastewater to Water Plants' },
  s8_desc: { id: 'Air bekas cuci beras mengandung vitamin B1, B2, dan mineral yang baik untuk tanaman. Siram pot atau taman di rumah — bisa hemat 5-10 liter/hari.', en: 'Rice washing water contains vitamin B1, B2, and minerals good for plants. Water potted plants or gardens at home — can save 5-10 liters/day.' },
  s8_stat: { id: '~5-10 liter/hari', en: '~5-10 liters/day' },
  s9_title: { id: 'Jangan Buang Sampah ke Selokan', en: "Don't Throw Trash into Drains" },
  s9_desc: { id: 'Kementerian PUPR mencatat sampah menyumbat 30% saluran drainase di kota besar, menyebabkan banjir dan mencemari sungai. Buang sampah pada tempatnya.', en: 'Ministry of PUPR records trash clogs 30% of drainage channels in major cities, causing floods and polluting rivers. Dispose of trash properly.' },
  s9_stat: { id: 'Jaga saluran air', en: 'Protect waterways' },
  s10_title: { id: 'Ajak Teman di Sekolah Ikut Hemat Air', en: 'Invite School Friends to Save Water' },
  s10_desc: { id: 'Buat poster hemat air, share di media sosial, atau jadikan tema proyek PKH. 1 orang yang menginspirasi 10 teman = dampak 11x lipat.', en: 'Make water-saving posters, share on social media, or use it as a project theme. 1 person inspiring 10 friends = 11x multiplied impact.' },
  s10_stat: { id: 'Dampak berlipat', en: 'Multiplied impact' },

  // Calculator
  calc_title: { id: 'Jika 1 Pelajar Melakukan 10 Langkah Ini', en: 'If One Student Takes These 10 Steps' },
  calc_desc: { id: 'Estimasi penghematan per hari:', en: 'Estimated savings per day:' },
  calc_unit: { id: 'liter/hari', en: 'liters/day' },
  calc_note_id_1: { id: 'Setara kebutuhan air 1 orang selama', en: "Equivalent to 1 person's water needs for" },
  calc_note_id_2: { id: 'jika konsisten setahun (standar WHO: minimum 50 liter/orang/hari untuk kebutuhan dasar).', en: 'if consistent for a year (WHO standard: minimum 50 liters/person/day for basic needs).' },
  calc_note_bold: { id: '4 bulan', en: '4 months' },

  // Impact
  impact_badge: { id: 'Dampak', en: 'Impact' },
  impact_title_accent: { id: 'di Indonesia', en: 'in Indonesia' },
  impact_title: { id: 'Dampak Krisis Air', en: 'Impact of Water Crisis' },
  impact_desc: { id: 'Krisis air bukan ancaman masa depan — ini sudah terjadi sekarang', en: 'The water crisis is not a future threat — it is happening now' },
  neg_title: { id: 'Jika Tidak Diatasi', en: 'If Left Unaddressed' },
  pos_title: { id: 'Jika Kita Hemat Air', en: 'If We Save Water' },
  n1_title: { id: 'Penyakit Terkait Air', en: 'Waterborne Diseases' },
  n1_desc: { id: 'Kemenkes RI mencatat bahwa diare masih menjadi penyebab kematian anak balita #2 di Indonesia. WHO membuktikan akses air bersih dan sanitasi layak dapat menurunkan kasus diare hingga 25-35%.', en: 'Indonesian Ministry of Health reports that diarrhea is the #2 cause of toddler mortality. WHO confirms access to clean water and proper sanitation can reduce diarrhea cases by 25-35%.' },
  n2_title: { id: 'Gagal Panen', en: 'Crop Failure' },
  n2_desc: { id: 'BMKG dan Kementan mencatat kekeringan 2023 menyebabkan lebih dari 250.000 hektar lahan pertanian terdampak secara nasional, dengan ribuan hektar mengalami gagal panen (puso).', en: 'BMKG and the Ministry of Agriculture report the 2023 drought affected more than 250,000 hectares of agricultural land nationwide, with thousands of hectares experiencing crop failure (puso).' },
  n3_title: { id: 'Amblesan Tanah', en: 'Land Subsidence' },
  n3_desc: { id: 'BKAT mencatat Jakarta terus ambles dengan penurunan tanah mencapai 5,76 cm/tahun di beberapa wilayah utara akibat over-eksploitasi air tanah. Bandung Raya mengalami penurunan muka tanah serupa.', en: 'BKAT records Jakarta continues to sink with land subsidence reaching 5.76 cm/year in some northern areas due to groundwater over-exploitation. Bandung Metropolitan Area experiences similar land subsidence.' },
  p1_title: { id: 'Masyarakat Lebih Sehat', en: 'Healthier Society' },
  p1_desc: { id: 'WHO menegaskan akses air bersih dan sanitasi layak menurunkan angka diare hingga 25-35%. Anak-anak bisa tumbuh sehat tanpa ancaman penyakit berbasis air seperti kolera dan tifoid.', en: 'WHO confirms access to clean water and proper sanitation reduces diarrhea rates by 25-35%. Children can grow healthy without the threat of waterborne diseases like cholera and typhoid.' },
  p2_title: { id: 'Pertanian Berkelanjutan', en: 'Sustainable Agriculture' },
  p2_desc: { id: 'Ketersediaan air terjaga = irigasi lancar = panen melimpah = ketahanan pangan untuk 281 juta penduduk Indonesia yang terus bertambah.', en: "Secured water availability = smooth irrigation = abundant harvest = food security for Indonesia's 281 million people, a number that keeps growing." },
  p3_title: { id: 'Lingkungan Terjaga', en: 'Preserved Environment' },
  p3_desc: { id: 'Air tanah tidak terkuras habis, sungai tidak mengering di musim kemarau, dan ekosistem akuatik terlindungi untuk generasi setelah kita.', en: "Groundwater is not depleted, rivers don't dry up in the dry season, and aquatic ecosystems are protected for generations after us." },
  proj_title: { id: 'Proyeksi Kekeringan di Indonesia', en: 'Drought Projection in Indonesia' },
  proj_src: { id: 'Sumber: World Resources Institute — Aqueduct Water Risk Atlas, 2023', en: 'Source: World Resources Institute — Aqueduct Water Risk Atlas, 2023' },
  proj1_label: { id: 'Sekarang', en: 'Now' },
  proj1_desc: { id: 'Sekitar 30 juta orang mengalami kelangkaan air musiman di Indonesia', en: 'About 30 million people experience seasonal water scarcity in Indonesia' },
  proj2_label: { id: '5 Tahun', en: '5 Years' },
  proj2_desc: { id: 'Diperkirakan lebih dari 40 juta orang akan terdampak kelangkaan air yang meningkat', en: 'An estimated more than 40 million people will be affected by increasing water scarcity' },
  proj3_label: { id: '15 Tahun', en: '15 Years' },
  proj3_desc: { id: 'Sebagian besar kota besar Indonesia mengalami stres air tinggi', en: 'Most major Indonesian cities experience high water stress' },
  proj4_label: { id: '25 Tahun', en: '25 Years' },
  proj4_desc: { id: 'Risiko "Day Zero" (hari tanpa air) di beberapa wilayah Indonesia', en: 'Risk of "Day Zero" in some regions of Indonesia' },

  // CTA
  cta_title: { id: 'Mulai Hari Ini.', en: 'Start Today.' },
  cta_desc: { id: 'Kamu tidak perlu menunggu dewasa untuk membuat perubahan. Mematikan keran adalah langkah pertama — dan itu sudah cukup berarti.', en: "You don't need to wait until adulthood to make a change. Turning off the tap is the first step — and it's already meaningful." },
  cta_btn: { id: 'Lihat Langkahnya', en: 'See the Steps' },

  // Popup dialog
  cause_popup_title: { id: 'Apa Penyebab Krisis Air?', en: 'What Causes the Water Crisis?' },
  cause_popup_desc: { id: 'Krisis air di Indonesia disebabkan oleh 6 faktor utama: pencemaran industri, deforestasi, kebiasaan pemborosan, perubahan iklim, urbanisasi padat, dan infrastruktur buruk. Pelajari lebih lanjut di bawah.', en: "Indonesia's water crisis is caused by 6 main factors: industrial pollution, deforestation, wasteful habits, climate change, dense urbanization, and poor infrastructure. Learn more below." },
  cause_popup_confirm: { id: 'Pelajari Sekarang', en: 'Learn Now' },
  cause_popup_cancel: { id: 'Kembali', en: 'Go Back' },

  // Footer
  ft_brand: { id: 'Water Savers Team', en: 'Water Savers Team' },
  ft_slogan: { id: 'Every drop matters for our future', en: 'Every drop matters for our future' },
  ft_desc: { id: 'Sekelompok pelajar Indonesia yang percaya bahwa perubahan besar dimulai dari kebiasaan kecil.', en: 'A group of Indonesian students who believe that big change starts with small habits.' },
  ft_nav_title: { id: 'Navigasi', en: 'Navigation' },
  ft_src_title: { id: 'Sumber Data', en: 'Data Sources' },
  ft_copy: { id: '© 2025 Water Savers Team. Dibuat dengan dedikasi untuk Indonesia.', en: '© 2025 Water Savers Team. Made with dedication for Indonesia.' },

  // Share
  share_btn_label: { id: 'Bagikan', en: 'Share' },
  share_copy: { id: 'Salin Link', en: 'Copy Link' },
  share_wa: { id: 'WhatsApp', en: 'WhatsApp' },
  share_x: { id: 'X (Twitter)', en: 'X (Twitter)' },
  share_msg: { id: 'Yuk hemat air demi masa depan Indonesia! Bergabunglah di Water Savers Team. 💧 #JadiPerubahanHematAir', en: "Let's save water for Indonesia's future! Join the Water Savers Team. 💧 #BeTheChangeSaveWater" },
  toast_link_copied: { id: 'Link berhasil disalin! 💧', en: 'Link copied! 💧' },

  // Toast messages
  toast_coming_soon: { id: 'Segera hadir!', en: 'Coming soon!' },

  // Chat assistant
  chat_label: { id: 'Buka asisten hemat air', en: 'Open water assistant' },
};
