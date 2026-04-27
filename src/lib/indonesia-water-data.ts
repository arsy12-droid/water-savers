// ============================================================================
// Indonesia Water Crisis Map Data
// GeoJSON FeatureCollection for 34 provinces with water crisis indicators
// Data sources: WRI Aqueduct 2023, BPS Susenas 2023
// ============================================================================

export type WaterStressLevel = 'low' | 'low-medium' | 'medium-high' | 'high' | 'extremely-high';

interface ProvinceProperties {
  name: string;
  nameEn: string;
  waterStress: number; // 0-5 (WRI Aqueduct Baseline Water Stress)
  cleanWaterAccess: number; // percentage
  population: number; // millions
  issue: string; // main water crisis issue (Indonesian)
}

export interface ProvinceFeature {
  type: 'Feature';
  properties: ProvinceProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface IndonesiaGeoJSON {
  type: 'FeatureCollection';
  features: ProvinceFeature[];
}

// ============================================================================
// Color Scale Functions
// ============================================================================

export function getStressLevel(score: number): WaterStressLevel {
  if (score < 1) return 'low';
  if (score < 2) return 'low-medium';
  if (score < 3) return 'medium-high';
  if (score < 4) return 'high';
  return 'extremely-high';
}

export function getStressColor(score: number): string {
  if (score < 1) return '#22c55e';   // green-500
  if (score < 2) return '#84cc16';   // lime-500
  if (score < 3) return '#eab308';   // yellow-500
  if (score < 4) return '#f97316';   // orange-500
  return '#ef4444';                   // red-500
}

export function getStressColorDark(score: number): string {
  if (score < 1) return '#16a34a';   // green-600
  if (score < 2) return '#65a30d';   // lime-600
  if (score < 3) return '#ca8a04';   // yellow-600
  if (score < 4) return '#ea580c';   // orange-600
  return '#dc2626';                   // red-600
}

export function getStressLevelLabel(score: number, lang: 'id' | 'en'): string {
  const level = getStressLevel(score);
  const labels: Record<WaterStressLevel, { id: string; en: string }> = {
    low: { id: 'Rendah', en: 'Low' },
    'low-medium': { id: 'Rendah-Sedang', en: 'Low-Medium' },
    'medium-high': { id: 'Sedang-Tinggi', en: 'Medium-High' },
    high: { id: 'Tinggi', en: 'High' },
    'extremely-high': { id: 'Sangat Tinggi', en: 'Extremely High' },
  };
  return labels[level][lang];
}

export function getStressEmoji(score: number): string {
  if (score < 1) return '💚';
  if (score < 2) return '💛';
  if (score < 3) return '🟠';
  if (score < 4) return '🟠';
  return '🔴';
}

// ============================================================================
// GeoJSON FeatureCollection — 34 Provinces
// Simplified polygon coordinates (approximate geographic positions)
// ============================================================================

export const indonesiaProvinces: IndonesiaGeoJSON = {
  type: 'FeatureCollection',
  features: [
    // ========================================================================
    // SUMATRA
    // ========================================================================
    {
      type: 'Feature',
      properties: {
        name: 'Aceh',
        nameEn: 'Aceh',
        waterStress: 1.8,
        cleanWaterAccess: 72.3,
        population: 5.4,
        issue: 'Krisis air bersih di dataran tinggi dan wilayah pesisir selatan akibat perubahan iklim',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[95.0,5.5],[95.3,5.6],[96.0,5.5],[97.0,4.5],[97.8,4.2],[98.0,3.5],[97.8,2.5],[97.5,2.0],[96.5,1.5],[95.5,2.5],[95.0,3.5],[94.8,4.5],[95.0,5.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Sumatera Utara',
        nameEn: 'North Sumatra',
        waterStress: 2.1,
        cleanWaterAccess: 78.5,
        population: 15.1,
        issue: 'Pencemaran Danau Toba dan ketergantungan irigasi pada aliran sungai yang menurun',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[97.5,2.0],[98.0,2.8],[99.0,2.8],[100.0,2.0],[100.0,1.5],[99.5,1.0],[99.0,1.2],[98.2,1.0],[97.5,1.3],[97.5,2.0]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Sumatera Barat',
        nameEn: 'West Sumatra',
        waterStress: 2.3,
        cleanWaterAccess: 80.1,
        population: 5.6,
        issue: 'Kerusakan daerah aliran sungai dan longsor yang mengganggu infrastruktur air bersih',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[98.5,0.8],[99.5,0.8],[100.8,0.2],[101.2,-0.2],[101.2,-1.0],[100.5,-1.2],[100.0,-0.8],[99.3,-0.3],[98.8,0.0],[98.5,0.8]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Riau',
        nameEn: 'Riau',
        waterStress: 1.5,
        cleanWaterAccess: 76.8,
        population: 7.0,
        issue: 'Kebakaran hutan dan lahan yang mencemari sumber air serta degradasi lahan gambut',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[100.0,1.5],[101.5,1.5],[102.5,1.0],[103.0,0.5],[103.0,-0.5],[102.0,-1.0],[101.0,-0.5],[100.5,0.0],[100.0,0.5],[100.0,1.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Kepulauan Riau',
        nameEn: 'Riau Islands',
        waterStress: 2.8,
        cleanWaterAccess: 82.5,
        population: 2.2,
        issue: 'Ketergantungan pada air tanah dan desalinasi di pulau-pulau kecil',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[103.5,1.5],[104.5,1.8],[105.5,1.2],[107.0,0.8],[108.0,0.5],[108.0,-0.5],[107.0,-0.8],[105.5,-0.5],[104.5,0.0],[103.5,0.5],[103.5,1.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Jambi',
        nameEn: 'Jambi',
        waterStress: 1.6,
        cleanWaterAccess: 74.2,
        population: 3.6,
        issue: 'Deforestasi dan konversi lahan gambut yang mengurangi resapan air',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[101.0,-0.5],[102.5,-0.3],[103.5,-0.5],[104.0,-1.0],[103.5,-1.8],[102.5,-2.0],[101.5,-1.8],[101.0,-1.2],[101.0,-0.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Sumatera Selatan',
        nameEn: 'South Sumatra',
        waterStress: 2.0,
        cleanWaterAccess: 71.5,
        population: 8.6,
        issue: 'Pencemaran sungai Musi dan kebakaran lahan gambut yang merusak kualitas air',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[103.0,-1.8],[104.5,-1.5],[105.5,-2.0],[106.0,-3.0],[105.5,-3.8],[104.5,-4.0],[103.5,-3.5],[103.0,-2.8],[103.0,-1.8]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Bangka Belitung',
        nameEn: 'Bangka Belitung Islands',
        waterStress: 2.5,
        cleanWaterAccess: 69.8,
        population: 1.5,
        issue: 'Kontaminasi air akibat aktivitas penambangan timah dan keterbatasan air bersih musim kemarau',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[105.0,-1.5],[106.5,-1.5],[107.5,-2.0],[107.5,-3.2],[106.8,-3.5],[105.8,-3.2],[105.0,-2.8],[105.0,-1.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Bengkulu',
        nameEn: 'Bengkulu',
        waterStress: 1.8,
        cleanWaterAccess: 73.0,
        population: 2.0,
        issue: 'Erosi pantai dan penurunan kualitas air tanah akibat intrusi air laut',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[100.8,-2.0],[101.8,-2.0],[102.5,-2.5],[102.8,-3.5],[102.2,-4.0],[101.5,-4.0],[101.0,-3.5],[100.8,-2.8],[100.8,-2.0]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Lampung',
        nameEn: 'Lampung',
        waterStress: 2.2,
        cleanWaterAccess: 75.3,
        population: 9.0,
        issue: 'Kerusakan hutan lindung dan penurunan debit sungai Way Seputih di musim kemarau',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[104.0,-4.0],[105.2,-4.2],[105.8,-5.0],[105.5,-5.9],[104.8,-5.9],[104.2,-5.3],[103.8,-4.8],[104.0,-4.0]]],
      },
    },

    // ========================================================================
    // JAVA
    // ========================================================================
    {
      type: 'Feature',
      properties: {
        name: 'Banten',
        nameEn: 'Banten',
        waterStress: 4.5,
        cleanWaterAccess: 68.2,
        population: 12.9,
        issue: 'Krisis air bersih parah di wilayah selatan dan penurunan muka air tanah',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[105.2,-6.0],[106.0,-5.9],[106.4,-6.3],[106.4,-7.0],[105.8,-7.1],[105.2,-6.8],[105.2,-6.0]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'DKI Jakarta',
        nameEn: 'Jakarta',
        waterStress: 5.0,
        cleanWaterAccess: 63.5,
        population: 10.6,
        issue: 'Penurunan muka tanah akibat overpumping air tanah dan banjir rob yang semakin parah',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.68,-6.09],[106.97,-6.09],[106.97,-6.37],[106.68,-6.37],[106.68,-6.09]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Jawa Barat',
        nameEn: 'West Java',
        waterStress: 4.7,
        cleanWaterAccess: 66.8,
        population: 49.9,
        issue: 'Industri berat mencemari Citarum dan kekurangan air bersih di wilayah pantai utara',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.4,-6.2],[107.0,-6.1],[107.8,-6.3],[108.5,-6.5],[108.5,-7.0],[108.0,-7.5],[107.5,-7.8],[106.8,-7.6],[106.4,-7.3],[106.4,-6.2]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Jawa Tengah',
        nameEn: 'Central Java',
        waterStress: 4.2,
        cleanWaterAccess: 70.5,
        population: 36.7,
        issue: 'Penurunan muka air tanah akut dan kekeringan berkepanjangan di karst Gunung Sewu',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[108.5,-6.5],[109.5,-6.5],[110.0,-6.7],[111.0,-6.8],[111.0,-7.5],[110.5,-7.8],[109.8,-7.8],[109.2,-7.6],[108.5,-7.2],[108.5,-6.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'DI Yogyakarta',
        nameEn: 'Yogyakarta',
        waterStress: 4.0,
        cleanWaterAccess: 74.8,
        population: 3.9,
        issue: 'Penurunan air tanah drastis dan intrusi air laut di pesisir selatan',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[110.0,-7.55],[110.6,-7.5],[110.6,-7.9],[110.0,-8.0],[110.0,-7.55]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Jawa Timur',
        nameEn: 'East Java',
        waterStress: 4.3,
        cleanWaterAccess: 72.1,
        population: 40.7,
        issue: 'Kekeringan kronis di Pacitan dan Tapal Kima serta pencemaran Sungai Brantas',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[111.0,-6.8],[112.0,-6.8],[113.0,-7.0],[114.0,-7.2],[114.5,-7.6],[114.0,-8.0],[113.5,-8.3],[112.5,-8.2],[111.5,-7.8],[111.0,-7.5],[111.0,-6.8]]],
      },
    },

    // ========================================================================
    // BALI & NUSA TENGGARA
    // ========================================================================
    {
      type: 'Feature',
      properties: {
        name: 'Bali',
        nameEn: 'Bali',
        waterStress: 3.8,
        cleanWaterAccess: 77.3,
        population: 4.4,
        issue: 'Krisis air suburnia parah akibat ekspansi pariwisata dan kekurangan air di musim kemarau',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[114.4,-8.1],[115.0,-8.1],[115.7,-8.3],[115.7,-8.8],[115.0,-8.9],[114.5,-8.7],[114.4,-8.1]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Nusa Tenggara Barat',
        nameEn: 'West Nusa Tenggara',
        waterStress: 3.5,
        cleanWaterAccess: 62.5,
        population: 5.3,
        issue: 'Kekeringan akut di Sumbawa dan ketergantungan pada air hujan di Lombok',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[115.8,-8.2],[116.5,-8.1],[117.5,-8.3],[118.5,-8.5],[119.1,-8.8],[119.1,-9.0],[118.0,-9.0],[117.0,-8.8],[116.0,-8.5],[115.8,-8.2]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Nusa Tenggara Timur',
        nameEn: 'East Nusa Tenggara',
        waterStress: 3.9,
        cleanWaterAccess: 55.8,
        population: 5.5,
        issue: 'Kekeringan parah dan minimnya sumber air bersih di pulau-pulau kecil',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.3,-8.2],[121.0,-8.2],[123.0,-8.5],[124.0,-9.0],[125.0,-9.5],[124.5,-10.2],[123.5,-10.5],[121.0,-10.0],[119.5,-9.5],[119.3,-8.2]]],
      },
    },

    // ========================================================================
    // KALIMANTAN (Borneo)
    // ========================================================================
    {
      type: 'Feature',
      properties: {
        name: 'Kalimantan Barat',
        nameEn: 'West Kalimantan',
        waterStress: 1.2,
        cleanWaterAccess: 68.5,
        population: 5.4,
        issue: 'Pencemaran air sungai akibat aktivitas pertambangan emas dan perusahaan kelapa sawit',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[108.5,2.0],[109.5,2.0],[110.5,1.5],[110.5,0.0],[110.0,-1.0],[109.5,-2.0],[109.0,-1.5],[108.5,0.0],[108.5,2.0]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Kalimantan Tengah',
        nameEn: 'Central Kalimantan',
        waterStress: 0.8,
        cleanWaterAccess: 63.2,
        population: 2.7,
        issue: 'Kerusakan lahan gambut masif dan kebakaran hutan yang mengeringkan sumber air',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[110.5,0.5],[112.5,0.5],[114.0,0.0],[115.5,-1.0],[116.0,-2.0],[115.0,-3.0],[113.5,-3.0],[112.0,-2.5],[111.0,-1.5],[110.5,0.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Kalimantan Selatan',
        nameEn: 'South Kalimantan',
        waterStress: 1.5,
        cleanWaterAccess: 70.0,
        population: 4.1,
        issue: 'Banjir berulang dan pencemaran sungai Barito akibat pertambangan batubara',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[114.5,-2.5],[116.0,-2.5],[116.5,-3.0],[116.5,-4.0],[115.8,-4.2],[115.0,-3.8],[114.5,-3.5],[114.5,-2.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Kalimantan Timur',
        nameEn: 'East Kalimantan',
        waterStress: 1.0,
        cleanWaterAccess: 72.5,
        population: 3.9,
        issue: 'Dampak perluasan IKN terhadap air tanah dan pencemaran tambang batubara',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[115.5,-0.5],[117.0,0.5],[117.5,1.0],[118.0,1.5],[118.0,0.0],[117.5,-1.0],[117.0,-2.0],[116.0,-2.0],[115.5,-0.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Kalimantan Utara',
        nameEn: 'North Kalimantan',
        waterStress: 0.6,
        cleanWaterAccess: 65.0,
        population: 0.7,
        issue: 'Keterbatasan infrastruktur air bersih di daerah terpencil perbatasan',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[116.0,2.5],[117.0,3.0],[117.8,3.5],[117.8,2.0],[117.5,1.0],[117.0,0.5],[116.0,1.0],[116.0,2.5]]],
      },
    },

    // ========================================================================
    // SULAWESI
    // ========================================================================
    {
      type: 'Feature',
      properties: {
        name: 'Sulawesi Utara',
        nameEn: 'North Sulawesi',
        waterStress: 1.5,
        cleanWaterAccess: 75.0,
        population: 2.6,
        issue: 'Pencemaran Danau Tondano dan ketergantungan pada air tanah di wilayah perkotaan',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[124.0,1.5],[124.5,1.7],[125.0,1.5],[125.5,1.0],[125.0,0.5],[124.5,0.3],[124.0,0.5],[123.5,1.0],[124.0,1.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Gorontalo',
        nameEn: 'Gorontalo',
        waterStress: 1.2,
        cleanWaterAccess: 71.8,
        population: 1.2,
        issue: 'Kerusakan hutan lindung dan penurunan kualitas sumber air di daerah pegunungan',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[121.5,1.0],[122.5,1.0],[123.0,0.5],[123.5,0.3],[122.8,0.0],[122.0,0.2],[121.5,0.5],[121.5,1.0]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Sulawesi Tengah',
        nameEn: 'Central Sulawesi',
        waterStress: 1.0,
        cleanWaterAccess: 67.5,
        population: 3.0,
        issue: 'Kerusakan DAS dan sedimentasi sungai akibat aktivitas penambangan nikel',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.5,1.5],[121.0,1.5],[122.0,1.0],[123.0,0.5],[124.0,0.5],[124.5,-0.5],[124.0,-1.5],[122.5,-1.8],[121.5,-1.5],[120.5,-1.0],[119.8,-0.2],[119.5,0.5],[119.5,1.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Sulawesi Barat',
        nameEn: 'West Sulawesi',
        waterStress: 1.3,
        cleanWaterAccess: 64.0,
        population: 1.4,
        issue: 'Deforestasi dan keterbatasan akses air bersih di daerah pesisir dan pegunungan',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[118.8,-1.5],[119.5,-1.5],[119.8,-2.5],[119.5,-3.5],[119.0,-3.5],[118.8,-2.5],[118.8,-1.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Sulawesi Selatan',
        nameEn: 'South Sulawesi',
        waterStress: 2.0,
        cleanWaterAccess: 73.5,
        population: 9.1,
        issue: 'Penurunan muka air tanah di Makassar dan kekeringan di Kabupaten Bone',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.5,-2.5],[120.5,-2.5],[121.0,-3.0],[121.0,-4.0],[120.5,-5.0],[120.0,-5.5],[119.5,-5.0],[119.2,-4.0],[119.2,-3.0],[119.5,-2.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Sulawesi Tenggara',
        nameEn: 'Southeast Sulawesi',
        waterStress: 1.8,
        cleanWaterAccess: 66.5,
        population: 2.7,
        issue: 'Pencemaran tambang nikel dan kekurangan air bersih di pulau-pulau terpencil',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[121.0,-3.0],[122.5,-3.0],[123.5,-3.5],[124.0,-4.5],[123.5,-5.5],[122.5,-5.5],[121.5,-5.0],[121.0,-4.0],[121.0,-3.0]]],
      },
    },

    // ========================================================================
    // MALUKU
    // ========================================================================
    {
      type: 'Feature',
      properties: {
        name: 'Maluku',
        nameEn: 'Maluku',
        waterStress: 0.8,
        cleanWaterAccess: 60.5,
        population: 1.9,
        issue: 'Keterbatasan sumber air tawar di pulau-pulau kecil dan ketergantungan pada air hujan',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[126.0,-3.0],[128.0,-2.8],[130.0,-3.5],[131.5,-4.5],[132.5,-5.5],[131.5,-7.0],[130.0,-7.5],[128.5,-7.0],[127.0,-6.0],[126.0,-5.0],[126.0,-3.0]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Maluku Utara',
        nameEn: 'North Maluku',
        waterStress: 0.7,
        cleanWaterAccess: 58.2,
        population: 1.3,
        issue: 'Keterbatasan infrastruktur air bersih dan ketergantungan pada air tanah dangkal',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[126.0,2.5],[127.0,2.8],[128.0,2.5],[128.5,1.5],[128.0,0.5],[127.0,0.0],[126.0,0.5],[125.5,1.5],[126.0,2.5]]],
      },
    },

    // ========================================================================
    // PAPUA
    // ========================================================================
    {
      type: 'Feature',
      properties: {
        name: 'Papua',
        nameEn: 'Papua',
        waterStress: 0.5,
        cleanWaterAccess: 52.0,
        population: 4.3,
        issue: 'Keterbatasan total infrastruktur air bersih dan akses sanitasi di pedalaman',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[137.0,-2.5],[138.5,-1.5],[140.0,-2.5],[141.0,-4.0],[140.5,-6.5],[139.5,-8.0],[138.0,-8.0],[137.0,-7.5],[136.0,-6.5],[136.5,-4.5],[137.0,-2.5]]],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Papua Barat',
        nameEn: 'West Papua',
        waterStress: 0.6,
        cleanWaterAccess: 54.5,
        population: 1.1,
        issue: 'Kontaminasi merkuri dari penambangan emas ilegal dan minimnya fasilitas air bersih',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[130.5,-0.5],[132.0,0.0],[134.0,-0.5],[136.0,-1.5],[137.0,-2.5],[136.5,-4.5],[135.5,-6.5],[134.0,-7.5],[132.0,-7.0],[130.5,-5.5],[130.0,-3.5],[130.5,-0.5]]],
      },
    },
  ],
};

// ============================================================================
// Summary Statistics
// ============================================================================

export function getStressLevelCounts() {
  const counts: Record<WaterStressLevel, number> = {
    low: 0,
    'low-medium': 0,
    'medium-high': 0,
    high: 0,
    'extremely-high': 0,
  };

  for (const feature of indonesiaProvinces.features) {
    const level = getStressLevel(feature.properties.waterStress);
    counts[level]++;
  }

  return counts;
}

export function getHighStressProvinceCount(): number {
  return indonesiaProvinces.features.filter(
    (f) => f.properties.waterStress >= 3.0
  ).length;
}
