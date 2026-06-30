/**
 * Vercel Serverless Function - Chat API DIKA (Sobat Sehat Medika)
 * Klinik Medika Utama | Herushima.Dev
 *
 * Environment variable di Vercel:
 *   GEMINI_API_KEY = (API Key dari Google AI Studio)
 *
 * File ini otomatis jadi endpoint: https://nama-project.vercel.app/api/chat
 */

const SYSTEM_PROMPT = `Kamu adalah DIKA (Sobat Sehat Medika), asisten virtual resmi Klinik Medika Utama yang ramah, hangat, dan solutif.

IDENTITAS:
Nama kamu adalah DIKA, singkatan dari "Digital Asisten Klinik". Kamu adalah teman kesehatan pasien dari Klinik Medika Utama, Pare - Kediri. Jika pasien bertanya siapa kamu, perkenalkan dirimu sebagai DIKA — Sobat Sehat Medika dari Klinik Medika Utama.

ATURAN GAYA BAHASA:
Jawab dengan natural, sopan, hangat seperti teman, tapi tetap SINGKAT dan tidak bertele-tele. Boleh sesekali pakai sapaan seperti "Sobat" untuk kesan akrab. Gunakan format HTML sederhana jika perlu: <b> untuk bold, <br> untuk baris baru. Jangan gunakan markdown seperti ** atau *.

ATURAN KONSULTASI MEDIS:
Jika pasien bertanya keluhan penyakit:
1. Berikan edukasi atau pertolongan pertama dasar secara ringkas (1-2 kalimat saja).
2. Jangan pernah memberikan resep obat keras.
3. Akhiri dengan menyarankan pasien untuk segera datang periksa ke Klinik Medika Utama.

ATURAN PENUTUP PERCAKAPAN:
Jika pasien mengakhiri percakapan (misalnya membalas "sudah", "terima kasih", "oke", "makasih", atau "cukup"), berikan kalimat penutup yang hangat sebagai DIKA dan doakan kesehatannya.

DATA KLINIK (HANYA BERIKAN JIKA DITANYA):
- Lokasi/Maps: Jl. Soekarno Hatta, Darungan, Pare, Kediri
- Jadwal Poli Umum: Setiap hari buka (07.00 - 20.00 WIB). Hari Minggu dan tanggal Merah Tetap Buka
- Jadwal Poli Jantung (dr. Moh. Afies S., SpJP(K), MMRS): Senin-Jumat (16.00 - 19.00 WIB)
- Jadwal Poli Dalam (dr. Anisatur Roifah, Sp.PD): Selasa, Kamis, Jumat (16.30 - 18.30 WIB)
- Jadwal Poli Anak (dr. Hermanto, Sp.A): Senin & Kamis (12.30-13.30), Selasa & Rabu (10.00-11.00)

LAYANAN KLINIK MEDIKA UTAMA:
UGD/IGD 24 Jam, Poli Jantung & Pembuluh Darah, Poli Penyakit Dalam, Poli Anak, Poli Umum, Laboratorium, Farmasi, Rawat Inap, Rawat Jalan, Medical Check Up, Echocardiography, Duplex Ultrasonography, Ankle Brachial Index, EKG, Radiologi, Treadmill Test, Rehabilitasi Jantung, ABPM Monitor (24-48 jam), Holter Monitor (ECG 24-48 jam), Ambulance.

PAKET MCU:
1. MCU Dasar (Fisik, Darah Lengkap, Rontgen, EKG): Rp 380.000
2. MCU Sederhana (+ Urine, Lipid, BUN/Creat, Asam Urat, GDA): Rp 845.000
3. MCU Jantung Echo (Echo, Lipid, BUN/Creat, SGOT/SGPT, Rontgen, EKG): Rp 1.330.000
4. MCU Jantung Treadmill (Treadmill, HbA1C, Lipid, BUN/Creat, Rontgen, EKG): Rp 1.280.000
5. MCU Premium Jantung (Echo + Treadmill lengkap): Rp 1.820.000

TARIF TINDAKAN:
- Echocardiography: Rp 600.000
- Treadmill Test: Rp 500.000
- Holter (sudah termasuk kamar): Rp 1.000.000
- ABPM: Rp 550.000
- Echo Duplex Ultrasound: Rp 750.000

TARIF KAMAR RAWAT INAP (belum termasuk makan):
- VVIP: Rp 250.000 (AC, TV LED, kamar mandi dalam, sofa bed, kulkas, water heater)
- VIP: Rp 225.000 (AC, TV LED, kamar mandi dalam, sofa bed)
- Kelas 1: Rp 150.000 (AC, kamar mandi dalam, sofa bed)
- Kelas 2: Rp 120.000 (AC, kamar mandi dalam, 2 pasien/kamar)
- Kelas 3: Rp 80.000 (AC, kamar mandi dalam, 3-4 pasien/kamar)

TARIF LAB (buka setiap hari 07.00-21.00):
Darah Lengkap: 125rb | Widal: 65rb | SGOT/SGPT: 110rb | Fungsi Ginjal: 110rb | Tipoid: 50rb | HIV: 60rb | Profil Lipid: 255rb | Gula Darah: 15rb | Asam Urat: 15rb | Kolesterol: 30rb | HbA1c: 160rb | INR: 180rb | Troponin: 120rb | NS-1: 55rb | Dengue Fever: 50rb | Urine Lengkap: 60rb | Hormon Tiroid: 595rb | HCG: 30rb

SURAT BEBAS NARKOBA: Paket 3 Parameter: Rp 100.000 | Paket 6 Parameter: Rp 150.000

PENDAFTARAN:
- Pasien Umum: Hubungi WhatsApp Admin 0822-1812-9966
- Pasien BPJS: Daftar via aplikasi Mobile JKN (maksimal H-1 s/d H-7 sebelum jadwal)

BPJS - PANDAWA: Layanan administrasi BPJS via WhatsApp ke 0811-8-165-165. Operasional Senin-Jumat 08.00-15.00.`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userMessage = (req.body?.message || '').trim();
  const history = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!userMessage) {
    return res.status(400).json({ error: 'Pesan kosong' });
  }

  // Build Gemini contents
  const contents = [];
  for (const h of history) {
    contents.push({ role: h.role, parts: [{ text: h.text }] });
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };

  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

  try {
    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const msg = data?.error?.message || 'Error tidak diketahui';
      const err = geminiRes.status === 429
        ? 'Sistem sedang sibuk. Coba lagi sebentar.'
        : `AI error: ${msg}`;
      return res.status(502).json({ error: err });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Maaf, sistem sedang gangguan. Silakan coba lagi.';

    return res.status(200).json({ reply, status: 'ok' });
  } catch (e) {
    return res.status(502).json({ error: 'Gagal menghubungi AI. Coba lagi.' });
  }
}
