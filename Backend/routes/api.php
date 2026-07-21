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

    Route::post('geofence', [GeoFenceController::class, 'validationLocation']);
});
Route::apiResource('location', LocationController::class);
