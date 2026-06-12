<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\UserModel;
use Config\Services;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine("Authorization");
        $token = null;

        if (!empty($header)) {
            if (preg_match('/Bearer\s(\S+)/', $header, $matches)) {
                $token = $matches[1];
            }
        }

        if (empty($token)) {
            return Services::response()
                ->setJSON(['status' => 'error', 'message' => 'Token tidak valid atau sudah kedaluwarsa'])
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
        }

        $userModel = new UserModel();
        $user = $userModel->where('token', $token)->first();

        if (!$user) {
            return Services::response()
                ->setJSON(['status' => 'error', 'message' => 'Token tidak valid atau sudah kedaluwarsa'])
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }
}
