<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Categories extends ResourceController
{
    protected $modelName = 'App\Models\CategoryModel';
    protected $format    = 'json';

    public function index()
    {
        $data = $this->model->findAll();
        return $this->response->setJSON([
            'status' => 'success',
            'data'   => $data
        ]);
    }

    public function create()
    {
        $rules = [
            'name' => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        // support json body
        $json = $this->request->getJSON();
        $name = $json->name ?? $this->request->getVar('name');
        $desc = $json->description ?? $this->request->getVar('description');

        $data = [
            'name'        => $name,
            'description' => $desc,
            'created_at'  => date('Y-m-d H:i:s')
        ];

        $id = $this->model->insert($data);
        $data['id'] = $id;

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Kategori berhasil ditambahkan',
            'data'    => $data
        ])->setStatusCode(201);
    }

    public function update($id = null)
    {
        $json = $this->request->getJSON();
        $input = $this->request->getRawInput();

        $name = $json->name ?? $input['name'] ?? null;
        $desc = $json->description ?? $input['description'] ?? null;

        $data = [];
        if ($name !== null) $data['name'] = $name;
        if ($desc !== null) $data['description'] = $desc;

        if (!empty($data)) {
            $this->model->update($id, $data);
        }

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Kategori berhasil diupdate'
        ]);
    }

    public function delete($id = null)
    {
        $this->model->delete($id);
        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Kategori berhasil dihapus'
        ]);
    }
}
