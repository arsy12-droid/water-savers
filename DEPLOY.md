# 🚀 Panduan Deploy Water Savers — Render + Groq + Turso

---

## 📋 OVERVIEW

| Komponen | Fungsi | Harga |
|---|---|---|
| **Render** | Hosting web (server Next.js) | Free tier tersedia |
| **Groq** | API AI untuk AquAI (chat, vision, search) | Free (14.400 RPD) |
| **Turso** | Database online (pengganti SQLite) | Free (500 DB + 9GB storage) |

---

## LANGKAH 1: Siapkan Akun

### 1A. Buat Akun GitHub
1. Buka https://github.com/signup
2. Daftar dengan email (gratis)
3. Buat repository baru:
   - Klik **"New repository"**
   - Nama: `water-savers` (atau terserah)
   - Set **Public** (biar bisa di-deploy ke Render free)
   - **Jangan** centang "Add a README"
   - Klik **"Create repository"**

### 1B. Buat Akun Turso
1. Buka https://turso.tech/signup
2. Daftar dengan **GitHub** (paling mudah)
3. Setelah masuk, install Turso CLI:
   ```bash
   # Di komputer kamu (bukan di project)
   # Windows: buka PowerShell
   # Mac/Linux: buka Terminal
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
4. Login ke Turso:
   ```bash
   turso auth login
   ```

### 1C. Buat Akun Render
1. Buka https://dashboard.render.com/register
2. Daftar dengan **GitHub** (paling mudah, gratis)
3. Setelah masuk, izinkan Render akses repository GitHub kamu

### 1D. Siapkan API Key Groq
1. Buka https://console.groq.com/keys
2. Login / daftar
3. Klik **"Create API Key"**
4. Beri nama: `water-savers`
5. **Copy API key** dan simpan (hanya muncul sekali!)

### 1E. Enable Model Vision di Groq
1. Buka https://console.groq.com/settings/project/limits
2. Cari model: `meta-llama/llama-4-scout-17b-16e-instruct`
3. Klik toggle **Enable** / aktifkan

---

## LANGKAH 2: Push Kode ke GitHub

### 2A. Buka Terminal di folder project

```bash
cd /path/ke/folder/project
```

### 2B. Init git & push

```bash
# Init git (jika belum ada .git)
git init

# Tambah semua file
git add .

# Commit
git commit -m "water savers - initial commit"

# Tambah remote (ganti USERNAME dengan username GitHub kamu)
git remote add origin https://github.com/USERNAME/water-savers.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

---

## LANGKAH 3: Buat Database Turso

### 3A. Buat database baru

```bash
# Buat database (nama terserah, contoh: water-savers)
turso db create water-savers

# Catat outputnya, akan seperti:
# Created database water-savers at libsql://water-savers-USERNAME.turso.io
```

### 3B. Ambil connection URL

```bash
# Lihat URL database
turso db show water-savers --url

# Output: libsql://water-savers-USERNAME.turso.io
# COPY INI!
```

### 3C. Buat Auth Token

```bash
# Buat token untuk akses database
turso db tokens create water-savers

# Output: token panjang acak
# COPY INI! (hanya muncul sekali)
```

### 3D. Push schema database

```bash
# Set environment variable dulu
export TURSO_DATABASE_URL="libsql://water-savers-USERNAME.turso.io"
export TURSO_AUTH_TOKEN="token_kamu_tadi"

# Push schema ke Turso
npx prisma db push
```

> Jika berhasil, kamu akan melihat: `Your database is now in sync with your Prisma schema.`

---

## LANGKAH 4: Deploy ke Render

### 4A. Buat Web Service baru

1. Buka https://dashboard.render.com
2. Klik **"New"** → **"Web Service"**
3. Pilih repository **water-savers** dari GitHub
4. Isi konfigurasi:

| Setting | Value |
|---|---|
| **Name** | `water-savers` |
| **Environment** | `Node.js` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | `Free` |

### 4B. Tambah Environment Variables

Klik **"Advanced"** lalu **"Add Environment Variable"**, tambahkan satu per satu:

| Key | Value | Keterangan |
|---|---|---|
| `DATABASE_URL` | `file:./db/custom.db` | Wajib ada (Prisma butuh ini) |
| `TURSO_DATABASE_URL` | `libsql://water-savers-USERNAME.turso.io` | Dari Langkah 3B |
| `TURSO_AUTH_TOKEN` | `token_kamu_tadi` | Dari Langkah 3C |
| `GROQ_API_KEY` | `gsk_xxxxxxxxxxxx` | Dari Langkah 1D |
| `NODE_ENV` | `production` | Wajib |

### 4C. Deploy!

1. Klik **"Create Web Service"**
2. Tunggu proses build (~3-5 menit)
3. Jika berhasil, Render akan memberi URL seperti:
   ```
   https://water-savers-xxxx.onrender.com
   ```
4. Buka URL tersebut — website Water Savers sudah live! 🎉

---

## LANGKAH 5: Verifikasi

Setelah deploy berhasil, cek:

- [ ] Website bisa dibuka
- [ ] Chat AquAI bisa digunakan (ketik "Halo")
- [ ] Web search bekerja (ketik "Berita banjir hari ini")
- [ ] Vision bekerja (upload gambar terkait air)

---

## ⚠️ CATATAN PENTING

### Render Free Tier
- **Setelah 15 menit tidak ada traffic**, server akan "sleep"
- **Kunjungan pertama** setelah sleep butuh ~30 detik untuk bangun
- Ini normal untuk free tier

### Groq Free Tier
- **14.400 request/hari** untuk llama-3.3-70b
- **Rate limit terpisah** per model (jadi 3 model = 3x kuota!)
- Jika habis, tunggu reset jam 00:00 UTC

### Turso Free Tier
- **500 database**
- **9 GB storage total**
- **25 juta row reads/bulan**
- **3 juta row writes/bulan**
- Lebih dari cukup untuk project ini

### Update Kode
Setiap kali kamu update kode:
1. `git add .`
2. `git commit -m "update"`
3. `git push`
4. Render akan **auto-deploy** secara otomatis!

---

## 🆘 TROUBLESHOOTING

| Masalah | Solusi |
|---|---|
| Build gagal | Cek log di Render Dashboard → Logs |
| Database error | Pastikan TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN benar |
| AquAI tidak jawab | Pastikan GROQ_API_KEY benar |
| Vision error 403 | Enable model di console.groq.com/settings/project/limits |
| Server sleep terus | Upgrade ke plan berbayar atau buat Uptime Robot (gratis) |

---

## 💡 TIPS AGAR SERVER TIDAK SLEEP (Opsional)

1. Buka https://uptimerobot.com
2. Daftar gratis
3. Buat monitor baru:
   - URL: `https://water-savers-xxxx.onrender.com`
   - Interval: 5 menit
4. Ini akan "ping" website setiap 5 menit agar tidak sleep
