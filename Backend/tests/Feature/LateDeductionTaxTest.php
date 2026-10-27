<?php

use App\Models\Attendance;
use App\Models\Users;
use App\Service\SalaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Three lates in a month take one day's pay, half in each cutoff. That half day is not paid,
// so it is not taxed either. ₱30,000 a month, 26 days, Oct 1-15:
//   SSS 1,500 + PhilHealth 750 + Pag-IBIG 750 = 3,000
//   no lates:    taxable 15,000 - 3,000 = 12,000.00 -> tax 237.45
//   three lates: taxable 15,000 - 576.92 - 3,000 = 11,423.08 -> tax 150.91

beforeEach(function () {
    $this->emp = Users::create([
        'name' => 'Rhea Navarro', 'email' => 'rhea@school.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Female',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

it('taxes the full half month when there are fewer than three lates', function () {
    $pay = (new SalaryService())->paycheck(30000, 26, 8, $this->emp->id, '2026-10-01', '2026-10-15');

    expect($pay['late_deduction'])->toEqual(0);
    expect($pay['taxable_income'])->toEqualWithDelta(12000.00, 0.01);
    expect($pay['income_tax'])->toEqualWithDelta(237.45, 0.01);
});

it('leaves the unpaid late day out of the taxable income', function () {
    foreach (['2026-10-05', '2026-10-06', '2026-10-07'] as $date) {
        Attendance::create(['user_id' => $this->emp->id, 'date' => $date, 'status' => 'Late', 'time_in' => '07:45:00']);
    }

    $pay = (new SalaryService())->paycheck(30000, 26, 8, $this->emp->id, '2026-10-01', '2026-10-15');

    expect($pay['taxable_income'])->toEqualWithDelta(11423.08, 0.01);
    expect($pay['income_tax'])->toEqualWithDelta(150.91, 0.01);
    expect($pay['net_pay'])->toEqualWithDelta(15000 - 576.92 - 3000 - 150.91, 0.01);
});
