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

## 📋 Daftar Isi

- [Deskripsi Proyek](#deskripsi-proyek)
- [Tautan Pendukung](#tautan-pendukung)
- [Akun Demo](#akun-demo)
- [Struktur Database](#struktur-database)
- [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
- [Halaman Landing Page](#halaman-landing-page-pengunjung)
- [Pengujian Keamanan API](#pengujian-keamanan-api)
- [Implementasi Axios Interceptors](#implementasi-axios-interceptors-otomatisasi-token)
- [Tampilan Aplikasi](#tampilan-aplikasi)
- [Cara Menjalankan Project](#cara-menjalankan-project-panduan-lokal)

---

## Deskripsi Proyek

SiLapor merupakan platform pengaduan masyarakat berbasis web yang dirancang untuk menjembatani komunikasi antara masyarakat dan penyedia layanan publik. Sistem ini dikembangkan menggunakan pendekatan **decoupled architecture** — memisahkan logika backend dan antarmuka frontend secara penuh.

| Lapisan | Teknologi |
|---------|-----------|
| **Backend API** | CodeIgniter 4 (REST API Server) |
| **Frontend SPA** | Vue.js 3 + Vue Router (CDN) |
| **UI Framework** | TailwindCSS (CDN) |
| **Data Transfer** | Axios (HTTP Async) |
| **Database** | MySQL / MariaDB |

Pendekatan ini menghasilkan aplikasi yang responsif tanpa memerlukan proses pemuatan ulang halaman secara keseluruhan saat navigasi antar-menu.

---

## Tautan Pendukung

| Link | URL |
|------|-----|
| **🎥 Video Presentasi** | `[Isi link YouTube di sini setelah upload]` |
| **🌐 Demo Frontend** | [https://uas-web2-312410545-muhammad-arkhamu.vercel.app/](https://uas-web2-312410545-muhammad-arkhamu.vercel.app/) |
| **⚙️ Demo Backend API** | [https://uasweb2312410545muhammadarkhamullah-production-733d.up.railway.app](https://uasweb2312410545muhammadarkhamullah-production-733d.up.railway.app) |
| **📦 Repository GitHub** | [github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah](https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah) |

> **Template Link YouTube:** Setelah video diupload, ganti `[Isi link YouTube di sini setelah upload]` dengan URL video, contoh: `https://youtu.be/xxxxxxxxxxx`

---

## Akun Demo

Kredensial berikut dapat digunakan untuk mengakses panel administrator:

| Field | Value |
|-------|-------|
| **Email** | `admin@silapor.com` |
| **Password** | `password` |

---

## Struktur Database (Kamus Data)

Sistem basis data terdiri dari **empat tabel utama** yang saling berelasi:

### Tabel `pengguna`
Menyimpan kredensial otentikasi dan informasi profil untuk administrator maupun pelapor.

| Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | INT | Primary Key |
| `name` | VARCHAR(100) | Nama lengkap pengguna |
| `email` | VARCHAR(100) | Email unik sebagai identitas login |
| `password` | VARCHAR(255) | Kata sandi terenkripsi (hash) |
| `role` | ENUM | Hak akses: `admin` atau `pelapor` |
| `token` | VARCHAR(255) | Token sesi autentikasi API |
| `created_at` | TIMESTAMP | Waktu pendaftaran akun |

### Tabel `kategori`
Menyimpan klasifikasi laporan untuk pengelompokan data pengaduan.

| Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | INT | Primary Key |
| `name` | VARCHAR(100) | Nama kategori |
| `description` | VARCHAR(255) | Deskripsi kategori |
| `created_at` | TIMESTAMP | Waktu pembuatan |

### Tabel `laporan`
Entitas utama yang menyimpan seluruh data pengaduan masyarakat.

| Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | INT | Primary Key |
| `user_id` | INT | Foreign Key → `pengguna(id)` |
| `category_id` | INT | Foreign Key → `kategori(id)` |
| `title` | VARCHAR(200) | Judul laporan |
| `description` | TEXT | Rincian kronologi laporan |
| `image` | VARCHAR(255) | Path foto bukti |
| `location` | VARCHAR(255) | Lokasi kejadian |
| `status` | ENUM | Status: `pending`, `diproses`, `selesai` |
| `created_at` | TIMESTAMP | Waktu laporan masuk |
| `updated_at` | TIMESTAMP | Waktu modifikasi terakhir |

### Tabel `komentar`
Menyimpan tanggapan atau pembaruan status dari administrator.

| Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | INT | Primary Key |
| `report_id` | INT | Foreign Key → `laporan(id)` |
| `admin_id` | INT | Foreign Key → `pengguna(id)` |
| `body` | TEXT | Isi tanggapan |
| `created_at` | TIMESTAMP | Waktu pengiriman |

---

## Entity Relationship Diagram (ERD)

![Skema Database](Screenshots/Database.png)

> Skema ERD menunjukkan penerapan Foreign Key pada tabel terkait. Implementasi ini memastikan integritas referensial untuk mencegah anomali data.

![Relasi Tabel](Screenshots/tabel%20relasi.png)

> Tampilan relasi antar tabel dari database designer phpMyAdmin. Memperlihatkan hubungan foreign key antara `pengguna`, `kategori`, `laporan`, dan `komentar`.

---

## Halaman Landing Page (Pengunjung)

![Landing Page](Screenshots/landingpage%20pengunjung.png)

> Halaman beranda yang dapat diakses publik tanpa login. Menampilkan informasi umum aplikasi. Sesuai ketentuan hak akses: pengunjung hanya bisa mengakses halaman ini.

---

## Pengujian Keamanan API

![Error 401 Postman](Screenshots/postman.png)

> Endpoint yang dilindungi tanpa Bearer Token akan ditolak dengan kode **401 Unauthorized**.

![Error 401 Railway](https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah/blob/master/Screenshots/Screenshot%202026-06-24%20191050.png?raw=true)

> Pengujian pada endpoint production di Railway. Proteksi token berjalan konsisten di lingkungan deployment.

---

## Implementasi Axios Interceptors (Otomatisasi Token)

Sistem mengotomatisasi penyisipan token dan penanganan kesalahan secara global melalui Axios Interceptors:

```javascript
// Request Interceptor: Suntik Bearer token otomatis
window.api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Response Interceptor: Tangani 401 Unauthorized global
window.api.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && error.response.status === 401) {
        if (window.location.pathname !== '/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/login') {
            alert('Sesi Anda telah habis. Silakan login kembali.');
            localStorage.clear();
            window.location.href = '/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/login';
        }
    }
    return Promise.reject(error);
});
```

**Fungsi:**
1. **Request Interceptor** — Mengekstrak token dari `localStorage` dan menyematkannya ke setiap header request
2. **Response Interceptor** — Menangkap error 401 global, membersihkan sesi, dan mengarahkan ke halaman login

---

## Tampilan Aplikasi

### Halaman Login

![Login](Screenshots/Login%20admin.png)
> Antarmuka otentikasi administrator dengan desain minimalis dua kolom.

### Dashboard Admin

![Dashboard](Screenshots/Dashboard.png)
> Panel kontrol utama dengan ringkasan statistik laporan (total, pending, diproses, selesai) dan tabel data terbaru.

### Form Tambah dan Edit Data

![Tambah Data](Screenshots/Create.png)

![Edit Data](Screenshots/Update.png)
> Form modal interaktif tanpa perpindahan halaman — mengoptimalkan efisiensi kerja dalam lingkungan SPA.

### Tabel Manajemen Data

![Tabel Data](Screenshots/Tabel%20manajemen%20data.png)
> Tabel dengan indikator warna status dinamis, pagination, dan desain TailwindCSS.

---

## Cara Menjalankan Project (Panduan Lokal)

### 1. Konfigurasi Database

1. Buka phpMyAdmin melalui browser
2. Buat database baru dengan nama **`silapor`**
3. Import file `database_silapor.sql` dari direktori utama proyek

### 2. Menjalankan Backend (API)

```bash
cd backend-api
```

Sesuaikan konfigurasi di file `.env`:

```env
database.default.hostname = localhost
database.default.database = silapor
database.default.username = root
database.default.password =
```

Backend API aktif di:
```
http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/
```

### 3. Menjalankan Frontend (SPA)

Akses melalui browser:
```
http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/
```

---

### 📝 Template Link YouTube (Copy-paste ke baris Video Presentasi setelah upload)

```markdown
| **🎥 Video Presentasi** | [https://youtu.be/xxx_isi_link_disini](https://youtu.be/xxx_isi_link_disini) |
```

---
*© 2026 SiLapor — UAS Pemrograman Web 2*
