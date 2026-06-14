<div align="center">
  <h1>📋 Sistem Informasi SiLapor</h1>
  <h3>Platform Pengaduan Layanan Masyarakat Terpadu</h3>
  
  <p align="center">
    <img src="https://img.shields.io/badge/CodeIgniter-EF4223?style=for-the-badge&logo=codeIgniter&logoColor=white" alt="CodeIgniter 4" />
    <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue.js 3" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  </p>
</div>

---

**Tema Studi Kasus:** Sistem Pelaporan Pengaduan Layanan Masyarakat (SiLapor) dirancang menggunakan arsitektur web modern yang **Decoupled** (Terpisah sepenuhnya). Backend ditenagai oleh REST API tangguh menggunakan **CodeIgniter 4**, sedangkan antarmuka (Frontend) berjalan sebagai *Single Page Application* (SPA) interaktif dengan **Vue.js 3** dan desain responsif bertenaga **TailwindCSS**.

---

## 🌟 Fitur Unggulan Proyek
- 🔒 **Bearer Token Authentication:** Keamanan API tingkat tinggi menggunakan JWT/Token.
- ⚡ **Single Page Application:** Navigasi super cepat tanpa memuat ulang halaman (*page reload*).
- 🎨 **Modern UI/UX:** Tampilan premium dengan mikro-animasi menggunakan TailwindCSS.
- 📱 **Fully Responsive:** Tampilan sempurna di perangkat *desktop* maupun seluler.

---

## 1. Skema Relasi Tabel Database
*(Dokumentasi struktur database dari Desainer phpMyAdmin)*

> Sistem database ini dirancang secara relasional (RDBMS) untuk memastikan integritas data antara Entitas Pengguna, Kategori, Laporan, dan Komentar/Tanggapan.

<div align="center">
  <img src="screenshots/relasi_tabel.png" alt="Skema Relasi Tabel Database" width="800">
</div>

---

## 2. Uji Coba Keamanan API (Error 401 Unauthorized)
*(Validasi sistem proteksi endpoint menggunakan Postman)*

> Endpoint sensitif (seperti Dashboard dan Manipulasi Data) diproteksi dengan `AuthFilter`. Jika ada *request* tanpa Bearer Token yang valid, server secara otomatis akan menolak dan mengembalikan HTTP Status `401 Unauthorized`.

<div align="center">
  <img src="https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah/blob/master/Screenshots/SS%20postman%20401.png?raw=true" alt="Error 401 Postman" width="800">
</div>

---

## 3. Antarmuka Aplikasi (User Interface)

Di bawah ini adalah dokumentasi antarmuka pengguna yang telah dioptimalkan dengan **TailwindCSS**:

### 🔐 Halaman Login Administrator
*(Gerbang akses aman khusus untuk administrator)*
<img src="screenshots/login.png" alt="Halaman Login">

### 📊 Halaman Dashboard Admin
*(Ringkasan analitik laporan dan statistik sistem)*
<img src="screenshots/dashboard.png" alt="Dashboard Admin">

### 📝 Tampilan Form Modal Tambah/Edit Data
*(Formulir dinamis tanpa perpindahan halaman)*
<img src="screenshots/form_modal.png" alt="Form Modal Data">

### 📋 Visualisasi Data Tabel
*(Manajemen data interaktif bertenaga TailwindCSS)*
<img src="screenshots/tabel_data.png" alt="Visualisasi Data Tabel">

---

## 4. Panduan Instalasi (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan arsitektur *decoupled* ini di komputer lokal Anda:

### A. Persiapan Database
1. Jalankan **Apache** dan **MySQL** melalui XAMPP Control Panel.
2. Buka phpMyAdmin di browser (`http://localhost/phpmyadmin`).
3. Buat database kosong baru dengan nama `silapor`.
4. Import file `database_silapor.sql` yang tersedia di direktori *root* proyek.

### B. Menjalankan Backend (CodeIgniter 4 REST API)
1. Buka folder `backend-api` di dalam proyek.
2. Salin/ubah (rename) file `env` menjadi `.env`.
3. Buka file `.env` menggunakan *text editor* dan sesuaikan konfigurasi database:
   ```env
   database.default.hostname = localhost
   database.default.database = silapor
   database.default.username = root
   database.default.password = 
   ```
4. Backend API sudah otomatis aktif dan berjalan melalui server XAMPP lokal di *path*:  
   🔗 `http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/`

### C. Menjalankan Frontend (Vue.js 3 SPA)
1. Buka folder `frontend-spa`.
2. Pastikan Anda tidak mengubah konfigurasi `APP_CONFIG` di `index.html` jika Anda menyimpan folder proyek dengan nama `UAS_Web2_312410545_Muhammad_Arkhamullah` di dalam `htdocs`.
3. Buka URL berikut di browser untuk menikmati aplikasinya:  
   🔗 `http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/`

---

## 5. Tautan Proyek Akademik

*Video presentasi mendetail mengenai implementasi kode dan demo aplikasi:*

- 🎬 **Link Demo Aplikasi:** [Masukkan Link Demo Anda Di Sini]
- 🎥 **Link Video Presentasi:** [Masukkan Link Video Anda Di Sini]

<br>
<p align="center">
  <i>Proyek ini dikembangkan oleh <b>Muhammad Arkhamullah</b> untuk memenuhi tugas <b>Ujian Akhir Semester - Pemrograman Web 2</b>.</i>
</p>
