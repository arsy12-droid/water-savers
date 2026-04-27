import { NextRequest, NextResponse } from 'next/server';
import { groqVisionJSON, type GroqMessage } from '@/lib/groq';
import { validateCsrf, getClientIp } from '@/lib/security';
import { rateLimit } from '@/lib/rate-limit';
import sharp from 'sharp';

// Allow up to 30 seconds for VLM processing
export const maxDuration = 30;

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 4096;
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

const VISION_RATE_LIMIT = { windowMs: 60 * 1000, maxRequests: 10 };

const VISION_SYSTEM_PROMPT = `Kamu adalah AquAI, asisten AI dari Water Savers Team yang fokus pada konservasi air di Indonesia.

Kamu menganalisis gambar yang berkaitan dengan:
- Air, sungai, danau, laut, mata air, dan semua sumber air
- Konservasi air dan hemat air (keran hemat, tandon air, sumur resapan, dll)
- Kerusakan lingkungan terkait air: pencemaran sungai/laut, sampah plastik, limbah industri, eutrofikasi
- Infrastruktur air: keran, pipa, water meter, showerhead, toilet, instalasi PDAM
- Tanaman, pertanian, perkebunan terkait irigasi dan penggunaan air
- Banjir, kekeringan, longsor, dan bencana terkait air
- Kualitas air dan air minum: penampungan, jernih, keruh, berwarna, berbau
- Ekosistem akuatik: terumbu karang, mangrove, danau, rawa, biota laut
- Ikon dan poster hemat air untuk kampanye konservasi

Pengetahuan yang harus kamu gunakan saat menganalisis:
- Indonesia punya 5.590 sungai tapi 73% tercemar (BPS 2023)
- 18,6% rumah tangga belum punya akses air minum layak
- Keran bocor kecil = ~11.350 liter/tahun terbuang
- 70% terumbu karang Indonesia rusak
- Indonesia peringkat 5 pencemar plastik lautan dunia
- Sampah menyumbat 30% drainase kota
- Water footprint: beras 2.500L/kg, daging sapi 15.000L/kg

Jika gambar TIDAK berkaitan dengan air atau konservasi, jawab dengan sopan dalam bahasa yang sama dengan pertanyaan user:
"Maaf, aku hanya bisa menganalisis gambar yang berkaitan dengan air dan konservasi. Coba kirim foto keran, sungai, tanaman, atau hal lain yang terkait air ya!"

Atau dalam English:
"Sorry, I can only analyze images related to water and conservation. Try sending a photo of a tap, river, plant, or anything water-related!"

Jawab dengan ramah, informatif, dan memberikan saran praktis. Gunakan bahasa yang sama dengan user. Jawab singkat tapi jelas (maks 3 paragraf). Kalau user memberikan pertanyaan bersama gambar, jawab pertanyaan tersebut berdasarkan analisis gambar.`;

// ── Validation Helpers ────────────────────────────────────────────────────

function validateExtension(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ALLOWED_EXTENSIONS.has(ext);
}

function validateMagicBytes(buffer: Buffer): string | null {
  for (const [mimeType, bytes] of Object.entries(MAGIC_BYTES)) {
    if (buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b)) {
      return mimeType;
    }
  }
  return null;
}

// ── Image Processing ──────────────────────────────────────────────────────

async function processImage(buffer: Buffer): Promise<{ data: Buffer; mimeType: string }> {
  try {
    let image = sharp(buffer);
    const metadata = await image.metadata();

    if (metadata.width && metadata.width > MAX_DIMENSION) {
      image = image.resize(MAX_DIMENSION, null, { withoutEnlargement: true });
    }
    if (metadata.height && metadata.height > MAX_DIMENSION) {
      image = image.resize(null, MAX_DIMENSION, { withoutEnlargement: true });
    }

    const processed = await image
      .jpeg({ quality: 85, mozjpeg: true })
      .rotate()
      .toBuffer();

    return { data: processed, mimeType: 'image/jpeg' };
  } catch {
    const detectedMime = validateMagicBytes(buffer);
    return { data: buffer, mimeType: detectedMime || 'image/jpeg' };
  }
}

// ── Main Handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const ip = getClientIp(request);
  const rateResult = rateLimit(`vision:${ip}`, VISION_RATE_LIMIT);
  if (!rateResult.success) {
    return NextResponse.json(
      { success: false, error: 'Terlalu banyak upload. Tunggu sebentar.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body tidak valid.' },
      { status: 400 }
    );
  }

  const file = formData.get('image') as File | null;
  const prompt = (formData.get('prompt') as string | null) || '';

  if (!file) {
    return NextResponse.json(
      { success: false, error: 'File gambar diperlukan.' },
      { status: 400 }
    );
  }

  if (!validateExtension(file.name)) {
    return NextResponse.json(
      { success: false, error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: `File terlalu besar. Maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
      { status: 400 }
    );
  }

  if (file.size < 100) {
    return NextResponse.json(
      { success: false, error: 'File terlalu kecil atau tidak valid.' },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(new Uint8Array(arrayBuffer));
  const detectedMime = validateMagicBytes(buffer);

  if (!detectedMime) {
    return NextResponse.json(
      { success: false, error: 'File bukan gambar yang valid.' },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.has(detectedMime)) {
    return NextResponse.json(
      { success: false, error: 'Tipe file tidak didukung.' },
      { status: 400 }
    );
  }

  const { data: processedBuffer, mimeType: finalMime } = await processImage(buffer);

  try {
    const visionPrompt = prompt
      ? `${prompt}\n\nAnalisis gambar ini dan berikan jawaban yang relevan tentang air dan konservasi.`
      : 'Analisis gambar ini dan berikan informasi yang relevan tentang air dan konservasi. Jika gambar tidak terkait air, jelaskan dengan sopan bahwa kamu hanya bisa menganalisis gambar terkait air.';

    const base64Image = processedBuffer.toString('base64');
    const imageUrl = `data:${finalMime};base64,${base64Image}`;

    const messages: GroqMessage[] = [
      { role: 'system', content: VISION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: visionPrompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ];

    const response = await groqVisionJSON(messages);
    const aiContent = response.choices?.[0]?.message?.content || '';

    if (!aiContent.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa menganalisis gambar ini.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: aiContent.trim(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Vision API error:', msg);
    return NextResponse.json(
      { success: false, error: 'Gagal menganalisis gambar. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
