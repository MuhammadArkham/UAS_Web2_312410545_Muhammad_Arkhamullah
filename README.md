# Sistem Informasi SiLapor (Pengaduan Layanan Masyarakat Terpadu)

**Nama Mahasiswa:** Muhammad Arkhamullah R.A

**NIM:** 312410545

**Kelas:**	I241E

**Mata Kuliah:** Pemrograman Web 2

**Tugas:** Ujian Akhir Semester (UAS)

---

## 1. Tema Studi
Proyek ini adalah "Sistem Pelaporan Pengaduan Layanan Masyarakat (SiLapor)". Sistem ini dikembangkan menggunakan arsitektur web modern yang Terpisah (*Decoupled*). Bagian *backend* dikembangkan sebagai REST API menggunakan CodeIgniter 4, sedangkan bagian *frontend* dikembangkan sebagai *Single Page Application* (SPA) interaktif menggunakan Vue.js 3 dan TailwindCSS.

## 2. Struktur & Skema Database (Kamus Data)
Untuk memberikan representasi arsitektur data yang lebih terstruktur dan rapi, berikut adalah rincian kolom (Kamus Data) dari masing-masing tabel yang digunakan dalam sistem SiLapor:

### A. Tabel `pengguna` (Data Akun)
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT(10) | **Primary Key**, Auto Increment |
| `name` | VARCHAR(100) | Nama lengkap pengguna |
| `email` | VARCHAR(100) | Alamat email terdaftar (Unique) |
| `password` | VARCHAR(255) | Kata sandi (Terenkripsi / Hashed) |
| `role` | ENUM | Peran akses (`admin`, `pelapor`) |
| `token` | VARCHAR(255) | Token sesi/autentikasi |
| `created_at` | TIMESTAMP | Tanggal akun dibuat |

### B. Tabel `kategori` (Jenis Aduan)
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT(10) | **Primary Key**, Auto Increment |
| `name` | VARCHAR(100) | Nama kategori (Infrastruktur, Sosial, dll) |
| `description` | VARCHAR(255) | Penjelasan detail kategori |
| `created_at` | TIMESTAMP | Tanggal kategori ditambahkan |

### C. Tabel `laporan` (Data Aduan Masyarakat)
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT(10) | **Primary Key**, Auto Increment |
| `user_id` | INT(10) | **Foreign Key** (Relasi ke tabel `pengguna`) |
| `category_id` | INT(10) | **Foreign Key** (Relasi ke tabel `kategori`) |
| `title` | VARCHAR(200) | Judul singkat laporan |
| `description` | TEXT | Isi/detail lengkap kronologi kejadian |
| `image` | VARCHAR(255) | Direktori path gambar bukti (opsional) |
| `location` | VARCHAR(255) | Titik lokasi kejadian |
| `status` | ENUM | Status tindak lanjut (`pending`, `diproses`, `selesai`) |
| `created_at` | TIMESTAMP | Tanggal laporan direkam sistem |
| `updated_at` | TIMESTAMP | Tanggal laporan terakhir diperbarui statusnya |

### D. Tabel `komentar` (Tanggapan Administrator)
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT(10) | **Primary Key**, Auto Increment |
| `report_id` | INT(10) | **Foreign Key** (Relasi ke tabel `laporan`) |
| `admin_id` | INT(10) | **Foreign Key** (Relasi ke tabel `pengguna` berstatus admin) |
| `body` | TEXT | Isi teks tanggapan atau balasan |
| `created_at` | TIMESTAMP | Tanggal komentar diterbitkan |

---
**Representasi Visual Desainer Relasi Database (ERD)**

![Skema Relasi Tabel Database](screenshots/relasi_tabel.png)
*Gambar di atas mengilustrasikan relasi terstruktur antar entitas secara visual. Desain skema ini memastikan integritas data (referential integrity) terjaga kuat menggunakan konstrain Foreign Key.*

## 3. Uji Coba Tembak API Gagal (Error 401 Unauthorized)
Berikut adalah hasil pengujian keamanan endpoint REST API melalui aplikasi Postman. Pengujian dilakukan dengan mengakses endpoint yang diproteksi tanpa menyertakan *Bearer Token* yang valid, sehingga sistem mengembalikan status *Error 401 Unauthorized*.

![Error 401 Postman](screenshots/postman_error_401.png)
*Tangkapan layar di atas membuktikan bahwa sistem keamanan berbasis **JSON Web Token (JWT)** telah beroperasi. Klien yang mencoba mengambil data dari endpoint API sensitif tanpa menyertakan header otorisasi secara otomatis ditolak oleh fitur Filter CodeIgniter 4 demi mencegah kebocoran data. Hasil pengujian ini menunjukkan bahwa mekanisme proteksi API telah berhasil diimplementasikan sesuai dengan standar keamanan RESTful API.*

## 4. Antarmuka Aplikasi (User Interface)
Berikut adalah dokumentasi antarmuka pengguna dari sistem SiLapor:

### Halaman Login
![Halaman Login](screenshots/login.png)
*Halaman autentikasi yang menjadi gerbang masuk sistem. Antarmuka ini dibangun menggunakan komponen Vue.js dengan tata letak minimalis dan bersih untuk memudahkan proses input kredensial pengguna.*

### Halaman Dashboard Admin
![Dashboard Admin](screenshots/dashboard.png)
*Pusat kendali Administrator yang menampilkan rekapitulasi pelaporan. Desain analitik yang disajikan menonjolkan visual yang responsif berkat pemanfaatan sistem grid dan utility dari kerangka kerja TailwindCSS.*

### Tampilan Form Modal Tambah/Edit Data
![Form Modal Data](screenshots/form_modal.png)
*Implementasi form modal interaktif (pop-up) untuk proses input data. Modal ini beroperasi secara asinkronus (SPA) sehingga proses tambah dan edit data dapat dilakukan instan tanpa memerlukan pemuatan ulang (reload) halaman web secara penuh.*

### Visualisasi Data Tabel (TailwindCSS)
![Visualisasi Data Tabel](screenshots/tabel_data.png)
*Tabel manajemen data yang merender kumpulan data JSON dari backend REST API. Tabel ini didesain secara khusus menggunakan komponen TailwindCSS untuk mencapai tingkat keterbacaan (readability) data yang tinggi bagi administrator.*

## 5. Petunjuk Instalasi Proyek Lokal
Ikuti panduan instalasi berikut untuk menjalankan proyek pada *localhost*:

### A. Konfigurasi Database
1. Buka phpMyAdmin di browser (`http://localhost/phpmyadmin`).
2. Buat database baru dengan nama `silapor`.
3. Lakukan proses import menggunakan file `database_silapor.sql` yang tersedia di direktori *root* proyek.

### B. Menjalankan Backend (CodeIgniter 4 API)
1. Buka folder `backend-api`.
2. Ubah nama file konfigurasi `env` menjadi `.env`.
3. Sesuaikan konfigurasi koneksi database di dalam file `.env`:
   ```env
   database.default.hostname = localhost
   database.default.database = silapor
   database.default.username = root
   database.default.password = 
   ```
4. Backend API sudah dapat beroperasi melalui server XAMPP di alamat:  
   `http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/`

### C. Menjalankan Frontend (Vue.js 3 SPA)
1. Buka folder `frontend-spa`.
2. Buka URL berikut pada browser untuk mengakses aplikasi:  
   `http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/`

## 6. Tautan Proyek Akademik
- **Link Demo Aplikasi:** [Masukkan Link Demo Di Sini]
- **Link Video Presentasi:** [Masukkan Link Video Di Sini]
