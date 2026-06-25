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
- [Pengujian Keamanan API](#pengujian-keamanan-api)
- [Implementasi Axios Interceptors](#implementasi-axios-interceptors)
- [Tampilan Aplikasi](#tampilan-aplikasi)
- [Cara Menjalankan Project](#cara-menjalankan-project)

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

---

## Tautan Pendukung

| Link | URL |
|------|------|
| **🎥 Video Presentasi** | `[Isi link YouTube di sini setelah upload]` |
| **🌐 Demo Frontend** | [https://uas-web2-312410545-muhammad-arkhamu.vercel.app/](https://uas-web2-312410545-muhammad-arkhamu.vercel.app/) |
| **⚙️ Demo Backend API** | [https://uasweb2312410545muhammadarkhamullah-production-733d.up.railway.app](https://uasweb2312410545muhammadarkhamullah-production-733d.up.railway.app) |
| **📦 Repository GitHub** | [github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah](https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah) |

> **Template:** Setelah video diupload, ganti `[Isi link YouTube di sini setelah upload]` dengan URL, contoh: `https://youtu.be/xxxxxxxxxxx`

---

## Akun Demo

| Field | Value |
|-------|-------|
| **Email** | `admin@silapor.com` |
| **Password** | `password` |

---

## Struktur Database

Sistem basis data terdiri dari **empat tabel** yang saling berelasi: `pengguna`, `kategori`, `laporan`, dan `komentar`.

![Skema Database](Screenshots/Database.png)
> Entity Relationship Diagram (ERD) — memperlihatkan relasi antar tabel dan foreign key.

![Relasi Tabel](Screenshots/tabel%20relasi.png)
> Tampilan dari database designer phpMyAdmin — hubungan foreign key antar seluruh tabel.

---

## Pengujian Keamanan API

![Error 401 Postman](Screenshots/postman.png)
> Endpoint yang dilindungi tanpa Bearer Token akan ditolak dengan kode **401 Unauthorized**.

![Error 401 Railway](https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah/blob/master/Screenshots/Screenshot%202026-06-24%20191050.png?raw=true)
> Pengujian pada endpoint production di Railway — proteksi token konsisten di semua lingkungan.

---

## Implementasi Axios Interceptors

Sistem mengotomatisasi penyisipan token dan penanganan error secara global:

```javascript
// Request Interceptor: Suntik Bearer token otomatis
window.api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

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
1. **Request Interceptor** — Ekstrak token dari `localStorage`, sematkan ke setiap header
2. **Response Interceptor** — Tangkap error 401 global, hapus sesi, redirect ke login

---

## Tampilan Aplikasi

### Halaman Landing Page (Pengunjung)

![Landing Page](Screenshots/landingpage%20pengunjung.png)
> Halaman beranda publik — dapat diakses tanpa login. Sesuai ketentuan hak akses soal.

### Halaman Login

![Login](Screenshots/Login%20admin.png)
> Form otentikasi administrator dengan desain dua kolom dan TailwindCSS.

### Dashboard Admin

![Dashboard](Screenshots/Dashboard.png)
> Panel kontrol utama — ringkasan statistik laporan (total, pending, diproses, selesai) dan tabel data terbaru.

### Form Tambah Data

![Tambah Data](Screenshots/Create.png)
> Modal form untuk membuat laporan baru — tanpa perpindahan halaman.

### Form Edit Data

![Edit Data](Screenshots/Update.png)
> Modal form untuk mengubah data laporan yang sudah ada.

### Tabel Manajemen Data

![Tabel Data](Screenshots/Tabel%20manajemen%20data.png)
> Tabel dengan indikator warna status dinamis dan pagination.

---

## Cara Menjalankan Project

### Syarat Sistem
- XAMPP (PHP 8.1+, MySQL/MariaDB)
- Composer (untuk dependency backend)
- Browser modern

### 1. Setup Database
1. Jalankan **XAMPP**, nyalakan **Apache** dan **MySQL**
2. Buka `http://localhost/phpmyadmin`
3. Buat database baru: **`silapor`**
4. Import: pilih file **`database_silapor.sql`** dari folder proyek → klik **Go**

### 2. Jalankan Backend (API)
```bash
cd C:\xampp\htdocs\UAS_Web2_312410545_Muhammad_Arkhamullah\backend-api

# Copy file env jadi .env (jika belum ada)
cp env .env
```

Edit `.env` — pastikan koneksi database sesuai:
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

Coba test:
```
http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/api/kategori
```

> **Catatan:** Dependency vendor sudah termasuk di repo — tidak perlu `composer install` ulang.

### 3. Jalankan Frontend (SPA)
Cukup akses melalui browser:
```
http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/
```

Frontend akan langsung terhubung ke backend API yang berjalan.

> **Login:** Email `admin@silapor.com` — Password `password`

### Struktur Folder
```
UAS_Web2_312410545_Muhammad_Arkhamullah/
├── backend-api/          # CodeIgniter 4 REST API
├── frontend-spa/         # Vue.js 3 SPA
├── Screenshots/          # Dokumentasi
├── database_silapor.sql  # Backup database
└── README.md
```

---

### 📝 Template Link YouTube

```markdown
| **🎥 Video Presentasi** | [https://youtu.be/xxx_isi_link_disini](https://youtu.be/xxx_isi_link_disini) |
```

---
*© 2026 SiLapor — UAS Pemrograman Web 2*
