<?php

namespace App\Controllers;

use App\Models\CommentModel;
use App\Models\UserModel;
use CodeIgniter\API\ResponseTrait;

class Comments extends BaseController
{
    use ResponseTrait;

    public function create($reportId)
    {
        $body = $this->request->getVar('body');
        $json = $this->request->getJSON();
        if (empty($body) && $json && isset($json->body)) {
            $body = $json->body;
        }

        if (empty($body)) {
            return $this->response->setJSON([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => ['body' => 'The body field is required.']
            ])->setStatusCode(422);
        }

        $header = $this->request->getHeaderLine("Authorization");
        $token = null;
        if (preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            $token = $matches[1];
        }

        $userModel = new UserModel();
        $user = $userModel->where('token', $token)->first();

        if (!$user) {
            return $this->response->setJSON([
                'status' => 'error',
                'message'=> 'Akses ditolak'
            ])->setStatusCode(403);
        }

        $commentModel = new CommentModel();
        
        $data = [
            'report_id'  => $reportId,
            'admin_id'   => $user['id'],
            'body'       => $body,
            'created_at' => date('Y-m-d H:i:s')
        ];

        $id = $commentModel->insert($data);

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Komentar berhasil ditambahkan',
            'data'    => [
                'id'         => $id,
                'body'       => $body,
                'admin'      => ['id' => (int)$user['id'], 'name' => $user['name']],
                'created_at' => $data['created_at']
            ]
        ])->setStatusCode(201);
    }

    public function delete($id)
    {
        $commentModel = new CommentModel();
        $commentModel->delete($id);

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Komentar berhasil dihapus'
        ]);
    }
}
