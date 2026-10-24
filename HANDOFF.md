# Dokumen Handoff Proyek: STOK-IN BPS Kabupaten Sukoharjo

> **Tujuan Dokumen:** File ini adalah panduan konteks lengkap (*handoff document*) untuk AI Agent (**Antigravity / agy**) maupun developer saat melanjutkan pengerjaan proyek ini di perangkat (device) lain.
> **Instruksi untuk Agent (`agy`) di Device Baru:** Bacalah seluruh isi dokumen ini terlebih dahulu sebelum melakukan perubahan kode agar memahami arsitektur, aturan bisnis BPS Kabupaten Sukoharjo, kredensial akun, serta riwayat keputusan desain yang telah disepakati.

---

## 1. Identitas & Gambaran Umum Proyek
- **Nama Sistem:** **STOK-IN BPS** (*Sistem Tracking Operasional & Ketersediaan Inventaris BPS Kabupaten Sukoharjo*)
- **Instansi Pengguna:** Badan Pusat Statistik (BPS) Kabupaten Sukoharjo (Satker: `054010300019098000KD`, Kode UAKPB: `054.01.0300.019098`)
- **Konteks Proyek:** Proyek Kerja Praktik / Magang untuk digitalisasi pengelolaan persediaan barang Alat Tulis Kantor (ATK) internal di BPS Kabupaten Sukoharjo.
- **Prinsip Penting Penamaan:**
  - Sistem ini adalah **sistem lokal internal BPS Kabupaten Sukoharjo**.
  - **JANGAN** menggunakan istilah `"SAKTI"` atau `"Sinkron dengan SAKTI"` pada tampilan UI/label/cetakan (gunakan istilah **"Kode Barang"** meskipun nama kolom di skema database Prisma tetap `kodeSakti` agar tidak perlu migrasi skema).

---

## 2. Tech Stack & Spesifikasi Teknis
- **Framework Utama:** Next.js `16.4.2` (App Router, TypeScript, Turbopack) di dalam folder [`sim-atk/`](./sim-atk)
- **Styling:** Tailwind CSS v4 + `lucide-react` (ikon) + Font `Plus Jakarta Sans`
- **Database & ORM:**
  - **SQLite** lokal yang disimpan di [`sim-atk/prisma/dev.db`](./sim-atk/prisma/dev.db)
  - **Prisma ORM** versi **`6.4.0`** (`prisma@6.4.0` & `@prisma/client@6.4.0` — **JANGAN** di-upgrade ke Prisma v8 RC karena perubahan breaking CLI)
  - Konfigurasi koneksi berada di `sim-atk/.env` (`DATABASE_URL="file:./dev.db"`)
- **Library Pendukung:**
  - `html5-qrcode`: Pemindai barcode 1D/2D (EAN-13, Code-128, QR Code, dll.) menggunakan kamera ponsel/laptop.
  - `xlsx` (SheetJS): Ekspor laporan rekapitulasi persediaan ATK ke file `.xlsx`.

---

## 3. Struktur Direktori Utama

```text
web app managemen stok barang BPS sukoharjo/
├── HANDOFF.md                          # Dokumen handoff ini
├── jalankan_aplikasi.bat               # Script 1-klik untuk menjalankan aplikasi di Windows
├── generate_workflow_diagram.py        # Script Python pembuat diagram alur kerja 300 DPI
├── alur_kerja_sistem_sim_atk_bps.png   # Gambar diagram alur kerja STOK-IN BPS
├── desain_prototype_visual.html        # Prototipe visual HTML statis awal
├── Screendhoot error atau bug/         # Folder tempat user menaruh screenshot bug/revisi UI
├── referensi_bps/                      # Dokumen asli & referensi dari BPS Sukoharjo
│   ├── daftar_pertanyaan_kebutuhan_sistem_BPS.txt  # Hasil wawancara/kuesioner kebutuhan BPS
│   ├── FORMULIR PERMINTAAN BARANG ALAT TULIS KANTOR.docx # Template bon resmi BPS
│   ├── kartu kendali 2025_Contoh.xlsx
│   ├── Persediaan 03 Jan - Sep 26 (Fix).xlsx
│   └── seed_data_bps.json              # Data cadangan 233 item & 41 kategori asli BPS
└── sim-atk/                            # Aplikasi Utama Next.js
    ├── next.config.ts                  # Konfigurasi Next.js (cacheComponents, devIndicators: false)
    ├── public/
    │   ├── logo-bps.svg                # Logo resmi Badan Pusat Statistik (vektor tajam)
    │   └── logo-bps.png                # Logo resmi Badan Pusat Statistik (PNG)
    ├── prisma/
    │   ├── schema.prisma               # Skema database SQLite (User, Category, Item, StockIn, Request, RequestItem, Setting)
    │   ├── dev.db                      # File database SQLite lokal
    │   └── seed.js                     # Script seed akun user & instansi (katalog item sengaja dikosongkan)
    └── src/
        ├── lib/prisma.ts               # Prisma Client singleton
        ├── components/
        │   ├── BarcodeScannerModal.tsx # Modal kamera pemindai barcode + simulasi barcode + input manual
        │   └── OfficialRequestForm.tsx # Komponen cetak formulir bon resmi sesuai format Word BPS
        └── app/
            ├── layout.tsx              # Root layout (Plus Jakarta Sans, favicon logo BPS, suppressHydrationWarning)
            ├── page.tsx                # Halaman utama multi-peran (Staf & Admin TU)
            └── api/
                ├── auth/login/route.ts
                ├── auth/register/route.ts
                ├── users/route.ts
                ├── settings/route.ts
                ├── items/route.ts              # GET katalog & POST barang baru
                ├── items/[id]/route.ts         # PUT (Edit master barang) & DELETE (Hapus barang)
                ├── items/barcode/[code]/route.ts # Lookup barang via barcode / kode barang
                ├── stock-in/route.ts           # GET & POST pencatatan barang masuk (pengadaan)
                ├── requests/route.ts           # GET & POST pengajuan bon ATK oleh staf
                ├── requests/[id]/status/route.ts # POST ubah status bon: APPROVED, REJECTED, atau RETURNED (Retur)
                └── reports/export-excel/route.ts # GET ekspor rekapitulasi persediaan ke Excel (.xlsx)
```

---

## 4. Data Pejabat & Akun Login (Seeded di Database)

### Pejabat BPS Kabupaten Sukoharjo (`Setting`):
- **Kepala BPS (Kuasa Pengguna Barang):** `Anang Sarwoto, S.Si, MM` (NIP. `197505271997121001`)
- **Pengelola Persediaan / Admin TU:** `Novia Dwima Santi, S.Tr.Stat` (NIP. `199811062021042001`)
- **Alamat:** Jl. Jenderal Sudirman No. 199, Sukoharjo

### Akun Login yang Tersedia:
| Nama Pengguna | Email | Password | Role | Tim / Unit Kerja |
| :--- | :--- | :--- | :--- | :--- |
| **Novia Dwima Santi, S.Tr.Stat** | `admin@bps.go.id` | `admin123` | `ADMIN` | Subbagian Umum |
| **Nabil** | `nabil@gmail.com` | `staf123` | `STAFF` | Tim Statistik Sosial |
| **Budi Hartono** | `budi@gmail.com` | `staf123` | `STAFF` | Tim Statistik Produksi |
| **Anang Sarwoto, S.Si, MM** | `kepala@bps.go.id` | `admin123` | `KASUBAG` | Subbagian Umum |

---

## 5. Aturan Bisnis & Fitur yang Sudah Diimplementasikan

1. **Pencatatan Satuan Terkecil (Sesuai Kuesioner BPS No. 8):**
   - Barang dicatat langsung menggunakan satuan terkecil yang dibagikan ke staf (misal: datang 1 pak pulpen isi 12 biji $\rightarrow$ dicatat jumlah `12` dengan satuan `Buah` / `Pcs`), sehingga staf dapat meminta per biji maupun 1 pak penuh tanpa masalah pecahan stok.
2. **Pemisahan Hak Akses & UI antara `STAFF` dan `ADMIN`:**
   - **Kartu Info User & Logout** terletak di bagian paling atas *sidebar* kiri (bar *"Beralih Peran"* di header atas sudah dihapus).
   - **Logo Resmi BPS** (`/logo-bps.svg`) digunakan di Header, Halaman Login, Header Mobile, dan Favicon.
   - **Warna Ikon Sidebar Admin** dibuat seragam (`text-slate-400` dan putih saat *hover*/aktif).
   - **Fungsi Scan Barcode Kamera (`BarcodeScannerModal`):**
     - Di halaman utama (Header Desktop, Pencarian Mobile, dan Bottom Nav Mobile), tombol **Scan** **hanya muncul untuk Staf (`STAFF`)** saat memilih barang untuk permohonan.
     - Untuk **Admin (`ADMIN`)**, tombol **Scan** hanya berada di dalam modal **Input Barang Masuk & Katalog ATK** (pada tab *Tambah Stok Lama* untuk memilih barang via scan kemasan, pada tab *Barang ATK Baru* untuk mengisi kolom barcode otomatis, serta pada modal *Edit Data Master Barang*).
3. **Akses CRUD Master Barang & Mekanisme Retur Berjejak (Admin TU):**
   - **CRUD Master Barang (`PUT` & `DELETE /api/items/[id]`):** Di tab *Katalog ATK*, Admin memiliki tombol **[Edit]** dan **[Hapus]** pada setiap kartu barang untuk mengubah Nama Barang, Kode Barang, Barcode, Kategori, Satuan, dan koreksi Stok Saat Ini.
   - **Retur / Kembalikan Stok (`POST /api/requests/[id]/status` dengan `status: 'RETURNED'`):** Jika staf mengembalikan barang dari bon yang sudah terlanjur `APPROVED`, Admin cukup menekan tombol **[↩️ Retur / Kembalikan Stok]** pada kartu bon tersebut dan mengisi alasan pengembalian. Sistem otomatis mengembalikan jumlah stok ke gudang (*atomic rollback*) dan mengubah status bon menjadi **`↩️ Dikembalikan (Retur)`** lengkap dengan catatan audit TU.
4. **Katalog Awal Dikosongkan:**
   - Sesuai permintaan user, seluruh item dummy di `dev.db` telah dikosongkan (`0 item`) agar user dapat mengisi barang dari awal melalui menu **Input Barang Masuk $\rightarrow$ Barang ATK Baru**. (Jika sewaktu-waktu butuh data asli 233 barang BPS, datanya tersimpan aman di `referensi_bps/seed_data_bps.json`).

---

## 6. Cara Menjalankan di Device Baru

### Langkah 1: Persiapan & Instalasi (Jika `node_modules` belum ada atau berbeda OS)
Buka terminal di dalam folder `sim-atk/`:
```powershell
cd sim-atk
npm.cmd install
npx.cmd prisma generate
```
*(Catatan Windows PowerShell: Jika PowerShell memblokir eksekusi `npm.ps1`, gunakan `npm.cmd` dan `npx.cmd`).*

### Langkah 2: Menjalankan Server Development
```powershell
cd sim-atk
npm.cmd run dev
```
Atau klik 2x file [`jalankan_aplikasi.bat`](./jalankan_aplikasi.bat) dari folder utama. Aplikasi berjalan di `http://localhost:3000`.

### Langkah 3: Mengakses dari Ponsel (Satu Jaringan Wi-Fi)
1. Cek IPv4 laptop baru dengan perintah `ipconfig` di terminal (contoh: `192.168.1.xx`).
2. Tambahkan IP tersebut ke daftar `allowedDevOrigins` di [`sim-atk/next.config.ts`](./sim-atk/next.config.ts).
3. Agar kamera ponsel diizinkan menyala saat mengakses via `http://<IP-LAPTOP>:3000`, buka `chrome://flags/#unsafely-treat-insecure-origin-as-secure` di Chrome Android, masukkan `http://<IP-LAPTOP>:3000`, ubah menjadi **Enabled**, lalu klik **Relaunch**.

---

## 7. Catatan Teknis Penting (Technical Gotchas) untuk Agent `agy`
- **Next.js 16 `cacheComponents: true`:** Di `sim-atk/next.config.ts`, fitur `cacheComponents: true` aktif. **JANGAN** menambahkan `export const dynamic = 'force-dynamic'` pada file API Route (`route.ts`) karena akan menyebabkan build error di Next.js 16. Gunakan `NextRequest` untuk membaca `req.nextUrl.searchParams`.
- **Hydration Warning Browser Extension:** Pada `sim-atk/src/app/layout.tsx`, atribut `suppressHydrationWarning` dipasang pada `<html>` dan `<body>` untuk mencegah error akibat ekstensi browser seperti QuillBot. Jangan dihapus.
- **Folder Screenshot Bug:** Jika user menyebutkan *"cek folder error/bug"*, periksa gambar terbaru di dalam folder [`Screendhoot error atau bug/`](./Screendhoot%20error%20atau%20bug).
