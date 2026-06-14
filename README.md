# 📋 Sistem Informasi SiLapor (Pengaduan Masyarakat)

**Tema Studi Kasus:** Sistem Pelaporan Pengaduan Layanan Masyarakat (SiLapor) berbasis web dengan arsitektur *Decoupled* (Terpisah), menggunakan backend REST API (CodeIgniter 4) dan frontend SPA (Vue.js 3 + TailwindCSS).

---

## 1. Skema Relasi Tabel Database
*(Screenshot dari fitur Desainer database phpMyAdmin)*

![Skema Relasi Tabel Database](screenshots/relasi_tabel.png)

---

## 2. Uji Coba Tembak API Gagal (Error 401 Unauthorized)
*(Screenshot saat melakukan pengujian endpoint yang dilindungi menggunakan Postman tanpa menyertakan Bearer Token yang valid)*

![Error 401 Postman](https://github.com/MuhammadArkham/UAS_Web2_312410545_Muhammad_Arkhamullah/blob/master/Screenshots/SS%20postman%20401.png?raw=true)

---

## 3. Antarmuka Aplikasi (User Interface)

### Halaman Login
![Halaman Login](screenshots/login.png)

### Halaman Dashboard Admin
![Dashboard Admin](screenshots/dashboard.png)

### Tampilan Form Modal Tambah/Edit Data
![Form Modal Data](screenshots/form_modal.png)

### Visualisasi Data Tabel (Bertenaga TailwindCSS)
![Visualisasi Data Tabel](screenshots/tabel_data.png)

---

## 4. Petunjuk Instalasi Singkat

### A. Persiapan Database
1. Buka phpMyAdmin (`http://localhost/phpmyadmin`).
2. Buat database baru bernama `silapor`.
3. Import file `database_silapor.sql` yang tersedia di dalam folder *root* proyek.

### B. Menjalankan Backend (CodeIgniter 4 API)
1. Buka folder `backend-api`.
2. Ubah/salin file `env` menjadi `.env`.
3. Buka file `.env` dan sesuaikan konfigurasi database:
   ```env
   database.default.hostname = localhost
   database.default.database = silapor
   database.default.username = root
   database.default.password = 
   ```
4. Backend API sudah siap dipanggil melalui localhost XAMPP di alamat:  
   `http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/`

### C. Menjalankan Frontend (Vue 3 SPA)
1. Buka folder `frontend-spa`.
2. Pastikan file `index.html` dan `app.js` menunjuk ke URL backend lokal yang benar.
3. Akses aplikasi melalui browser dengan mengetikkan alamat instalasi XAMPP Anda:  
   `http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/frontend-spa/`

---

## 5. Tautan Proyek

- **Link Demo Aplikasi:** [Masukkan Link Demo Anda Di Sini]
- **Link Video Presentasi:** [Masukkan Link Video Anda Di Sini]
