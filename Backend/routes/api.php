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
// use App\Http\Controllers\API\UserLocationController;
use App\Http\Controllers\API\LoanController;
use App\Http\Controllers\API\PasswordController;
use App\Http\Controllers\API\PayslipController;
use App\Http\Controllers\API\SystemSettingController;
use App\Http\Controllers\API\HolidayController;
use App\Http\Controllers\API\AuditLogController;
use App\Http\Controllers\API\NotificationController;
//Auth
use App\Http\Controllers\Auth\LoginAuthController;

//Feature
use App\Http\Controllers\Feature\GeoFenceController;
use App\Http\Controllers\Feature\AttendanceService;

//Test
use App\Service\SalaryService;

// Public routes
Route::post('/login', [LoginAuthController::class, 'auth']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('profile', function (Request $request) {
        return $request->user();
    });

    Route::post('logout', [LoginAuthController::class, 'logout']);

    //clock in and out
    Route::post('clockIn', [AttendanceController::class, 'createAttendance']);
    Route::post('clockIn/gpsOff', [AttendanceController::class, 'gpsOff']);
    Route::post('clockIn/biometricFailed', [AttendanceController::class, 'biometricFailed']);
    Route::post('clockOut', [AttendanceController::class, 'clockOut']);
    Route::get('todayAttendance', [AttendanceController::class, 'today']);
    Route::post('geofence', [GeoFenceController::class, 'validationLocation']);
    Route::get('location', [LocationController::class, 'index']);

    //late count
    Route::get('countLate', [AttendanceController::class , 'countLate']);
    Route::get('countOnTime', [AttendanceController::class, 'countOnTime']);
    Route::get('countAbsent', [AttendanceController::class, 'countAbsent']);
    
    Route::get('recentAttendance', [AttendanceController::class, 'recentAttendance']);
    // Route::get('leave', LeaveApplicationController::class); 
    // Route::post('leave', LeaveApplicationController::class); 
    //attendance
    Route::get('getAllAttendance', [AttendanceController::class, 'show']);

    //profile
    Route::get('userProfile', [UsersController::class , 'userProfileDetails']);
    Route::get('avatars/{filename}', [UsersController::class, 'avatar']);
    Route::post('updateProfile', [UsersController::class, 'updateMyProfile']);
    //password
    Route::post('changePassword', [PasswordController::class , 'update']);

    Route::get('myLoans', [LoanController::class, 'myLoans']);

    //periodic check
    Route::post('geofenceCheck', [GeoFenceController::class, 'periodicCheck']);
    Route::get('systemSettings', [SystemSettingController::class, 'index']);
    
    Route::get('myLeave', [LeaveApplicationController::class, 'myLeave']);
    Route::get('myLeaveBalance', [LeaveBalanceController::class, 'mine']);
    Route::post('applyLeave', [LeaveApplicationController::class, 'store']);
    Route::delete('myLeave/{id}', [LeaveApplicationController::class, 'cancelMine']);

    Route::get('myPayslip', [PayslipController::class, 'mine']);
    Route::get('mySalary', [SalaryController::class, 'mine']);
    //can only access by HR
    Route::middleware('role:Administrative')->group(function () {
        // Route::apiResource('users', UsersController::class);
        Route::get('audit-logs', [AuditLogController::class, 'index']);
        Route::get('notifications/poll', [NotificationController::class, 'poll']);
        Route::apiResource('users', UsersController::class);
        Route::apiResource('salary', SalaryController::class);
        Route::apiResource('leave', LeaveApplicationController::class);
        Route::apiResource('balance', LeaveBalanceController::class);
        // the fixed-name routes go before the resource, or attendance/{id} would swallow them
        Route::get('attendance/export', [AttendanceController::class, 'export']);
        Route::apiResource('attendance', AttendanceController::class);
        Route::post('attendance/sync-absences', [AttendanceController::class, 'syncAbsences']);
        // Route::apiResource('userl', UserLocationController::class);
        Route::patch('users/{id}/active', [UsersController::class, 'setActive']);
        Route::post('users/{id}/resetPassword', [UsersController::class, 'resetPassword']);
        Route::get('loans/paidOffThisPeriod', [LoanController::class, 'paidOffThisPeriod']);
        Route::apiResource('loans', LoanController::class);
        Route::post('loans/{id}/deduct', [LoanController::class, 'deduct']);
        Route::get('user/{userId}', [UsersController::class, 'byUser']);
        // fixed-name route first, or payslips/{payslip} would swallow it
        Route::get('payslips/periods', [PayslipController::class, 'periods']);
        Route::apiResource('payslips', PayslipController::class)->only(['index', 'show']);
        Route::post('payslips/run', [PayslipController::class, 'run']);
        Route::post('payslips/preview', [PayslipController::class, 'preview']);
        Route::get('payroll-report', [PayslipController::class, 'report']);

        Route::get('attendanceCounts', [AttendanceController::class, 'getCounts']);
        Route::get('dashboardEmployees', [AttendanceController::class, 'dashboardEmployees']);
        
        Route::get('weeklyAttendance', [AttendanceController::class, 'weeklyAttendance']);
        
        Route::apiResource('location', LocationController::class)->except(['index']);;
        // Route::get('location', [LocationController::class, "index"]);
        Route::get('flaggedAttendance', [AttendanceController::class, 'flaggedAttendance']);

        // Route::get('systemSettings', [SystemSettingController::class, 'index']);
        Route::get('systemSettings/schedules', [SystemSettingController::class, 'schedules']);
        Route::put('systemSettings/{id}', [SystemSettingController::class, 'update']);
        Route::apiResource('holidays', HolidayController::class)->only(['index', 'store', 'update', 'destroy']);
        
        Route::get('frequentLates', [AttendanceController::class, 'frequentLates']);
    });
    //Testing
    Route::get('test', [AttendanceController::class, 'show']);
});



