<?php

namespace App\Controllers;

use App\Models\ReportModel;
use App\Models\CategoryModel;
use App\Models\UserModel;
use CodeIgniter\API\ResponseTrait;

class Dashboard extends BaseController
{
    use ResponseTrait;

    public function index()
    {
        $reportModel = new ReportModel();
        $categoryModel = new CategoryModel();
        $userModel = new UserModel();

        $totalReports = $reportModel->countAllResults();
        $totalCategories = $categoryModel->countAllResults();
        $totalUsers = $userModel->countAllResults();

        $pending = $reportModel->where('status', 'pending')->countAllResults();
        $diproses = $reportModel->where('status', 'diproses')->countAllResults();
        $selesai = $reportModel->where('status', 'selesai')->countAllResults();

        return $this->response->setJSON([
            'status' => 'success',
            'data'   => [
                'total_reports'     => $totalReports,
                'total_categories'  => $totalCategories,
                'total_users'       => $totalUsers,
                'reports_by_status' => [
                    'pending'  => $pending,
                    'diproses' => $diproses,
                    'selesai'  => $selesai
                ]
            ]
        ]);
    }
}
