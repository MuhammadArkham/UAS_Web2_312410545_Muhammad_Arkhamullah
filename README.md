# Sistem Informasi SiLapor (Pengaduan Layanan Masyarakat Terpadu)

## Informasi Mahasiswa
- **Nama Mahasiswa:** Muhammad Arkhamullah
- **NIM:** 312410545
- **Mata Kuliah:** Pemrograman Web 2
- **Tugas:** Ujian Akhir Semester (UAS)

---

## 1. Tema Studi Kasus
Proyek ini adalah "Sistem Pelaporan Pengaduan Layanan Masyarakat (SiLapor)". Sistem ini dikembangkan menggunakan arsitektur web modern yang Terpisah (*Decoupled*). Bagian *backend* dikembangkan sebagai REST API menggunakan CodeIgniter 4, sedangkan bagian *frontend* dikembangkan sebagai *Single Page Application* (SPA) interaktif menggunakan Vue.js 3 dan TailwindCSS.

## 2. Skema Relasi Tabel Database
Berikut adalah struktur relasi tabel database yang diambil dari Desainer phpMyAdmin:

![Skema Relasi Tabel Database](screenshots/relasi_tabel.png)

## 3. Uji Coba Tembak API Gagal (Error 401 Unauthorized)
Berikut adalah hasil pengujian keamanan endpoint REST API melalui aplikasi Postman. Pengujian dilakukan dengan mengakses endpoint yang diproteksi tanpa menyertakan *Bearer Token* yang valid, sehingga sistem mengembalikan status *Error 401 Unauthorized*.

![Error 401 Postman](screenshots/postman_error_401.png)

## 4. Antarmuka Aplikasi (User Interface)
Berikut adalah dokumentasi antarmuka pengguna dari sistem SiLapor:

### Halaman Login
![Halaman Login](screenshots/login.png)

### Halaman Dashboard Admin
![Dashboard Admin](screenshots/dashboard.png)

### Tampilan Form Modal Tambah/Edit Data
![Form Modal Data](screenshots/form_modal.png)

### Visualisasi Data Tabel (TailwindCSS)
![Visualisasi Data Tabel](screenshots/tabel_data.png)

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
