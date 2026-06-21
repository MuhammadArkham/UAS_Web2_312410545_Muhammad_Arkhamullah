<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class Migrate extends Controller
{
    public function index()
    {
        try {
            $db = \Config\Database::connect();
            
            // Path ke file SQL (naik satu folder dari folder app)
            $sqlFile = ROOTPATH . '../database_silapor.sql';
            
            if (!file_exists($sqlFile)) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'File database_silapor.sql tidak ditemukan di path: ' . $sqlFile
                ]);
            }
            
            $sql = file_get_contents($sqlFile);
            
            // Eksekusi multi query (mysqli extension required)
            $mysqli = $db->connID;
            
            if (mysqli_multi_query($mysqli, $sql)) {
                do {
                    // Store first result set
                    if ($result = mysqli_store_result($mysqli)) {
                        mysqli_free_result($result);
                    }
                } while (mysqli_more_results($mysqli) && mysqli_next_result($mysqli));
                
                return $this->response->setJSON([
                    'success' => true,
                    'message' => 'Database berhasil di-import/ditimpa!'
                ]);
            } else {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Gagal eksekusi query: ' . mysqli_error($mysqli)
                ]);
            }
            
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ]);
        }
    }
}
