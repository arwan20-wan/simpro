<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\ActivityLogController;
use App\Http\Controllers\Api\Admin\EmployeeController;
use App\Http\Controllers\Api\PJ\ProjectController;
use App\Http\Controllers\Api\PJ\DailyReportController;
use App\Http\Controllers\Api\PJ\ProjectPhotoController;
use App\Http\Controllers\Api\PJ\FinancialTransactionController;
use App\Http\Controllers\Api\GM\ReportController as GMReportController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'loginAdmin']);

Route::middleware('auth.token')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile-photo', [AuthController::class, 'updateProfilePhoto']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('admin')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::put('/employees/{user}', [EmployeeController::class, 'update']);
        Route::delete('/employees/{user}', [EmployeeController::class, 'destroy']);
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    });

    Route::prefix('pj')->group(function () {
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::get('/projects/summary', [ProjectController::class, 'summary']);
        Route::get('/responsible-people', [ProjectController::class, 'responsiblePeople']);
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::get('/projects/{project}', [ProjectController::class, 'show']);
        Route::put('/projects/{project}', [ProjectController::class, 'update']);
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

        Route::get('/projects/{project}/daily-reports', [DailyReportController::class, 'index']);
        Route::post('/projects/{project}/daily-reports', [DailyReportController::class, 'store']);
        Route::get('/projects/{project}/daily-reports/{dailyReport}', [DailyReportController::class, 'show']);
        Route::put('/projects/{project}/daily-reports/{dailyReport}', [DailyReportController::class, 'update']);
        Route::delete('/projects/{project}/daily-reports/{dailyReport}', [DailyReportController::class, 'destroy']);

        Route::post('/projects/{project}/daily-reports/{dailyReport}/photos', [ProjectPhotoController::class, 'store']);
        Route::delete('/projects/{project}/photos/{photo}', [ProjectPhotoController::class, 'destroy']);

        // Finance endpoints
        Route::get('/finance/summary', [FinancialTransactionController::class, 'summary']);
        Route::get('/finance/transactions', [FinancialTransactionController::class, 'index']);
        Route::post('/finance/transactions', [FinancialTransactionController::class, 'store']);
        Route::get('/finance/transactions/{transaction}/receipt', [FinancialTransactionController::class, 'viewReceipt']);
        Route::get('/finance/transactions/{transaction}/receipt/download', [FinancialTransactionController::class, 'downloadReceipt']);
    });

    Route::prefix('gm')->group(function () {
        Route::get('/dashboard', [GMReportController::class, 'dashboard']);
        Route::get('/reports/projects', [GMReportController::class, 'projects']);
        Route::get('/reports/daily', [GMReportController::class, 'dailyReports']);
        Route::get('/reports/finance', [GMReportController::class, 'financialReports']);
        Route::get('/reports/finance/{transaction}/download', [GMReportController::class, 'downloadFinancialReport']);
    });
});
