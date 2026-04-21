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
