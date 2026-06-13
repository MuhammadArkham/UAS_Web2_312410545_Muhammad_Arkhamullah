<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run()
    {
        $data = [
            'name'       => 'Administrator',
            'email'      => 'admin@silapor.com',
            'password'   => password_hash('Admin123!', PASSWORD_BCRYPT),
            'role'       => 'admin',
            'created_at' => date('Y-m-d H:i:s'),
        ];
        
        $this->db->table('users')->insert($data);
    }
}
