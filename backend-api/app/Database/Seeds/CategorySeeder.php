<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $data = [
            [
                'name'        => 'Infrastruktur',
                'description' => 'Jalan rusak, jembatan, fasilitas umum',
                'created_at'  => date('Y-m-d H:i:s'),
            ],
            [
                'name'        => 'Keamanan',
                'description' => 'Kriminalitas, gangguan ketertiban',
                'created_at'  => date('Y-m-d H:i:s'),
            ],
            [
                'name'        => 'Lingkungan',
                'description' => 'Sampah, polusi, banjir',
                'created_at'  => date('Y-m-d H:i:s'),
            ],
            [
                'name'        => 'Kesehatan',
                'description' => 'Fasilitas kesehatan, sanitasi',
                'created_at'  => date('Y-m-d H:i:s'),
            ],
            [
                'name'        => 'Pendidikan',
                'description' => 'Fasilitas pendidikan, pelayanan sekolah',
                'created_at'  => date('Y-m-d H:i:s'),
            ],
        ];

        $this->db->table('categories')->insertBatch($data);
    }
}
