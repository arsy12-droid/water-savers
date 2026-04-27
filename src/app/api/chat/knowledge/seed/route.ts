import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { securityGuard, getClientIp } from '@/lib/security';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// Initial Q&A pairs to seed AquAI's knowledge base
const SEED_DATA = [
  // --- Water Conservation Tips ---
  {
    question: 'bagaimana cara hemat air di rumah?',
    answer: 'Nih tips yang gampang banget diterapin di rumah:\n\n1️⃣ Matikan keran pas sikat gigi — bisa hemat 12 liter/hari\n2️⃣ Mandi gayung bukan shower — 20-30 liter vs 45-60 liter\n3️⃣ Pakai dual-flush toilet — hemat 50% air flushing\n4️⃣ Siram tanaman pakai air bekas cuci beras\n5️⃣ Cek keran bocor — 1 bocor kecil bisa buang 11.350 liter/tahun!\n\nDari semua ini, yang paling gampang dan dampaknya langsung terasa itu matikan keran waktu sikat gigi 💧',
    lang: 'id',
  },
  {
    question: 'how to save water at home?',
    answer: 'Here are easy water-saving tips you can do at home:\n\n1️⃣ Turn off the tap while brushing teeth — saves 12 liters/day\n2️⃣ Use a bucket instead of shower — 20-30L vs 45-60L\n3️⃣ Use dual-flush toilets — saves 50% flushing water\n4️⃣ Water plants with rice washing water\n5️⃣ Fix leaky taps — 1 small leak wastes 11,350 liters/year!\n\nThe easiest one with the biggest impact: just turn off that tap while brushing! 💧',
    lang: 'en',
  },
  {
    question: 'kenapa laut asin?',
    answer: 'Jadi gini, hujan mengikis batuan di daratan terus bawa mineral terlarut ke sungai, dan lama-kelamaan semua mineral itu terkumpul di laut selama miliaran tahun. Air laut menguap karena panas matahari, tapi garamnya nggak ikut menguap — jadi makin lama makin pekat. Totalnya ada sekitar 50 miliar miliar ton garam terlarut di semua laut dunia! 🌊',
    lang: 'id',
  },
  {
    question: 'why is the ocean salty?',
    answer: 'Rain erodes rocks on land, dissolving minerals that rivers carry to the ocean. Over billions of years, these minerals accumulated. When ocean water evaporates, salt stays behind, making it more concentrated. There are about 50 billion billion tons of dissolved salt in all oceans combined! 🌊',
    lang: 'en',
  },
  // --- Indonesia Water Crisis ---
  {
    question: 'krisis air di Indonesia parah banget kah?',
    answer: 'Sayangnya iya 😢 Data-datanya ngeri:\n\n- 18,6% rumah tangga belum punya akses air minum layak\n- 73% sungai yang dipantau tercemar\n- ~30 juta orang alami kelangkaan air musiman\n- Jakarta ambles 5,76 cm/tahun karena over-eksploitasi air tanah\n- 1 dari 3 sekolah nggak punya fasilitas air minum yang memadai\n\nTapi yang bikin pilu adalah — Indonesia sebenarnya punya air BANYAK. 5.590 sungai, hujan deras setiap tahun. Masalahnya bukan kurang air, tapi cara ngelolanya yang salah 💧',
    lang: 'id',
  },
  {
    question: 'how bad is Indonesia water crisis?',
    answer: "Unfortunately, yes it's quite serious 😢 Here's the data:\n\n- 18.6% of households lack access to safe drinking water\n- 73% of monitored rivers are polluted\n- ~30 million people experience seasonal water scarcity\n- Jakarta sinks 5.76 cm/year due to groundwater over-exploitation\n- 1 in 3 schools lacks adequate drinking water facilities\n\nBut here's the thing — Indonesia actually has PLENTY of water. 5,590 rivers, heavy rainfall every year. The problem isn't scarcity, it's mismanagement 💧",
    lang: 'en',
  },
  // --- Water & Health ---
  {
    question: 'berapa liter air yang harus diminum sehari?',
    answer: 'Umumnya anjuran WHO itu 2 liter atau 8 gelas per hari buat orang dewasa. Tapi sebenarnya kebutuhannya beda-beda tergantung:\n\n👶 Anak-anak: 1-1,5 liter\n🧒 Remaja: 1,5-2 liter\n🧑 Dewasa: 2-2,5 liter\n🏋️ Olahragawan: 3-4 liter\n🤰 Ibu hamil: 2,5-3 liter\n\nTips: jangan tunggu haus baru minum! Kalau urine kamu kuning pekat, itu tandanya kamu dehidrasi 💧',
    lang: 'id',
  },
  {
    question: 'how much water should I drink per day?',
    answer: 'WHO generally recommends 2 liters or 8 glasses per day for adults. But actual needs vary:\n\n👶 Children: 1-1.5 liters\n🧒 Teens: 1.5-2 liters\n🧑 Adults: 2-2.5 liters\n🏋️ Athletes: 3-4 liters\n🤰 Pregnant women: 2.5-3 liters\n\nPro tip: don\'t wait until you\'re thirsty! If your urine is dark yellow, that\'s a sign of dehydration 💧',
    lang: 'en',
  },
  // --- Water & Science ---
  {
    question: 'apa itu water footprint?',
    answer: 'Water footprint itu total air yang dipake dari awal sampai akhir buat bikin satu produk. Contohnya nih:\n\n🍚 1 kg beras = ~2.500 liter\n🥩 1 kg daging sapi = ~15.000 liter\n👕 1 kaos katun = ~2.700 liter\n📱 1 smartphone = ~12.000 liter\n☕ 1 cangkir kopi = ~140 liter\n\nJadi pola makan kita ternyata dampaknya besar banget ke ketersediaan air. Kurangi food waste dan sesekali veggie day bisa bantu mengurangi water footprint kamu! 💧',
    lang: 'id',
  },
  {
    question: 'what is water footprint?',
    answer: 'Water footprint is the total amount of water used to produce something from start to finish. Examples:\n\n🍚 1 kg rice = ~2,500 liters\n🥩 1 kg beef = ~15,000 liters\n👕 1 cotton t-shirt = ~2,700 liters\n📱 1 smartphone = ~12,000 liters\n☕ 1 cup of coffee = ~140 liters\n\nSo our diet actually has a huge impact on water availability. Reducing food waste and having an occasional veggie day can really help reduce your water footprint! 💧',
    lang: 'en',
  },
  // --- El Nino & Climate ---
  {
    question: 'apa itu El Nino dan dampaknya ke Indonesia?',
    answer: 'El Niño itu fenomena pemanasan suhu permukaan laut di Samudera Pasifik yang bikin pola cuaca global berubah. Dampaknya ke Indonesia:\n\n🔥 Musim kemarau makin panjang dan kering\n🌾 Kekeringan lebih parah, gagal panen meningkat\n🌊 Suhu laut naik → ikan menyingkir → nelayan susah\n🔥 Potensi kebakaran hutan meningkat\n💧 Curah hujan berkurang drastis di beberapa daerah\n\nEl Niño 2023 yang lalu salah satu terkuat sejak 2015, menyebabkan kekeringan di 250.000+ hektar lahan pertanian. Lawannya La Niña, yang bikin hujan lebih banyak dan berpotensi banjir 🌊',
    lang: 'id',
  },
  {
    question: 'what is El Nino and its impact on Indonesia?',
    answer: 'El Niño is the warming of sea surface temperatures in the Pacific Ocean that changes global weather patterns. Its impact on Indonesia:\n\n🔥 Longer and drier dry seasons\n🌾 More severe droughts and crop failures\n🌊 Rising sea temperatures → fish move away → harder for fishermen\n🔥 Increased risk of forest fires\n💧 Drastically reduced rainfall in some areas\n\nThe 2023 El Niño was one of the strongest since 2015, causing drought across 250,000+ hectares of farmland. Its opposite La Niña brings more rain and potential flooding 🌊',
    lang: 'en',
  },
  // --- Water Pollution ---
  {
    question: 'bagaimana cara mengurangi pencemaran air?',
    answer: 'Pencemaran air di Indonesia itu kompleks, tapi kita bisa mulai dari hal kecil:\n\n1️⃣ Jangan buang sampah ke selokan/sungai — 30% drainase kota tersumbat sampah\n2️⃣ Kurangi penggunaan plastik sekali pakai — Indonesia peringkat 5 pencemar plastik lautan dunia\n3️⃣ Gunakan produk ramah lingkungan (deterjen biodegradable)\n4️⃣ Jangan buang minyak goreng ke wastafel — buat ke biofuel\n5️⃣ Pisahkan sampah organik dan anorganik di rumah\n6️⃣ Ikut aksi bersih sungai di komunitasmu\n7️⃣ Edukasi teman dan keluarga tentang dampak sampah ke air\n\nIngat, sungai bersih dimulai dari rumah kita masing-masing! 💧',
    lang: 'id',
  },
  {
    question: 'how to reduce water pollution?',
    answer: 'Water pollution in Indonesia is complex, but we can start small:\n\n1️⃣ Never throw trash into drains/rivers — 30% of city drainage is clogged by waste\n2️⃣ Reduce single-use plastics — Indonesia ranks 5th globally for ocean plastic pollution\n3️⃣ Use eco-friendly products (biodegradable detergent)\n4️⃣ Never pour cooking oil down the drain — recycle it into biofuel\n5️⃣ Separate organic and inorganic waste at home\n6️⃣ Join community river cleanup actions\n7️⃣ Educate friends and family about waste impact on water\n\nRemember, clean rivers start from our own homes! 💧',
    lang: 'en',
  },
  // --- Rainwater Harvesting ---
  {
    question: 'apa itu pemanenan air hujan?',
    answer: 'Pemanenan air hujan (rainwater harvesting) itu teknik menampung air hujan dari atap untuk dipakai lagi. Di Indonesia yang hujannya banyak, ini potensinya gede banget:\n\n🏠 1 m² atap bisa kumpulin ~1.000 liter air/tahun\n💧 Bisa buat siram tanaman, cuci motor, flushing toilet\n💰 Hemat tagihan air PDAM\n🌱 Mengurangi beban drainase kota saat hujan deras\n\nCara gampangnya: pasang talang di atap → sambung ke tampungan → filter sederhana → pakai! Permen PUPR 2024 bahkan mewajibkan bangunan baru untuk punya sistem ini 🌧️',
    lang: 'id',
  },
  {
    question: 'what is rainwater harvesting?',
    answer: 'Rainwater harvesting is the technique of collecting rainwater from rooftops for reuse. In Indonesia with heavy rainfall, the potential is huge:\n\n🏠 1 m² of roof can collect ~1,000 liters/year\n💧 Can be used for watering plants, washing vehicles, toilet flushing\n💰 Saves on water bills\n🌱 Reduces drainage burden during heavy rain\n\nSimple setup: install gutters on roof → connect to storage tank → simple filter → use! Permen PUPR 2024 even mandates this for new buildings 🌧️',
    lang: 'en',
  },
  // --- Coral Reefs ---
  {
    question: 'mengapa terumbu karang penting?',
    answer: 'Terumbu karang itu penting banget, sering disebut "hutan hujan laut" karena keanekaragaman hayati yang luar biasa:\n\n🐠 Menjadi rumah bagi 25% spesies laut dunia\n🛡️ Melindungi garis pantai dari abrasi dan badai\n💰 Mendukung perikanan yang jadi sumber penghidupan 500 juta orang\n💊 Sumber obat-obatan (kanker, penyakit jantung)\n💰 Kontribusi triliunan dolar ke ekonomi global\n\nSayangnya, 70% terumbu karang Indonesia sudah rusak karena pemanasan global, pencemaran, dan destructive fishing. Indonesia punya terumbu karang terbesar kedua di dunia setelah Australia — jadi menjaganya itu tanggung jawab besar kita 🐠',
    lang: 'id',
  },
  {
    question: 'why are coral reefs important?',
    answer: "Coral reefs are incredibly important, often called the \"rainforests of the sea\" because of their extraordinary biodiversity:\n\n🐠 Home to 25% of all marine species\n🛡️ Protect coastlines from erosion and storms\n💰 Support fisheries that feed 500 million people\n💊 Source of medicines (cancer, heart disease treatments)\n💰 Contribute trillions of dollars to the global economy\n\nSadly, 70% of Indonesia's coral reefs are already damaged due to global warming, pollution, and destructive fishing. Indonesia has the world's second-largest coral reef system after Australia — so protecting them is our huge responsibility 🐠",
    lang: 'en',
  },
  // --- Website Water Savers FAQ ---
  {
    question: 'website ini tentang apa?',
    answer: 'Website Water Savers Team itu platform edukasi hemat air buat generasi muda Indonesia! 💧\n\nDi sini kamu bisa:\n🗺️ Jelajahi Peta Krisis Air Indonesia — 38 provinsi dengan data stres air terbaru\n🧮 Hitung jejak air harianmu di Kalkulator Jejak Air\n📊 Lihat data krisis air Indonesia yang mengkhawatirkan\n💡 Pelajari 10 langkah hemat air yang praktis\n🌊 Pahami dampak krisis air dan proyeksi ke depan\n\nDibuat oleh sekelompok pelajar Indonesia yang percaya "Every drop matters for our future" 🌊',
    lang: 'id',
  },
  {
    question: 'what is this website about?',
    answer: "The Water Savers Team website is a water conservation education platform for Indonesia's young generation! 💧\n\nHere you can:\n🗺️ Explore the Indonesia Water Crisis Map — 38 provinces with the latest water stress data\n🧮 Calculate your daily water footprint in the Water Footprint Calculator\n📊 See alarming water crisis data from Indonesia\n💡 Learn 10 practical water-saving steps\n🌊 Understand the impact of water crisis and future projections\n\nCreated by a group of Indonesian students who believe \"Every drop matters for our future\" 🌊",
    lang: 'en',
  },
  {
    question: 'siapa yang buat website ini?',
    answer: 'Website Water Savers Team dibuat oleh sekelompok pelajar Indonesia! 💪\n\nMereka percaya bahwa perubahan besar dimulai dari kebiasaan kecil — kayak matikan keran sikat gigi atau pakai tumbler. Tujuannya edukasi teman-teman sebaya soal pentingnya hemat air buat masa depan Indonesia 🇮🇩💧',
    lang: 'id',
  },
  {
    question: 'who made this website?',
    answer: "The Water Savers Team website was created by a group of Indonesian students! 💪\n\nThey believe that big change starts with small habits — like turning off the tap while brushing or using a tumbler. Their goal is to educate their peers about the importance of saving water for Indonesia's future 🇮🇩💧",
    lang: 'en',
  },
  {
    question: 'apa saja fitur di website ini?',
    answer: 'Banyak fitur keren di sini! 💧\n\n1️⃣ **Peta Krisis Air Indonesia** — Peta interaktif 38 provinsi, klik provinsi buat lihat detail stres air, akses air bersih, dan masalah utama\n\n2️⃣ **Kalkulator Jejak Air** — Jawab pertanyaan tentang kebiasaan harianmu, terus lihat berapa liter air yang kamu pakai per hari. Ada kategorinya juga: Hemat Air, Normal, Boros, atau Sangat Boros\n\n3️⃣ **Penyebab Krisis Air** — 6 penyebab utama dari pencemaran industri sampai infrastruktur buruk\n\n4️⃣ **Data Indonesia** — Statistik krisis air lengkap dengan chart penggunaan air rumah tangga\n\n5️⃣ **10 Langkah Hemat Air** — Tips praktis dari SD sampai SMA\n\n6️⃣ **Dampak Krisis Air** — Dampak negatif & positif + proyeksi kekeringan 25 tahun ke depan\n\n7️⃣ **AquAI (ini aku!)** — Chat interaktif buat tanya apa aja soal air 🤖💧',
    lang: 'id',
  },
  {
    question: 'what features does this website have?',
    answer: "There are lots of cool features here! 💧\n\n1️⃣ **Indonesia Water Crisis Map** — Interactive map of 38 provinces, click any province to see water stress details, clean water access, and main issues\n\n2️⃣ **Water Footprint Calculator** — Answer questions about your daily habits and see how many liters of water you use per day. Get categorized: Water Saver, Normal, Wasteful, or Very Wasteful\n\n3️⃣ **Causes of Water Crisis** — 6 main causes from industrial pollution to poor infrastructure\n\n4️⃣ **Indonesian Data** — Complete water crisis statistics with household water usage chart\n\n5️⃣ **10 Water Saving Steps** — Practical tips for elementary to high school students\n\n6️⃣ **Impact of Water Crisis** — Negative & positive impacts + 25-year drought projections\n\n7️⃣ **AquAI (that's me!)** — Interactive chat to ask anything about water 🤖💧",
    lang: 'en',
  },
  {
    question: 'gimana cara pakai kalkulator jejak air?',
    answer: 'Gampang banget! 💧\n\nKalkulator Jejak Air ada di bagian tengah website. Cara pakainya:\n\n1️⃣ **Langkah 1: Aktivitas Harian** — Atur slider durasi mandi, jawab Ya/Tidak buat sikat gigi dengan keran menyala, isi cuci tangan & siram toilet per hari\n\n2️⃣ **Langkah 2: Kebiasaan Makan & Minum** — Apakah masih pakai botol plastik? Berapa kali masak & cuci piring per hari?\n\n3️⃣ **Langkah 3: Kebiasaan Luar Ruangan** — Siram tanaman, cuci kendaraan, dan apakah sering bermain air\n\n4️⃣ **Hasil** — Langsung kelihatan total air per hari, per bulan, per tahun! Dibandingkan sama standar WHO (50 L/hari) dan rata-rata Indonesia (150 L/hari). Ada kategorinya juga: Hemat Air 🌿, Normal ✅, Boros ⚠️, atau Sangat Boros 🚨\n\nHasilnya bisa di-share juga loh! 📱',
    lang: 'id',
  },
  {
    question: 'how to use the water footprint calculator?',
    answer: "Super easy! 💧\n\nThe Water Footprint Calculator is in the middle section of the website. Here's how:\n\n1️⃣ **Step 1: Daily Activities** — Adjust your shower duration slider, answer Yes/No for brushing teeth with tap running, fill in handwashing & toilet flushes per day\n\n2️⃣ **Step 2: Food & Drink Habits** — Do you still use plastic bottles? How many times do you cook & wash dishes per day?\n\n3️⃣ **Step 3: Outdoor Habits** — Watering plants, washing vehicles, and do you often play with water\n\n4️⃣ **Results** — Instantly see your total water per day, month, year! Compared with WHO standard (50 L/day) and Indonesia average (150 L/day). You'll get categorized: Water Saver 🌿, Normal ✅, Wasteful ⚠️, or Very Wasteful 🚨\n\nYou can share your results too! 📱",
    lang: 'en',
  },
  {
    question: 'apa itu peta krisis air di website ini?',
    answer: 'Peta Krisis Air Indonesia itu fitur peta interaktif yang nunjukin level stres air di 38 provinsi seluruh Indonesia! 🗺️\n\nFitur-fiturnya:\n- Warna provinsi beda-beda berdasarkan level stres air (hijau = rendah, merah = tinggi)\n- Klik provinsi mana aja buat lihat detail: level stres air, persentase akses air bersih, dan masalah utama\n- Ada filter buat lihat provinsi berdasarkan level stres air\n- Bisa di-fullscreen buat lihat lebih detail\n- Data terbaru dari BMKG 2025, WRI Aqueduct 4.0, dan BPS Susenas 2024/2025\n\nCoba klik provinsimu sendiri — siapa tau hasilnya mengejutkan! 🤔',
    lang: 'id',
  },
  {
    question: 'what is the water crisis map on this website?',
    answer: "The Indonesia Water Crisis Map is an interactive map feature showing water stress levels across all 38 provinces of Indonesia! 🗺️\n\nFeatures:\n- Province colors vary based on water stress level (green = low, red = high)\n- Click any province to see details: water stress level, clean water access percentage, and main issues\n- Filter to view provinces by water stress level\n- Fullscreen mode for a closer look\n- Latest data from BMKG 2025, WRI Aqueduct 4.0, and BPS Susenas 2024/2025\n\nTry clicking on your own province — the results might surprise you! 🤔",
    lang: 'en',
  },
  {
    question: 'website ini bisa diakses bahasa apa?',
    answer: 'Website ini dukung 2 bahasa: Bahasa Indonesia dan English! 🇮🇩🇬🇧\n\nBisa di-switch kapan aja langsung dari menu navigasi. Jadi buat teman-teman yang mau belajar bahasa Inggris sambil belajar soal hemat air, bisa banget! 💧',
    lang: 'id',
  },
  {
    question: 'what languages does this website support?',
    answer: "This website supports 2 languages: Bahasa Indonesia and English! 🇮🇩🇬🇧\n\nYou can switch between them anytime from the navigation menu. Great for friends who want to practice English while learning about water conservation! 💧",
    lang: 'en',
  },
];

export async function POST(request: NextRequest) {
  // Security: rate limit + CSRF validation
  const guard = securityGuard(request);
  if (guard) return guard;

  const ip = getClientIp(request);
  const rateCheck = rateLimit(`seed:${ip}`, RATE_LIMITS.feedback);
  if (!rateCheck.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait.' },
      { status: 429 }
    );
  }

  try {
    let seeded = 0;
    let skipped = 0;

    for (const item of SEED_DATA) {
      try {
        await db.chatKnowledge.upsert({
          where: {
            question_lang: {
              question: item.question,
              lang: item.lang,
            },
          },
          update: {
            answer: item.answer,
            source: 'manual',
          },
          create: {
            question: item.question,
            answer: item.answer,
            lang: item.lang,
            source: 'manual',
            upvotes: 1,
          },
        });
        seeded++;
      } catch {
        skipped++;
      }
    }

    const total = await db.chatKnowledge.count();

    return NextResponse.json({
      success: true,
      seeded,
      skipped,
      total,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed knowledge base' },
      { status: 500 }
    );
  }
}
