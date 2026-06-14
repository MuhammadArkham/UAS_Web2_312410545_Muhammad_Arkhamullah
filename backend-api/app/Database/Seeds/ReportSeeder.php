<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use CodeIgniter\I18n\Time;

class ReportSeeder extends Seeder
{
    public function run()
    {

        // Check if categories exist, if not, create them
        $categoryBuilder = $this->db->table('kategori');
        if ($categoryBuilder->countAllResults() == 0) {
            $categories = [
                ['name' => 'Infrastruktur'],
                ['name' => 'Lingkungan'],
                ['name' => 'Keamanan'],
                ['name' => 'Kesehatan'],
                ['name' => 'Pelayanan Publik'],
                ['name' => 'Lainnya'],
            ];
            $categoryBuilder->insertBatch($categories);
        }

        // Get category IDs
        $categories = $categoryBuilder->get()->getResultArray();
        $categoryIds = array_column($categories, 'id');

        // Check if a default user exists
        $userBuilder = $this->db->table('pengguna');
        if ($userBuilder->countAllResults() == 0) {
            $userBuilder->insert([
                'name' => 'Warga Tester',
                'email' => 'warga@silapor.com',
                'password' => password_hash('warga123', PASSWORD_BCRYPT),
                'role' => 'pelapor'
            ]);
        }
        $users = $userBuilder->where('role', 'pelapor')->get()->getResultArray();
        if (count($users) > 0) {
            $userIds = array_column($users, 'id');
        } else {
            // fallback if somehow no pelapor
            $allUsers = $userBuilder->get()->getResultArray();
            $userIds = array_column($allUsers, 'id');
        }

        $statuses = ['pending', 'diproses', 'selesai', 'ditolak'];

        // Cases and titles
        $reportTemplates = [
            [
                'title' => 'Jalan Berlubang Bahayakan Pengendara',
                'desc' => 'Terdapat jalan berlubang cukup dalam yang membahayakan pengendara motor di malam hari.',
            ],
            [
                'title' => 'Tumpukan Sampah Tidak Diangkut',
                'desc' => 'Sudah 3 hari sampah di pertigaan jalan tidak diangkut oleh petugas kebersihan.',
            ],
            [
                'title' => 'Lampu Penerangan Jalan Padam',
                'desc' => 'Lampu PJU mati total sejak minggu lalu, jalanan menjadi sangat gelap dan rawan.',
            ],
            [
                'title' => 'Pohon Tumbang Menutupi Jalan',
                'desc' => 'Ada pohon tumbang akibat hujan deras semalam menutupi setengah ruas jalan.',
            ],
            [
                'title' => 'Pungutan Liar Pembuatan KTP',
                'desc' => 'Dimintai uang tambahan di luar ketentuan saat mengurus KTP.',
            ],
            [
                'title' => 'Gorong-gorong Mampet Banjir',
                'desc' => 'Saluran air tersumbat sehingga air meluap ke jalan saat hujan.',
            ],
            [
                'title' => 'Maling Motor Berkeliaran',
                'desc' => 'Terjadi kehilangan 2 motor dalam seminggu terakhir di komplek ini.',
            ],
            [
                'title' => 'Fasilitas Puskesmas Kurang Memadai',
                'desc' => 'Antrian tidak teratur dan dokter spesialis sering tidak datang tepat waktu.',
            ]
        ];

        $data = [];
        $cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Malang', 'Medan', 'Makassar'];

        for ($i = 0; $i < 20; $i++) {
            $template = $reportTemplates[array_rand($reportTemplates)];
            $city = $cities[array_rand($cities)];
            // Random timestamp from past 30 days
            $timestamp = time() - rand(0, 30 * 24 * 60 * 60);
            $createdAt = date('Y-m-d H:i:s', $timestamp);
            
            $data[] = [
                'user_id'     => $userIds[array_rand($userIds)],
                'category_id' => $categoryIds[array_rand($categoryIds)],
                'title'       => $template['title'] . ' di ' . $city,
                'description' => $template['desc'] . ' Mohon segera ditindaklanjuti oleh pihak terkait karena sudah sangat mengganggu aktivitas warga.',
                'location'    => 'Jl. Pahlawan No. ' . rand(1, 100) . ', ' . $city,
                'status'      => $statuses[array_rand($statuses)],
                'image'       => null,
                'created_at'  => $createdAt,
                'updated_at'  => $createdAt
            ];
        }

        $this->db->table('laporan')->insertBatch($data);
        echo "20 Dummy reports seeded successfully.\n";
    }
}
