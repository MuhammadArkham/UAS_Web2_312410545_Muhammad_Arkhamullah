-- ==========================================================
-- SCRIPT DATABASE SILAPOR (Sistem Pelaporan Layanan Publik)
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+07:00";

-- --------------------------------------------------------
-- 1. Struktur Tabel `kategori`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `kategori`;
CREATE TABLE `kategori` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert Data Kategori
INSERT INTO `kategori` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Infrastruktur', 'Jalan rusak, jembatan, fasilitas umum', '2026-06-10 18:09:54'),
(2, 'Keamanan', 'Kriminalitas, gangguan ketertiban', '2026-06-10 18:09:54'),
(3, 'Lingkungan', 'Sampah, polusi, banjir', '2026-06-10 18:09:54'),
(4, 'Kesehatan', 'Fasilitas kesehatan, sanitasi', '2026-06-10 18:09:54'),
(5, 'Pendidikan', 'Fasilitas pendidikan, pelayanan sekolah', '2026-06-10 18:09:54'),
(6, 'Sosial', 'Pelayanan sosial dan kesejahteraan', '2026-06-11 00:04:49');

-- --------------------------------------------------------
-- 2. Struktur Tabel `pengguna`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `pengguna`;
CREATE TABLE `pengguna` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','pelapor') NOT NULL DEFAULT 'pelapor',
  `token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert Data Pengguna
INSERT INTO `pengguna` (`id`, `name`, `email`, `password`, `role`, `token`, `created_at`) VALUES
(1, 'Administrator', 'admin@silapor.com', '$2y$10$Q/O0mzDZZ0FHP3wgKlOTruYo2HiVkT.vEEhGcgqs.07QbMHku7BBe', 'admin', '3430656536633564383862313433636666336639343238363163646365366365', '2026-06-10 18:09:54'),
(2, 'arkham', 'arkhamzx456@gmail.com', '$2y$10$.N4yLFOVOrcEZmGC1xZLW.07Ib1KwS2ovuydvN.WkGImTBqNcmdBa', 'pelapor', 'e4a2023706e331883007d8e7afa597d4b56bae020a69caee2f8ac293f67d16bd', '2026-06-10 20:01:23');

-- --------------------------------------------------------
-- 3. Struktur Tabel `laporan`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `laporan`;
CREATE TABLE `laporan` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('pending','diproses','selesai') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `laporan_pengguna_id_foreign` (`user_id`),
  KEY `laporan_kategori_id_foreign` (`category_id`),
  CONSTRAINT `laporan_kategori_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `kategori` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `laporan_pengguna_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert Data Laporan
INSERT INTO `laporan` (`id`, `user_id`, `category_id`, `title`, `description`, `image`, `location`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'Jembatan Rusak di Desa Sukamaju', 'Jembatan penghubung antar desa mengalami keretakan parah pada pondasi utama, membahayakan warga yang melintas.', NULL, 'Desa Sukamaju, RT 02/RW 03', 'diproses', '2026-06-10 20:59:00', '2026-06-11 00:08:51'),
(2, 2, 1, 'Jalan Rusak di Gang Damai', 'Jalanan di Gang Damai rusak parah dan berlubang. Saat hujan tergenang air dan membahayakan pengendara motor.', NULL, 'Gang Damai RT 05 RW 01', 'pending', '2026-06-11 00:10:08', '2026-06-11 00:10:08');

-- --------------------------------------------------------
-- 4. Struktur Tabel `komentar`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `komentar`;
CREATE TABLE `komentar` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `report_id` int(10) unsigned NOT NULL,
  `admin_id` int(10) unsigned NOT NULL,
  `body` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `komentar_laporan_id_foreign` (`report_id`),
  KEY `komentar_admin_id_foreign` (`admin_id`),
  CONSTRAINT `komentar_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `komentar_laporan_id_foreign` FOREIGN KEY (`report_id`) REFERENCES `laporan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert Data Komentar
INSERT INTO `komentar` (`id`, `report_id`, `admin_id`, `body`, `created_at`) VALUES
(1, 1, 1, 'Laporan diterima. Kami akan segera berkoordinasi dengan dinas terkait untuk menindaklanjuti perbaikan jembatan.', '2026-06-10 21:00:35');

-- --------------------------------------------------------
-- 5. Struktur Tabel `migrations` (Bawaan CodeIgniter)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `version` varchar(255) NOT NULL,
  `class` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `namespace` varchar(255) NOT NULL,
  `time` int(11) NOT NULL,
  `batch` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert Data Migrations
INSERT INTO `migrations` (`id`, `version`, `class`, `group`, `namespace`, `time`, `batch`) VALUES
(1, '2026-06-11-010701', 'App\\Database\\Migrations\\CreateUsersTable', 'default', 'App', 1781140194, 1),
(2, '2026-06-11-010702', 'App\\Database\\Migrations\\CreateCategoriesTable', 'default', 'App', 1781140194, 1),
(3, '2026-06-11-010703', 'App\\Database\\Migrations\\CreateReportsTable', 'default', 'App', 1781140194, 1),
(4, '2026-06-11-010704', 'App\\Database\\Migrations\\CreateCommentsTable', 'default', 'App', 1781140194, 1);
