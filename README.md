# Sistem Informasi SiLapor (Pengaduan Layanan Masyarakat Terpadu)

**Nama Mahasiswa:** Muhammad Arkhamullah R.A  
**NIM:** 312410545  
**Kelas:** I241E  
**Mata Kuliah:** Pemrograman Web 2  
**Tugas:** Ujian Akhir Semester (UAS)  

---

## Deskripsi Proyek

SiLapor adalah platform pengaduan masyarakat berbasis web yang sengaja didesain untuk menjembatani komunikasi antara warga dan penyedia layanan publik. Biar lebih optimal dan gampang di-maintain, sistem ini dibangun pakai pendekatan *decoupled architecture* (frontend dan backend dipisah total).

Untuk urusan data dan logika, backend-nya digarap menggunakan **CodeIgniter 4** yang melayani REST API secara eksklusif. Sementara itu, tampilan mukanya (frontend) dibangun murni sebagai *Single Page Application* (SPA) menggunakan **Vue.js 3** dan dirapikan dengan **TailwindCSS**. Hasilnya? Aplikasi terasa lebih mulus dan cepat karena nggak perlu *loading* ulang halaman setiap kali pindah menu.

---

## Struktur Database (Kamus Data)

Sistem ini ditopang oleh empat tabel utama yang saling berelasi dengan rapi. Berikut rinciannya:

### Tabel Pengguna (`pengguna`)
Tempat nyimpen data akun buat *login*, baik itu akun punya admin maupun pelapor.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `name` | VARCHAR(100) | Nama lengkap pengguna |
| `email` | VARCHAR(100) | Email unik buat identitas login |
| `password` | VARCHAR(255) | Kata sandi (sudah di-*hash* biar aman) |
| `role` | ENUM | Pembeda hak akses (`admin` atau `pelapor`) |
| `token` | VARCHAR(255) | Token untuk sesi autentikasi API |
| `created_at` | TIMESTAMP | Tanggal akun terdaftar |

### Tabel Kategori (`kategori`)
Biar pengaduan nggak berantakan, kita kelompokkan berdasarkan kategori ini.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `name` | VARCHAR(100) | Nama kategori (misal: Infrastruktur, Sosial) |
| `description` | VARCHAR(255) | Penjelasan singkat kategorinya |
| `created_at` | TIMESTAMP | Tanggal kategori dibuat |

### Tabel Laporan (`laporan`)
Ini tabel utamanya, tempat semua aspirasi dan keluhan masyarakat ditampung.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `user_id` | INT | Relasi ke pelapor (Tabel `pengguna`) |
| `category_id` | INT | Relasi ke jenis aduan (Tabel `kategori`) |
| `title` | VARCHAR(200) | Judul laporan |
| `description` | TEXT | Kronologi atau isi laporan lengkap |
| `image` | VARCHAR(255) | Path foto bukti kejadian |
| `location` | VARCHAR(255) | Titik lokasi masalah |
| `status` | ENUM | Progres penanganan (`pending`, `diproses`, `selesai`) |
| `created_at` | TIMESTAMP | Waktu laporan dikirim |
| `updated_at` | TIMESTAMP | Waktu terakhir statusnya diubah |

### Tabel Komentar (`komentar`)
Kalau admin butuh kasih *feedback* atau *update* info ke laporan warga, masuknya ke sini.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `report_id` | INT | Relasi ke laporan mana yang dibalas |
| `admin_id` | INT | Relasi ke admin yang membalas |
| `body` | TEXT | Isi tanggapannya |
| `created_at` | TIMESTAMP | Waktu balasan dikirim |

---

## Entity Relationship Diagram (ERD)

![Skema Database](Screenshots/Database.png)

> *Bisa dilihat dari skema di atas, semua tabel sudah disambung pakai Foreign Key. Ini penting banget buat ngejaga supaya datanya nggak ada yang "nyasar" atau terhapus sembarangan (referential integrity).*

---

## Pengujian Keamanan API

![Error 401 Postman](Screenshots/postman.png)

> *Gambar ini jadi bukti nyata kalau keamanan REST API-nya nggak cuma pajangan. Pas kita tembak endpoint rahasia tanpa bawa tiket masuk (Bearer Token) yang valid, sistem CodeIgniter langsung tegas nolak dengan respons **401 Unauthorized**.*

---

## Tampilan Aplikasi

### Halaman Login
![Login](Screenshots/Login%20admin.png)
> *Gerbang utamanya dibikin super simpel dan bersih ala desain modern, biar admin nggak pusing pas mau masuk sistem.*

### Dashboard Admin
![Dashboard](Screenshots/Dashboard.png)
> *Di sini admin bisa mantau semua pergerakan data. Tata letaknya responsif banget karena udah disokong penuh sama utility classes dari TailwindCSS.*

### Form Tambah dan Edit Data
![Tambah Data](Screenshots/Create.png)

![Edit Data](Screenshots/Update.png)
> *Proses input atau update data nggak butuh loading pindah halaman lagi. Semuanya udah pakai sistem modal pop-up interaktif (ciri khas SPA) biar kerjanya lebih ngebut.*

### Tabel Manajemen Data
![Tabel Data](Screenshots/Tabel%20manajemen%20data.png)
> *Tabel ini nangkep raw data JSON dari backend dan meramunya jadi daftar yang gampang dibaca. Lencana (badge) warnanya otomatis menyesuaikan status laporan.*

---

## Cara Menjalankan Project (Panduan Lokal)

### 1. Konfigurasi Database
1. Buka phpMyAdmin di browser Anda.
2. Bikin database baru dengan nama `silapor`.
3. Lakukan *import* menggunakan file `database_silapor.sql` yang ada di folder root proyek ini.

### 2. Menjalankan Backend (API)
Masuk ke direktori backend:
```bash
cd backend-api
```
Ubah nama file environment dari `env` menjadi `.env`. Lalu pastikan settingan koneksi databasenya seperti ini:
```env
database.default.hostname = localhost
database.default.database = silapor
database.default.username = root
database.default.password =
```
Backend API sekarang *standby* dan bisa diakses di:
```bash
http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/
```

### 3. Menjalankan Frontend (SPA)
Langsung saja buka direktori frontend-nya lewat *browser* di alamat:
```bash
http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/
```

---

## Akun Demo
Biar nggak perlu repot bongkar database buat nyari password pas mau ngecek aplikasi, silakan pakai akun admin ini:

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
