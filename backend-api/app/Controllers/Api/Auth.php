<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use CodeIgniter\API\ResponseTrait;

class Auth extends BaseController
{
    use ResponseTrait;

    public function login()
    {
        $json = $this->request->getJSON(true);
        
        $email    = $json['email'] ?? $this->request->getVar('email');
        $password = $json['password'] ?? $this->request->getVar('password');

        if (empty($email) || empty($password)) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'Email dan password wajib diisi'
            ])->setStatusCode(400);
        }

        $userModel = new UserModel();
        $user = $userModel->where('email', $email)->first();

        if (!$user) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'Email atau password salah'
            ])->setStatusCode(401);
        }

        $verify = password_verify($password, $user['password']);
        if (!$verify) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'Email atau password salah'
            ])->setStatusCode(401);
        }

        $token = bin2hex(md5(uniqid(rand(), true)));
        $userModel->update($user['id'], ['token' => $token]);

        return $this->response->setJSON([
            'status' => 'success',
            'token'  => $token,
            'user'   => [
                'id'    => (int) $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role']
            ]
        ]);
    }

    public function register()
    {
        $json = $this->request->getJSON(true);

        $name     = $json['name'] ?? $this->request->getVar('name');
        $email    = $json['email'] ?? $this->request->getVar('email');
        $password = $json['password'] ?? $this->request->getVar('password');
        $role     = $json['role'] ?? $this->request->getVar('role') ?? 'pelapor';

        if (empty($name) || empty($email) || empty($password)) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'Semua field wajib diisi'
            ])->setStatusCode(400);
        }

        $userModel = new UserModel();
        $data = [
            'name'       => $name,
            'email'      => $email,
            'password'   => password_hash($password, PASSWORD_BCRYPT),
            'role'       => $role,
            'created_at' => date('Y-m-d H:i:s')
        ];

        $userModel->insert($data);

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Akun berhasil dibuat'
        ])->setStatusCode(201);
    }
}