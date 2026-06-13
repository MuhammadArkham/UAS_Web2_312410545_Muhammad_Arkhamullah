<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Home extends ResourceController
{
    public function index()
    {
        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Welcome to SiLapor API',
            'version' => '1.0.0'
        ]);
    }
}
