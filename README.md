# Sistem Informasi SiLapor
### Pengaduan Layanan Masyarakat Terpadu

| | |
|---|---|
| **Nama** | Muhammad Arkhamullah R.A |
| **NIM** | 312410545 |
| **Kelas** | I241E |
| **Mata Kuliah** | Pemrograman Web 2 |
| **Tugas** | Ujian Akhir Semester (UAS) |

---

## Deskripsi Proyek

SiLapor adalah aplikasi berbasis web untuk pelaporan pengaduan layanan masyarakat. Warga dapat melaporkan permasalahan publik — infrastruktur rusak, keamanan lingkungan, kebersihan — melalui sistem digital yang transparan. Petugas dapat memantau, memproses, dan menindaklanjuti setiap laporan secara terstruktur.

Tema studi kasus: **Sistem Pelaporan Pengaduan Layanan Masyarakat (E-Report)** — mengelola data pelapor, kategori aduan (infrastruktur, keamanan, dll), isi laporan, gambar bukti, dan status penanganan aduan.

Aplikasi dibangun dengan **Decoupled Architecture** — backend API terpisah penuh dari frontend SPA.

| Lapisan | Teknologi |
|---------|-----------|
| **Backend API** | CodeIgniter 4 (RESTful Resource Controller) |
| **Frontend SPA** | Vue.js 3 + Vue Router 4 (CDN) |
| **UI Framework** | TailwindCSS (CDN, utility-first) |
| **Data Transfer** | Axios (HTTP asynchronous) |
| **Database** | MySQL / MariaDB |
| **Deploy Backend** | Railway |
| **Deploy Frontend** | Vercel |

> **Hak akses:** Pengunjung (tanpa login) hanya bisa lihat landing page. Administrator (wajib login) bisa akses dashboard, CRUD data, kelola laporan.

---

## Tautan Pendukung

| Link | URL |
|------|------|
| **🎥 Video Presentasi** | `[Isi link YouTube di sini setelah upload]` |
| **🌐 Demo Frontend (Vercel)** | [uas-web2-312410545-muhammad-arkhamu.vercel.app](https://uas-web2-312410545-muhammad-arkhamu.vercel.app/) |
| **⚙️ Demo Backend API (Railway)** | [uasweb2312410545muhammadarkhamullah-production-733d.up.railway.app](https://uasweb2312410545muhammadarkhamullah-production-733d.up.railway.app) |
| **📦 Repository GitHub** | [github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah](https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah) |

> Setelah upload video, ganti `[Isi link YouTube di sini setelah upload]` dengan URL YouTube.

### Akun Demo

| Field | Value |
|-------|-------|
| **Email** | `admin@silapor.com` |
| **Password** | `password` |

---

## Skema Relasi Tabel Database

![Skema Database](Screenshots/Database.png)
> Entity Relationship Diagram (ERD) dari database designer phpMyAdmin — memperlihatkan relasi antar tabel dan foreign key.

![Relasi Tabel](Screenshots/tabel%20relasi.png)
> Tampilan designer phpMyAdmin — hubungan foreign key antar 4 tabel: `pengguna`, `kategori`, `laporan`, `komentar`.

---

## Pengujian Keamanan API (Error 401)

![Error 401 Postman](Screenshots/postman.png)
> Endpoint yang dilindungi tanpa Bearer Token — ditolak dengan kode **401 Unauthorized** oleh AuthFilter.

![Error 401 Railway](https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah/blob/master/Screenshots/Screenshot%202026-06-24%20191050.png?raw=true)
> Pengujian pada endpoint production di Railway — proteksi token konsisten di semua lingkungan (lokal maupun production).

---

## Tampilan Aplikasi

### Halaman Login

![Login](Screenshots/Login%20admin.png)
> Form otentikasi administrator — desain dua kolom dengan TailwindCSS.

### Halaman Dashboard Admin

![Dashboard](Screenshots/Dashboard.png)
> Panel kontrol utama — statistik laporan (total, pending, diproses, selesai), jam real-time, tabel laporan terbaru.

### Form Modal Tambah Data

![Tambah Data](Screenshots/Create.png)
> Modal form tambah laporan baru — tanpa reload halaman (SPA).

### Form Modal Edit Data

![Edit Data](Screenshots/Update.png)
> Modal form edit laporan yang sudah ada.

### Tabel Manajemen Data (TailwindCSS)

![Tabel Data](Screenshots/Tabel%20manajemen%20data.png)
> Tabel dengan indikator warna status (pending=diproses=selesai=) dan pagination bertenaga TailwindCSS.

---

## Petunjuk Instalasi Lokal

### Syarat Sistem
- XAMPP (PHP 8.1+, MySQL/MariaDB, Apache)
- Browser modern

### 1. Clone / Letakkan File

Letakkan folder proyek di:
```
C:\xampp\htdocs\UAS_Web2_312410545_Muhammad_Arkhamullah\
```

### 2. Setup Database

1. Nyalakan **Apache** + **MySQL** lewat XAMPP Control Panel
2. Buka `http://localhost/phpmyadmin`
3. Buat database baru: **`silapor`** (collation `utf8_general_ci`)
4. Tab **Import** → pilih **`database_silapor.sql`** → **Go**
5. 4 tabel terbuat: `pengguna`, `kategori`, `laporan`, `komentar`

### 3. Jalankan Backend (API)

```bash
cd C:\xampp\htdocs\UAS_Web2_312410545_Muhammad_Arkhamullah\backend-api

# Copy env menjadi .env (jika belum ada)
cp env .env
```

Edit `.env` — sesuaikan database:
```env
app.baseURL = 'http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/'
database.default.hostname = localhost
database.default.database = silapor
database.default.username = root
database.default.password =
```

**Verifikasi:** Buka `http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/api/kategori` — harus muncul JSON daftar kategori.

> Folder `vendor/` sudah termasuk — tidak perlu `composer install` ulang.

### 4. Jalankan Frontend (SPA)

Akses di browser:
```
http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/
```

Frontend otomatis terhubung ke backend API yang berjalan di localhost.

**Kredensial login:** Email `admin@silapor.com` — Password `password`

---

### Struktur Folder

```
UAS_Web2_312410545_Muhammad_Arkhamullah/
├── backend-api/                    # CodeIgniter 4 REST API
│   ├── app/
│   │   ├── Config/
│   │   │   ├── Filters.php         # CORS global + aliases filter
│   │   │   └── Routes.php          # Routing API
│   │   ├── Controllers/
│   │   │   ├── Api/Auth.php        # Login & register
│   │   │   ├── Reports.php         # CRUD laporan (ResourceController)
│   │   │   ├── Categories.php      # CRUD kategori (ResourceController)
│   │   │   ├── Comments.php        # CRUD komentar
│   │   │   └── Dashboard.php       # Statistik ringkasan
│   │   └── Filters/
│   │       ├── AuthFilter.php      # Proteksi Bearer token
│   │       └── CorsFilter.php      # CORS handler
│   ├── Models/                      # ReportModel, CategoryModel, dll
│   └── public/                      # Entry point CI4 + uploads/
├── frontend-spa/                   # Vue.js 3 SPA
│   ├── index.html                  # Entry point (load semua komponen)
│   ├── app.js                      # Router, axios, navigation guards
│   └── components/
│       ├── Home.js                 # Landing page publik
│       ├── Login.js                # Form login
│       ├── Dashboard.js            # Dashboard admin + statistik
│       ├── Reports.js              # Tabel manajemen laporan
│       ├── ReportDetail.js         # Detail + komentar laporan
│       ├── CreateReport.js         # Form tambah laporan
│       ├── Categories.js           # Manajemen kategori
│       └── AdminLayout.js          # Layout sidebar + header
├── Screenshots/                    # Dokumentasi gambar
├── database_silapor.sql            # Backup database
└── README.md
```

---

*© 2026 SiLapor — UAS Pemrograman Web 2*
