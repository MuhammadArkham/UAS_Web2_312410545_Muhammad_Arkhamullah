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
        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $email    = $this->request->getVar('email');
        $password = $this->request->getVar('password');

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
        $rules = [
            'name'     => 'required|min_length[3]|max_length[100]',
            'email'    => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[6]',
            'role'     => 'in_list[admin,pelapor]'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $userModel = new UserModel();
        $data = [
            'name'       => $this->request->getVar('name'),
            'email'      => $this->request->getVar('email'),
            'password'   => password_hash($this->request->getVar('password'), PASSWORD_BCRYPT),
            'role'       => $this->request->getVar('role') ?? 'pelapor',
            'created_at' => date('Y-m-d H:i:s')
        ];

        $userModel->insert($data);

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Akun berhasil dibuat'
        ])->setStatusCode(201);
    }
}
