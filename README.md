<!-- cspell:disable -->
# 🚀 Maganghub Application Tracker

Website **Maganghub Application Tracker** modern, minimalis, dan responsive berbasis **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **TanStack Table**, **React Hook Form**, dan **Zod**. Aplikasi ini terhubung langsung ke **Google Spreadsheet** sebagai database utama secara 100% GRATIS melalui **Google Apps Script REST API**.

---

## 📌 Feature Highlights

- ⚡ **Next.js 15 App Router + React 19** untuk performa maksimal & SEO ready.
- 🎨 **Minimalist & Modern Notion/Airtable UI**: Serba putih, clean border, responsive untuk Desktop, Tablet, dan Mobile.
- 📊 **Statistik Real-time**: Total Posisi, Total Perusahaan, Rata-rata Peluang (%), dan counter status.
- 🗂 **TanStack Table**:
  - Auto-Numbering kolom `No` dengan sorting real-time `▲` / `▼`.
  - Sorting Real-time pada kolom **Peluang (%)** (Toggle Ascending `▲` / Descending `▼`).
  - Search Serbaguna (Cari berdasarkan Nama Perusahaan, Posisi, Alamat, Status).
  - Filter Status (Semua, Lamaran Telah Dikirim, Dalam Tahap Shortlist, Lamaran Ditolak, Status Belum Ditentukan).
  - Pagination (10, 25, 50, 100 data per halaman).
- 🧮 **Perhitungan Peluang Lolos Otomatis**:
  $$\text{Peluang} = \frac{\text{Kuota}}{\text{Pelamar}} \times 100\%$$
  *(Jika Pelamar = 0, maka Peluang otomatis 100%)*.
- 🏷 **Color-coded Badges**:
  - Status: Lamaran Telah Dikirim (Biru), Dalam Tahap Shortlist (Amber), Lamaran Ditolak (Merah), Status Belum Ditentukan (Abu-abu).
  - Peluang: $\ge 70\%$ (Hijau), $40\%-69\%$ (Kuning), $< 40\%$ (Merah).
- ✏ **CRUD Lengkap**: Detail (Modal), Edit (Modal), dan Delete (Alert Confirmation) langsung tersinkronisasi ke Google Spreadsheet.
- 💰 **100% Gratis & Zero Maintenance**: Tanpa Firebase, Supabase, PlanetScale, atau MongoDB Atlas.

---

## 🗄 Database Google Spreadsheet

Data tersimpan di Google Spreadsheet berikut:
[Link Spreadsheet Database](https://docs.google.com/spreadsheets/d/1ppIpyuAzy92EOmSBFtFboE8HPwBmNuDKW5ERRfxRUmU/edit)

**Struktur Kolom Spreadsheet**:
1. `No`
2. `Nama Perusahaan`
3. `Posisi`
4. `Kuota`
5. `Pelamar`
6. `Peluang (%)`
7. `Alamat`
8. `Status`

---

## 🛠 Panduan Membuat & Setup Google Apps Script

Untuk mengizinkan aplikasi Next.js membaca & menulis ke Google Spreadsheet, ikuti langkah berikut:

### 1. Buka Apps Script
1. Buka [Google Spreadsheet Anda](https://docs.google.com/spreadsheets/d/1ppIpyuAzy92EOmSBFtFboE8HPwBmNuDKW5ERRfxRUmU/edit).
2. Klik menu **Ekstensi (Extensions)** -> **Apps Script**.

### 2. Copy Code Apps Script
Hapus seluruh isi file `Code.gs` bawaan, lalu paste seluruh kode dari file [`google-apps-script.js`](./google-apps-script.js).

### 3. Deploy Web App
1. Klik tombol **Deploy** -> **Deployment baru (New deployment)**.
2. Pilih Jenis: **Aplikasi web (Web app)**.
3. Deskripsi: `Maganghub Tracker API`.
4. Jalankan sebagai (Execute as): **Saya (Me)**.
5. Yang memiliki akses (Who has access): **Siapa saja (Anyone)**. *(Sangat Penting!)*
6. Klik **Deploy** dan izinkan akses (Authorize Access).
7. Copy **URL Web App** yang berakhiran `/exec`.

---

## 💻 Jalankan di Lokal (Development)

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/MAGANGHUB-TRACKER.git
cd MAGANGHUB-TRACKER
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Buat file `.env.local` di root proyek:
```env
NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/AKfycbx_YOUR_SCRIPT_ID/exec
```

### 4. Jalankan Server Dev
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🌐 Deploy Otomatis ke Vercel

1. Push seluruh kode ke repository GitHub Anda.
2. Buka dashboard [Vercel](https://vercel.com).
3. Klik **Add New** -> **Project**, lalu impor repository GitHub Anda.
4. Pada bagian **Environment Variables**, tambahkan:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: URL Google Apps Script Web App Anda (`https://script.google.com/macros/s/.../exec`)
5. Klik **Deploy**. Selesai! Aplikasi Anda sudah *live* dan terhubung langsung ke Google Sheets.
