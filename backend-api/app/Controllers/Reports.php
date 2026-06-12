<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\CategoryModel;
use App\Models\UserModel;
use App\Models\CommentModel;

class Reports extends ResourceController
{
    protected $modelName = 'App\Models\ReportModel';
    protected $format    = 'json';

    public function index()
    {
        $status = $this->request->getVar('status');
        $categoryId = $this->request->getVar('category_id');

        $query = $this->model->select('reports.*, categories.name as category_name, users.name as user_name')
                             ->join('categories', 'categories.id = reports.category_id', 'left')
                             ->join('users', 'users.id = reports.user_id', 'left')
                             ->orderBy('reports.created_at', 'DESC');

        if ($status) {
            $query->where('reports.status', $status);
        }

        if ($categoryId) {
            $query->where('reports.category_id', $categoryId);
        }

        $data = $query->findAll();
        
        $formattedData = [];
        foreach($data as $row) {
            $row['category'] = ['id' => (int)$row['category_id'], 'name' => $row['category_name']];
            $row['user'] = ['id' => (int)$row['user_id'], 'name' => $row['user_name']];
            unset($row['category_name'], $row['user_name']);
            $formattedData[] = $row;
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data'   => $formattedData,
            'total'  => count($formattedData)
        ]);
    }

    public function show($id = null)
    {
        $row = $this->model->select('reports.*, categories.name as category_name, users.name as user_name')
                             ->join('categories', 'categories.id = reports.category_id', 'left')
                             ->join('users', 'users.id = reports.user_id', 'left')
                             ->find($id);

        if (!$row) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan'
            ])->setStatusCode(404);
        }

        $row['category'] = ['id' => (int)$row['category_id'], 'name' => $row['category_name']];
        $row['user'] = ['id' => (int)$row['user_id'], 'name' => $row['user_name']];
        unset($row['category_name'], $row['user_name']);

        $commentModel = new CommentModel();
        $comments = $commentModel->select('comments.*, users.name as admin_name')
                                 ->join('users', 'users.id = comments.admin_id', 'left')
                                 ->where('report_id', $id)
                                 ->findAll();
        
        $formattedComments = [];
        foreach($comments as $c) {
            $c['admin'] = ['id' => (int)$c['admin_id'], 'name' => $c['admin_name']];
            unset($c['admin_name']);
            $formattedComments[] = $c;
        }
        
        $row['comments'] = $formattedComments;

        return $this->response->setJSON([
            'status' => 'success',
            'data'   => $row
        ]);
    }

    public function create()
    {
        $rules = [
            'title'       => 'required',
            'description' => 'required',
            'category_id' => 'required',
            'location'    => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $imagePath = null;
        $imageFile = $this->request->getFile('image');
        
        if ($imageFile && $imageFile->isValid() && !$imageFile->hasMoved()) {
            // ensure uploads dir exists
            if (!is_dir(FCPATH . 'uploads')) {
                mkdir(FCPATH . 'uploads', 0777, true);
            }
            $newName = $imageFile->getRandomName();
            $imageFile->move(FCPATH . 'uploads', $newName);
            $imagePath = 'uploads/' . $newName;
        }

        $userId = $this->request->getVar('user_id');
        if (!$userId) {
            $userModel = new UserModel();
            $pelapor = $userModel->where('role', 'pelapor')->first();
            if ($pelapor) {
                $userId = $pelapor['id'];
            } else {
                $userId = 1; 
            }
        }

        $data = [
            'user_id'     => $userId,
            'category_id' => $this->request->getVar('category_id'),
            'title'       => $this->request->getVar('title'),
            'description' => $this->request->getVar('description'),
            'location'    => $this->request->getVar('location'),
            'image'       => $imagePath,
            'status'      => 'pending'
        ];

        $id = $this->model->insert($data);

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Laporan berhasil dikirim',
            'data'    => ['id' => $id, 'status' => 'pending']
        ])->setStatusCode(201);
    }

    public function update($id = null)
    {
        $json = $this->request->getJSON();
        $input = $this->request->getRawInput();
        
        $data = [];
        $status = $json->status ?? $input['status'] ?? null;
        $title = $json->title ?? $input['title'] ?? null;
        $desc = $json->description ?? $input['description'] ?? null;
        $cat = $json->category_id ?? $input['category_id'] ?? null;
        $loc = $json->location ?? $input['location'] ?? null;

        if ($status !== null) $data['status'] = $status;
        if ($title !== null) $data['title'] = $title;
        if ($desc !== null) $data['description'] = $desc;
        if ($cat !== null) $data['category_id'] = $cat;
        if ($loc !== null) $data['location'] = $loc;

        if (!empty($data)) {
            $this->model->update($id, $data);
        }

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Laporan berhasil diupdate'
        ]);
    }

    public function delete($id = null)
    {
        $this->model->delete($id);
        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Laporan berhasil dihapus'
        ]);
    }
}
