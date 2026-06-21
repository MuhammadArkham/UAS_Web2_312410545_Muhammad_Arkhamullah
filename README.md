# Sistem Informasi SiLapor (Pengaduan Layanan Masyarakat Terpadu)

**Nama Mahasiswa:** Muhammad Arkhamullah R.A  
**NIM:** 312410545  
**Kelas:** I241E  
**Mata Kuliah:** Pemrograman Web 2  
**Tugas:** Ujian Akhir Semester (UAS)  

---

## Deskripsi Proyek

SiLapor merupakan platform pengaduan masyarakat berbasis web yang dirancang untuk menjembatani komunikasi antara masyarakat dan penyedia layanan publik. Sistem ini dikembangkan menggunakan pendekatan decoupled architecture untuk memisahkan logika backend dan antarmuka frontend secara penuh.

Pengelolaan data dan logika backend dibangun menggunakan **CodeIgniter 4** yang berfungsi secara eksklusif sebagai penyedia layanan REST API. Antarmuka pengguna (frontend) diimplementasikan sebagai Single Page Application (SPA) menggunakan **Vue.js 3** dan **TailwindCSS**. Pendekatan ini menghasilkan aplikasi yang responsif tanpa memerlukan proses pemuatan ulang (reload) halaman secara keseluruhan saat navigasi antarmenu.

---

## Struktur Database (Kamus Data)

Sistem basis data terdiri dari empat tabel utama yang saling berelasi sebagai berikut:

### Tabel Pengguna (`pengguna`)
Menyimpan kredensial otentikasi dan informasi profil untuk entitas administrator maupun pelapor.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `name` | VARCHAR(100) | Nama lengkap pengguna |
| `email` | VARCHAR(100) | Email unik sebagai identitas masuk (login) |
| `password` | VARCHAR(255) | Kata sandi yang telah dienkripsi (hash) |
| `role` | ENUM | Klasifikasi hak akses (`admin` atau `pelapor`) |
| `token` | VARCHAR(255) | Token untuk sesi autentikasi API |
| `created_at` | TIMESTAMP | Stempel waktu pendaftaran akun |

### Tabel Kategori (`kategori`)
Menyimpan klasifikasi laporan untuk memfasilitasi pengelompokan data pengaduan.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `name` | VARCHAR(100) | Nama entitas kategori |
| `description` | VARCHAR(255) | Penjelasan singkat terkait entitas kategori |
| `created_at` | TIMESTAMP | Stempel waktu pembuatan kategori |

### Tabel Laporan (`laporan`)
Berfungsi sebagai entitas utama yang menyimpan seluruh data pengaduan dari masyarakat.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `user_id` | INT | Relasi referensial terhadap pelapor (Tabel `pengguna`) |
| `category_id` | INT | Relasi referensial terhadap jenis aduan (Tabel `kategori`) |
| `title` | VARCHAR(200) | Judul spesifik laporan |
| `description` | TEXT | Rincian lengkap kronologi laporan |
| `image` | VARCHAR(255) | Direktori berkas foto bukti kejadian |
| `location` | VARCHAR(255) | Koordinat atau titik lokasi insiden |
| `status` | ENUM | Progres penanganan (`pending`, `diproses`, `selesai`) |
| `created_at` | TIMESTAMP | Stempel waktu penerimaan laporan |
| `updated_at` | TIMESTAMP | Stempel waktu modifikasi status terakhir |

### Tabel Komentar (`komentar`)
Menyimpan data tanggapan atau pembaruan status laporan yang diberikan oleh administrator.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `report_id` | INT | Relasi referensial terhadap subjek laporan |
| `admin_id` | INT | Relasi referensial terhadap administrator |
| `body` | TEXT | Isi lengkap tanggapan |
| `created_at` | TIMESTAMP | Stempel waktu pengiriman tanggapan |

---

## Entity Relationship Diagram (ERD)

![Skema Database](Screenshots/Database.png)

> Skema diagram relasi entitas menunjukkan penerapan Foreign Key pada tabel terkait. Implementasi ini memastikan integritas referensial (referential integrity) untuk mencegah anomali atau penghapusan data secara tidak valid.

---

## Pengujian Keamanan API

![Error 401 Postman](Screenshots/postman.png)

> Gambar tersebut mendemonstrasikan implementasi keamanan REST API. Akses terhadap endpoint yang dilindungi tanpa menyertakan Bearer Token yang valid akan ditolak secara otomatis oleh sistem dengan kode status **401 Unauthorized**.

---

## Implementasi Axios Interceptors (Otomatisasi Token)

Sistem telah dikonfigurasi untuk mengotomatisasi penyisipan token dan penanganan kesalahan secara global pada sisi frontend (Vue.js) melalui penerapan Axios Interceptors. Berikut adalah cuplikan kode implementasi yang merepresentasikan fungsionalitas tersebut:

```javascript
// Request Interceptor: Menyuntikkan Bearer token secara otomatis
window.api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Response Interceptor: Menangani error 401 Unauthorized secara global
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

> Kode di atas mengonfirmasi dua fungsi operasional utama:
> 1. Request Interceptor bertugas mengekstraksi token dari `localStorage` untuk disematkan secara otomatis pada setiap header permintaan (request) keluar.
> 2. Response Interceptor bertugas menginterupsi respons dengan status 401 secara global untuk mencabut sesi, memberikan notifikasi peringatan (alert), serta mengarahkan pengguna kembali ke halaman otentikasi.

---

## Tampilan Aplikasi

### Halaman Login
![Login](Screenshots/Login%20admin.png)
> Antarmuka halaman otentikasi didesain secara minimalis untuk memastikan kemudahan akses administrator.

### Dashboard Admin
![Dashboard](Screenshots/Dashboard.png)
> Panel kontrol utama (dashboard) menyajikan ringkasan statistik laporan. Tata letak elemen bersifat responsif berkat pemanfaatan antarmuka pengguna berbasis TailwindCSS.

### Form Tambah dan Edit Data
![Tambah Data](Screenshots/Create.png)

![Edit Data](Screenshots/Update.png)
> Proses penambahan dan modifikasi data diimplementasikan melalui komponen modal interaktif tanpa perpindahan halaman, mengoptimalkan efisiensi alur kerja operasional dalam lingkungan SPA.

### Tabel Manajemen Data
![Tabel Data](Screenshots/Tabel%20manajemen%20data.png)
> Komponen tabel memproses respons data JSON dari backend untuk disajikan dalam antarmuka terstruktur. Indikator warna pada kolom status disesuaikan secara dinamis.

---

## Cara Menjalankan Project (Panduan Lokal)

### 1. Konfigurasi Database
1. Akses antarmuka phpMyAdmin melalui peramban (browser).
2. Buat basis data baru dengan nama `silapor`.
3. Lakukan proses impor struktur dan data menggunakan file `database_silapor.sql` yang terletak pada direktori utama proyek.

### 2. Menjalankan Backend (API)
Arahkan direktori terminal ke folder backend:
```bash
cd backend-api
```
Ubah nama file konfigurasi environment dari env menjadi .env. Pastikan konfigurasi koneksi basis data disesuaikan sebagai berikut:
```env
database.default.hostname = localhost
database.default.database = silapor
database.default.username = root
database.default.password =
```
Layanan Backend API akan aktif dan dapat diakses melalui URL:
```bash
http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/
```

### 3. Menjalankan Frontend (SPA)
Akses direktori frontend melalui peramban pada alamat URL berikut:
```bash
http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/
```

---

## Akun Demo
Kredensial otentikasi berikut dapat digunakan untuk mengakses panel administrator tanpa perlu melakukan inspeksi basis data secara manual:

**Email:**
```text
admin@silapor.com
```

**Password:**
```text
password123
```

---

## Tautan Pendukung (Penilaian)

*   **Video Presentasi:** `[Tambahkan Link Video Presentasi Anda di Sini]`
*   **Live Demo (Opsional):** `[Tambahkan Link GitHub Pages / Hosting di Sini Jika Ada]`
*   **Repository GitHub:** [https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah](https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah)
