<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//API
use App\Http\Controllers\API\UsersController;
use App\Http\Controllers\API\SalaryController;
use App\Http\Controllers\API\LocationController;
use App\Http\Controllers\API\LeaveApplicationController;
use App\Http\Controllers\API\LeaveBalanceController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\UserLocationController;

//Auth
use App\Http\Controllers\Auth\LoginAuthController;

//Feature
use App\Http\Controllers\Feature\GeoFenceController;
use App\Http\Controllers\Feature\AttendanceService;

//Test
use App\Service\SalaryService;
Route::apiResource('users', UsersController::class);
// Public routes
Route::post('login', [LoginAuthController::class, 'auth']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('profile', function (Request $request) {
        return $request->user();
    });

    Route::post('logout', [LoginAuthController::class, 'logout']);

    // Route::apiResource('users', UsersController::class);
    Route::apiResource('salary', SalaryController::class);
    Route::apiResource('leave', LeaveApplicationController::class);
    Route::apiResource('balance', LeaveBalanceController::class);
    Route::apiResource('attendance', AttendanceController::class);
    Route::apiResource('userl', UserLocationController::class);

    //clock in and out
    Route::post('clockIn', [AttendanceController::class, 'store']);
    Route::post('clockOut', [AttendanceService::class, 'clockOut']);
    Route::post('geofence', [GeoFenceController::class, 'validationLocation']);

    //late count
    Route::get('countLate', [AttendanceController::class , 'countLate']);

    Route::get('recentAttendance', [AttendanceController::class, 'recentAttendance']);
    
    //can only access by HR
    Route::middleware('role:HR')->group(function () {

    });
    //Testing
    Route::get('test', [AttendanceController::class, 'recentAttendance']);
});

//move to HR later on
Route::apiResource('location', LocationController::class);


