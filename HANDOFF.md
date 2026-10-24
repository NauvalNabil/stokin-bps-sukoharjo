# Dokumen Handoff Proyek: STOK-IN BPS Kabupaten Sukoharjo

> **Tujuan Dokumen:** File ini adalah panduan konteks lengkap (*handoff document*) untuk AI Agent (**Antigravity / agy**) maupun developer saat melanjutkan pengerjaan proyek ini di perangkat (device) lain.
> **Instruksi untuk Agent (`agy`) di Device Baru:** Bacalah seluruh isi dokumen ini terlebih dahulu sebelum melakukan perubahan kode agar memahami arsitektur, aturan bisnis BPS Kabupaten Sukoharjo, kredensial akun, riwayat pembaruan sistem, serta keputusan desain yang telah disepakati.

---

## 1. Identitas & Gambaran Umum Proyek
- **Nama Sistem:** **STOK-IN BPS** (*Sistem Tracking Operasional & Ketersediaan Inventaris BPS Kabupaten Sukoharjo*)
- **Instansi Pengguna:** Badan Pusat Statistik (BPS) Kabupaten Sukoharjo (Satker: `054010300019098000KD`, Kode UAKPB: `054.01.0300.019098`)
- **Konteks Proyek:** Proyek Kerja Praktik / Magang untuk digitalisasi pengelolaan persediaan barang Alat Tulis Kantor (ATK) internal di BPS Kabupaten Sukoharjo.
- **Prinsip Penting Penamaan:**
  - Sistem ini adalah **sistem lokal internal BPS Kabupaten Sukoharjo**.
  - **JANGAN** menggunakan istilah `"SAKTI"` atau `"Sinkron dengan SAKTI"` pada tampilan UI/label/cetakan (gunakan istilah **"Kode Barang"** meskipun nama kolom di skema database Prisma tetap `kodeSakti` agar tidak perlu migrasi skema).
- **Repositori GitHub Resmi:**
  - **URL:** [https://github.com/NauvalNabil/stokin-bps-sukoharjo](https://github.com/NauvalNabil/stokin-bps-sukoharjo)
  - **Branch:** `main`
  - **Visibilitas:** `Private`

---

## 2. Tech Stack & Spesifikasi Teknis
- **Framework Utama:** Next.js `16.4.2` (App Router, TypeScript, Turbopack) di dalam folder [`sim-atk/`](./sim-atk)
- **Styling:** Tailwind CSS v4 + `lucide-react` (ikon) + Font `Plus Jakarta Sans`
- **Database & ORM:**
  - **SQLite** lokal yang disimpan di [`sim-atk/prisma/dev.db`](./sim-atk/prisma/dev.db)
  - **Prisma ORM** versi **`6.4.0`** (`prisma@6.4.0` & `@prisma/client@6.4.0` — **JANGAN** di-upgrade ke Prisma v8 RC karena perubahan breaking CLI)
  - Konfigurasi koneksi berada di `sim-atk/.env` (`DATABASE_URL="file:./dev.db"`)
- **Package Manager:** **`pnpm`** (Gunakan selalu `pnpm` sesuai aturan proyek).
- **Library Pendukung:**
  - `html5-qrcode`: Pemindai barcode 1D/2D (EAN-13, Code-128, QR Code, dll.) menggunakan kamera ponsel/laptop.
  - `xlsx` (SheetJS): Ekspor laporan rekapitulasi persediaan ATK ke file `.xlsx`.

---

## 3. Struktur Direktori Utama

```text
web app managemen stok barang BPS sukoharjo/
├── HANDOFF.md                          # Dokumen handoff utama
├── contoh format harian.jpeg           # Sampel foto formulir rekap harian asli dari instansi
├── jalankan_aplikasi.bat               # Script 1-klik untuk menjalankan aplikasi di Windows
├── generate_workflow_diagram.py        # Script Python pembuat diagram alur kerja 300 DPI
├── alur_kerja_sistem_sim_atk_bps.png   # Gambar diagram alur kerja STOK-IN BPS
├── desain_prototype_visual.html        # Prototipe visual HTML statis awal
├── Screendhoot error atau bug/         # Folder tempat user menaruh screenshot bug/revisi UI
├── referensi_bps/                      # Dokumen asli & referensi dari BPS Sukoharjo
│   ├── daftar_pertanyaan_kebutuhan_sistem_BPS.txt  # Hasil wawancara kebutuhan BPS
│   ├── FORMULIR PERMINTAAN BARANG ALAT TULIS KANTOR.docx # Template bon resmi Word BPS
│   ├── kartu kendali 2025_Contoh.xlsx
│   ├── Persediaan 03 Jan - Sep 26 (Fix).xlsx
│   └── seed_data_bps.json              # Data cadangan 233 item & 41 kategori asli BPS
└── sim-atk/                            # Root Repositori GitHub & Aplikasi Next.js
    ├── HANDOFF.md                      # Salinan dokumen handoff di dalam repo
    ├── next.config.ts                  # Konfigurasi Next.js (cacheComponents, allowedDevOrigins)
    ├── package.json
    ├── pnpm-lock.yaml
    ├── public/
    │   ├── logo-bps.svg                # Logo resmi Badan Pusat Statistik (vektor tajam)
    │   └── logo-bps.png                # Logo resmi Badan Pusat Statistik (PNG)
    ├── prisma/
    │   ├── schema.prisma               # Skema database SQLite (User, Category, Item, StockIn, Request, RequestItem, Setting)
    │   ├── dev.db                      # File database SQLite lokal
    │   └── seed.js                     # Script seed akun user & instansi (katalog item awal dikosongkan)
    └── src/
        ├── lib/prisma.ts               # Prisma Client singleton
        ├── components/
        │   ├── BarcodeScannerModal.tsx # Modal kamera pemindai barcode + simulasi barcode + input manual
        │   ├── OfficialRequestForm.tsx # Komponen cetak formulir per bon staf sesuai format Word BPS
        │   └── DailyRecapForm.tsx      # Komponen cetak formulir rekapitulasi harian (gabungan bon per tanggal)
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

## 4. Data Pejabat & Akun Login (Tersimpan di Database)

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

## 5. Fitur Utama & Aturan Bisnis yang Diimplementasikan

1. **Pencatatan Satuan Terkecil:**
   - Barang dicatat langsung menggunakan satuan terkecil yang dibagikan ke staf (misal: 1 pak pulpen isi 12 $\rightarrow$ dicatat `12 Buah/Pcs`), sehingga staf dapat meminta per biji tanpa masalah pecahan stok.
2. **Pemisahan Hak Akses & UI antara `STAFF` dan `ADMIN`:**
   - **Kartu User & Logout:** Berada di bagian atas *sidebar* kiri.
   - **Tombol Scan Barcode:**
     - Pada **Staf (`STAFF`)**: Muncul di Header Desktop, Pencarian Mobile, dan Bottom Nav untuk memilih barang ke keranjang permintaan.
     - Pada **Admin (`ADMIN`)**: Hanya muncul di dalam modal *Input Barang Masuk* dan modal *Edit Data Master Barang*.
3. **Akses CRUD Master Barang & Fitur Retur Berjejak (Admin TU):**
   - **Edit & Hapus Barang (`PUT` & `DELETE /api/items/[id]`):** Admin dapat mengubah nama, kode barang, barcode, kategori, satuan, dan koreksi stok saat ini.
   - **Retur / Rollback Stok (`POST /api/requests/[id]/status` dengan `status: 'RETURNED'`):** Mengembalikan stok ke gudang secara atomik jika bon yang sudah `APPROVED` dikembalikan oleh staf, lengkap dengan catatan audit TU.
4. **Fitur Baru: Cetak Rekap Harian (`DailyRecapForm.tsx`):**
   - **Sesuai Dokumen:** Mereplikasi format asli pada `contoh format harian.jpeg`.
   - **Logika Pengelompokan:** Mengumpulkan seluruh item dari semua permohonan yang berstatus **`APPROVED`** pada tanggal tertentu dalam satu tabel berurutan (`1, 2, 3, ...`), meskipun berasal dari pemohon yang berbeda.
   - **Kolom Tabel:** Kolom *`Disetujui`* dan *`Keterangan`* sengaja dikosongkan untuk diisi manual setelah dicetak.
   - **Blok Tanda Tangan Tunggal:**
     - Kiri: *Administrator Gudang* (`Novia Dwima Santi, S.Tr.Stat` / NIP dari `Setting`).
     - Kanan: *Penanggung Jawab* bertanggal otomatis (`Sukoharjo, <Tanggal Rekap>`) dengan garis titik-titik kosong untuk ditandatangani manual.
   - **Akses UI:** Tersedia tombol cetak di Sidebar Admin, tab *Persetujuan Permintaan*, dan tab *Semua Riwayat Bon*.
5. **Cetak Formulir Bon Perorangan (`OfficialRequestForm.tsx`):**
   - Mencetak bon resmi per nomor formulir pengajuan staf sesuai format `FORMULIR PERMINTAAN BARANG ALAT TULIS KANTOR.docx`.
6. **Buku & Riwayat Penerimaan Barang Masuk (`StockInReportForm.tsx` & Export Excel):**
   - **Tampilan Khusus Admin TU:** Tab interaktif *"Riwayat Barang Masuk"* (`activeTab === 'barang_masuk'`) untuk memantau seluruh arus fisik barang masuk ke gudang BPS Sukoharjo.
   - **Tiga Variabel Pengadaan Ditampilkan Penuh:**
     - *Sumber Pengadaan*: APBN DIPA Sukoharjo, Transfer Masuk BPS Provinsi, atau Hibah/Lainnya (dilengkapi badge warna).
     - *Nomor Nota / BAST*: Nomor registrasi dokumen fisik kuitansi / BAST / surat jalan (format font mono).
     - *Keterangan*: Catatan alokasi/kegiatan pengadaan barang.
     - *Dicatat Oleh*: Nama Admin TU pencatat transaksi.
   - **Cetak Laporan Resmi Masuk (`StockInReportForm.tsx`):** Dokumen cetak siap PDF/printer bertajuk *"DAFTAR / BUKU PENERIMAAN BARANG PERSEDIAAN (ATK)"* ber-kop Satker BPS Sukoharjo (`054010300019098000KD`), rekap total kuantitas unit, dan tanda tangan resmi PPK/Kasubbag Umum serta Pengelola Persediaan TU.
   - **Ekspor Excel (.xlsx):** Endpoint `GET /api/reports/export-excel?type=stock-in` menghasilkan file `.xlsx` untuk audit BMN / Inspektorat.
   - **Pencatatan Otomatis Saldo Awal:** Setiap penambahan barang baru dengan `stokAwal > 0` otomatis tercatat sebagai transaksi pengadaan pertama di tabel riwayat barang masuk.

---

## 6. Cara Menjalankan di Device Baru

### Langkah 1: Kloning Repositori (Jika Menggunakan Komputer Baru)
```powershell
git clone https://github.com/NauvalNabil/stokin-bps-sukoharjo.git sim-atk
cd sim-atk
```

### Langkah 2: Instalasi Dependensi & Generate Prisma
Gunakan `pnpm`:
```powershell
pnpm install
pnpm exec prisma generate
```

### Langkah 3: Menjalankan Server Development
```powershell
pnpm exec next dev
```
Atau jika menggunakan `jalankan_aplikasi.bat` dari folder root. Server berjalan di `http://localhost:3000`.

### Langkah 4: Mengakses dari Smartphone (Wi-Fi Lokal yang Sama)
1. Cek alamat IPv4 komputer di terminal (`ipconfig`), misal: `192.168.29.177`.
2. Pastikan IP tersebut terdaftar pada `allowedDevOrigins` di [`sim-atk/next.config.ts`](./sim-atk/next.config.ts).
3. Buka browser HP: `http://<IP-KOMPUTER>:3000`.
4. **Aturan Kamera Smartphone di Jaringan Lokal (HTTP):**
   - **Android (Chrome):** Kamera bisa diaktifkan dengan mengizinkan insecure origin di `chrome://flags/#unsafely-treat-insecure-origin-as-secure` $\rightarrow$ masukkan `http://<IP-KOMPUTER>:3000` $\rightarrow$ set *Enabled* $\rightarrow$ *Relaunch*.
   - **iPhone (iOS Safari / Chrome):** Apple memblokir API *live streaming camera* pada semua browser iOS jika menggunakan HTTP lokal biasa (kebijakan *Secure Context*). Alternatif saat pengujian di iPhone: gunakan fitur **Simulasi Cepat (1-klik kode contoh)** atau **Ketik Manual Barcode** yang sudah disediakan di dalam modal pemindai.
   - **Saat Production / Hosting:** Kendala ini **otomatis hilang** karena web hosting publik wajib menggunakan **HTTPS**, sehingga kamera live stream langsung aktif di iPhone maupun Android.

---

## 7. Catatan Teknis Penting (Gotchas untuk Agent `agy`)
- **Package Manager Wajib `pnpm`:** Selalu gunakan `pnpm` untuk menambah paket atau menjalankan skrip.
- **Next.js 16 `cacheComponents: true`:** Fitur ini aktif di `sim-atk/next.config.ts`. **JANGAN** menambahkan `export const dynamic = 'force-dynamic'` pada API Route (`route.ts`) karena menyebabkan build error di Next.js 16. Gunakan `NextRequest` untuk membaca `req.nextUrl.searchParams`.
- **Atribut Hydration Warning:** Pada `sim-atk/src/app/layout.tsx`, atribut `suppressHydrationWarning` sengaja dipasang pada `<html>` dan `<body>` agar ekstensi browser pengguna (seperti Grammarly / QuillBot) tidak memicu runtime hydration error. Jangan dihapus.
- **Database SQLite:** File database terletak di `sim-atk/prisma/dev.db`. Jangan menghapus file ini agar data master dan transaksi yang telah dibuat tidak hilang.
