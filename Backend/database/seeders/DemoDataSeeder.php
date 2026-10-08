<?php

namespace Database\Seeders;

use App\Http\Controllers\API\PayslipController;
use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Holiday;
use App\Models\LeaveApplication;
use App\Models\LeaveBalance;
use App\Models\Loan;
use App\Models\Location;
use App\Models\Salary;
use App\Models\SystemSetting;
use App\Models\Users;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * A complete, believable demo data set for BioGeo HR (the defense).
 *
 *   php artisan db:seed --class=DemoDataSeeder
 *
 * Run it on EMPTY tables (the wipe script truncates them first). It creates, in this order:
 * settings, geofence locations, holidays, employees (+ salary + leave balance), attendance for
 * 1 Sep - 7 Oct 2026, leave requests (approved / pending / rejected), loans, flagged attendance,
 * the September payroll (run through the real PayslipController) and a few audit entries.
 *
 * Every demo account uses the password below. The same random seed is used every time, so
 * the data comes out identical on each run.
 */
class DemoDataSeeder extends Seeder
{
    /** Password of every account this seeder creates. */
    const PASSWORD = 'password123';

    // the days the demo covers (the system's "today" is 8 Oct 2026)
    const FROM = '2026-09-01';
    const TO = '2026-10-07';

    private array $locationIds = [];

    public function run(): void
    {
        Model::unguard(); // a seeder writes any column
        mt_srand(20261008); // same "random" attendance every run

        $this->settings();
        $this->locations();
        $this->holidays();

        $people = $this->employees();
        $leaves = $this->leaves($people);
        $this->attendance($people, $leaves);
        $this->loans($people);
        $this->flagged();
        $this->payroll();
        $this->audit($people);
        Model::reguard();
    }

    private function settings(): void
    {
        SystemSetting::create([
            'late_grace_period_minutes' => 15,
            'geofence_check_interval_minutes' => 15,
        ]);
    }

    // the geofence places the team already uses (name, longitude, latitude, radius in metres)
    private function locations(): void
    {
        $rows = [
            ['Home', 120.5979000, 15.4827000, 100],
            ['Home 2', 120.6050000, 15.4900000, 100],
            ['Real Home', 120.6080548, 15.5545120, 100],
            ['Malapit Bahay part 2', 120.6070896, 15.5547483, 100],
            ['Sean', 120.6100852, 15.4866375, 200],
            ['Regin', 120.5878773, 15.6714033, 200],
            ['Jeem', 120.5745344, 15.6648656, 200],
        ];
        foreach ($rows as [$name, $lng, $lat, $radius]) {
            $this->locationIds[] = Location::create([
                'name' => $name, 'longitude' => $lng, 'latitude' => $lat, 'radius' => $radius,
            ])->id;
        }
    }

    private function holidays(): void
    {
        $rows = [
            '2026-10-01' => 'Eidul Fitr',
            '2026-10-31' => 'Additional Special Day',
            '2026-11-01' => 'All Saints Day',
            '2026-11-30' => 'Bonifacio Day',
            '2026-12-08' => 'Feast of the Immaculate Conception',
            '2026-12-25' => 'Christmas Day',
            '2026-12-30' => 'Rizal Day',
            '2026-12-31' => 'Last Day of the Year',
        ];
        foreach ($rows as $date => $name) {
            Holiday::create(['date' => $date, 'name' => $name]);
        }
    }

    /**
     * name, email, contact, department, position, call_time, contract, birth date, gender,
     * address, monthly salary, active?
     * Returns [email => ['user' => Users, 'location' => id]].
     */
    private function employees(): array
    {
        $rows = [
            // the web admin login and the phone test account (the wipe script puts their real details back)
            ['Admin HR', 'hr@biogeohr.test', '09000000000', 'Administrative', 'HR Administrator', '08:00:00', 'Regular', '1990-01-01', 'Other', 'N/A', 38000, true],
            ['R V Test', 'test@test.com', '09617989691', 'Administrator', 'HR Tech', '07:00:00', 'Regular', '2004-12-28', 'Male', 'Diko Alam Gerona Tarlac', 20000, true],

            ['Jasmine Ocampo', 'jasmine.ocampo@biogeohr.test', '09171234501', 'Administrative', 'HR Staff', '08:00:00', 'Regular', '1993-03-14', 'Female', 'San Miguel, Tarlac City', 29000, true],
            ['Maria Santos', 'maria.santos@biogeohr.test', '09171234502', 'Academic', 'Teacher I', '07:30:00', 'Regular', '1991-07-22', 'Female', 'Maliwalo, Tarlac City', 28000, true],
            ['Jose Dela Cruz', 'jose.delacruz@biogeohr.test', '09171234503', 'Academic', 'Teacher II', '07:30:00', 'Regular', '1988-11-05', 'Male', 'Sto. Cristo, Tarlac City', 32000, true],
            ['Ana Reyes', 'ana.reyes@biogeohr.test', '09171234504', 'Academic', 'Teacher I', '07:30:00', 'Probationary', '1998-02-17', 'Female', 'Poblacion, Gerona, Tarlac', 24000, true],
            ['Carlo Mendoza', 'carlo.mendoza@biogeohr.test', '09171234505', 'Academic', 'Teacher III', '07:30:00', 'Regular', '1985-09-30', 'Male', 'Matatalaib, Tarlac City', 36000, true],
            ['Liza Garcia', 'liza.garcia@biogeohr.test', '09171234506', 'Basic Education', 'Grade School Teacher', '07:30:00', 'Regular', '1990-12-01', 'Female', 'Paraiso, Tarlac City', 27000, true],
            ['Paolo Ramos', 'paolo.ramos@biogeohr.test', '09171234507', 'Basic Education', 'Teacher I', '07:30:00', 'Probationary', '1999-05-19', 'Male', 'Bamban, Tarlac', 23000, true],
            ['Grace Villanueva', 'grace.villanueva@biogeohr.test', '09171234508', 'Finance', 'Accountant', '08:00:00', 'Regular', '1987-04-08', 'Female', 'San Vicente, Tarlac City', 35000, true],
            ['Mark Bautista', 'mark.bautista@biogeohr.test', '09171234509', 'Finance', 'Cashier', '08:00:00', 'Regular', '1992-10-27', 'Male', 'Armenia, Tarlac City', 26000, true],
            ['Rhea Navarro', 'rhea.navarro@biogeohr.test', '09171234510', 'Guidance', 'Guidance Counselor', '08:00:00', 'Regular', '1989-01-12', 'Female', 'Binauganan, Tarlac City', 30000, true],
            ['Kevin Aquino', 'kevin.aquino@biogeohr.test', '09171234511', 'IT', 'IT Staff', '08:00:00', 'Regular', '1995-06-03', 'Male', 'Culipat, Tarlac City', 33000, true],
            ['Nestor Pascual', 'nestor.pascual@biogeohr.test', '09171234512', 'Maintenance', 'Maintenance Staff', '06:30:00', 'Regular', '1980-08-15', 'Male', 'Zamora, Tarlac City', 18500, true],
            ['Rosa Torres', 'rosa.torres@biogeohr.test', '09171234513', 'Maintenance', 'Utility', '06:30:00', 'Regular', '1983-02-25', 'Female', 'Sapang Maragul, Tarlac City', 18000, true],
            // deactivated on 20 Sep: shows the Deactivate / Reactivate feature
            ['Dante Cabrera', 'dante.cabrera@biogeohr.test', '09171234514', 'Maintenance', 'Utility', '06:30:00', 'Regular', '1986-09-09', 'Male', 'Villa Bacolor, Tarlac City', 18000, false],
        ];

        $credits = ['sick' => 2, 'vacation' => 2, 'emergency' => 2, 'birthday' => 1, 'solo_parent' => 7, 'paternity' => 7, 'maternity' => 120];
        $none = array_map(fn () => 0, $credits);
        $joined = Carbon::parse('2026-09-01 08:00:00');

        $people = [];
        foreach ($rows as $i => [$name, $email, $contact, $dept, $position, $call, $contract, $dob, $gender, $address, $salary, $active]) {
            $user = Users::create([
                'name' => $name, 'email' => $email, 'contact_number' => $contact,
                'password' => self::PASSWORD,
                'department' => $dept, 'position' => $position, 'call_time' => $call,
                'contract_type' => $contract, 'date_of_birth' => $dob, 'gender' => $gender,
                'nationality' => 'Filipino', 'address' => $address, 'is_active' => $active,
            ]);
            // the accounts are "new" as of 1 Sep, so attendance and absences count from then
            DB::table('users')->where('id', $user->id)->update(['created_at' => $joined, 'updated_at' => $joined]);

            Salary::create([
                'user_id' => $user->id, 'salary_basis' => $salary,
                'working_hours_per_day' => 8, 'working_days_per_month' => 22,
            ]);
            // one row per employee: Regular staff get the school's credits, probationary none yet
            LeaveBalance::create(['user_id' => $user->id] + ($contract === 'Regular' ? $credits : $none));

            $people[$email] = ['user' => $user, 'location' => $this->locationIds[$i % count($this->locationIds)]];
        }
        return $people;
    }

    /**
     * [email, type, start, end, status, reason, remarks, submitted on]
     * Approved ones take days off the balance and leave no attendance row on those days.
     * Returns the days each employee is on approved leave: [email => ['2026-09-09' => true, ...]].
     */
    private function leaves(array $people): array
    {
        $rows = [
            // approved, in the past
            ['maria.santos@biogeohr.test', 'Sick Leave', '2026-09-09', '2026-09-09', 'Approved', 'Fever and cough, the doctor advised rest.', 'Approved. Get well soon.', '2026-09-09'],
            ['jose.delacruz@biogeohr.test', 'Vacation Leave', '2026-09-22', '2026-09-23', 'Approved', 'Family reunion out of town.', 'Enjoy your trip.', '2026-09-14'],
            ['liza.garcia@biogeohr.test', 'Emergency Leave', '2026-09-17', '2026-09-17', 'Approved', 'A water pipe burst at home.', 'Approved. Please settle it safely.', '2026-09-17'],
            ['carlo.mendoza@biogeohr.test', 'Birthday Leave', '2026-09-30', '2026-09-30', 'Approved', 'Birthday leave.', null, '2026-09-24'],
            ['test@test.com', 'Sick Leave', '2026-09-24', '2026-09-24', 'Approved', 'Migraine, could not work.', 'Approved. Take care.', '2026-09-24'],
            ['rhea.navarro@biogeohr.test', 'Vacation Leave', '2026-10-05', '2026-10-05', 'Approved', 'Personal errand at the city hall.', null, '2026-09-28'],
            // rejected
            ['jose.delacruz@biogeohr.test', 'Emergency Leave', '2026-09-30', '2026-09-30', 'Rejected', 'Family matter out of town.', 'Not enough coverage that week. Please file a vacation leave instead.', '2026-09-29'],
            // pending, waiting for HR
            ['grace.villanueva@biogeohr.test', 'Vacation Leave', '2026-10-14', '2026-10-15', 'Pending', 'Visiting my parents in Pangasinan.', null, '2026-10-06'],
            ['kevin.aquino@biogeohr.test', 'Emergency Leave', '2026-10-12', '2026-10-12', 'Pending', 'Need to renew my passport on that day.', null, '2026-10-07'],
            ['mark.bautista@biogeohr.test', 'Birthday Leave', '2026-10-16', '2026-10-16', 'Pending', 'Birthday leave.', null, '2026-10-05'],
            ['test@test.com', 'Vacation Leave', '2026-10-19', '2026-10-19', 'Pending', 'Family outing.', null, '2026-10-07'],
            ['maria.santos@biogeohr.test', 'Vacation Leave', '2026-10-20', '2026-10-20', 'Pending', 'Enrollment of my child.', null, '2026-10-08'],
            ['jasmine.ocampo@biogeohr.test', 'Sick Leave', '2026-10-13', '2026-10-13', 'Pending', 'Dental surgery.', null, '2026-10-08'],
        ];
        $column = [
            'Sick Leave' => 'sick', 'Vacation Leave' => 'vacation', 'Emergency Leave' => 'emergency',
            'Birthday Leave' => 'birthday', 'Solo Parent Leave' => 'solo_parent',
            'Paternity Leave' => 'paternity', 'Maternity Leave' => 'maternity',
        ];

        $onLeave = [];
        foreach ($rows as [$email, $type, $start, $end, $status, $reason, $remarks, $submitted]) {
            $user = $people[$email]['user'];
            $balance = LeaveBalance::where('user_id', $user->id)->first();
            $when = Carbon::parse($submitted . ' 09:30:00');

            $leave = LeaveApplication::create([
                'user_id' => $user->id, 'leave_balance_id' => $balance->id,
                'leave_type' => $type, 'start_date' => $start, 'end_date' => $end,
                'reason' => $reason, 'status' => $status, 'remarks' => $remarks,
            ]);
            DB::table('leave_applications')->where('id', $leave->id)->update(['created_at' => $when, 'updated_at' => $when]);

            if ($status === 'Approved') {
                $days = (int) Carbon::parse($start)->diffInDays(Carbon::parse($end)) + 1;
                $balance->decrement($column[$type], $days);
                foreach (CarbonPeriod::create($start, $end) as $d) { // both ends included
                    $onLeave[$email][$d->toDateString()] = true;
                }
            }
        }
        return $onLeave;
    }

    private function attendance(array $people, array $onLeave): void
    {
        $holidays = Holiday::pluck('date')->map(fn ($d) => substr((string) $d, 0, 10))->all();
        $deactivated = Carbon::parse('2026-09-20');

        foreach ($people as $email => $p) {
            $user = $p['user'];
            $grace = 15;
            [$h, $m] = array_map('intval', explode(':', $user->call_time));
            $callMinutes = $h * 60 + $m;

            foreach (CarbonPeriod::create(self::FROM, self::TO) as $day) { // both ends included
                $date = $day->toDateString();
                if ($day->isWeekend() || in_array($date, $holidays, true)) continue;      // no work
                if (isset($onLeave[$email][$date])) continue;                              // on approved leave
                if (!$user->is_active && $day->gte($deactivated)) continue;                // deactivated

                $roll = mt_rand(1, 100);
                if ($roll <= 4) {                                                          // absent
                    Attendance::create(['user_id' => $user->id, 'status' => 'Absent', 'date' => $date]);
                    continue;
                }

                if ($roll <= 16) {                                                         // late
                    $in = $callMinutes + mt_rand($grace + 1, 55);
                    $status = 'Late';
                } else {                                                                   // on time
                    $in = $callMinutes + mt_rand(-12, $grace - 1); // up to 14:59 after start = still on time
                    $status = 'On-Time';
                }
                $out = $in + 8 * 60 + mt_rand(-15, 70);

                Attendance::create([
                    'user_id' => $user->id, 'location_id' => $p['location'],
                    'status' => $status, 'date' => $date,
                    'time_in' => $this->clock($in), 'time_out' => $this->clock($out),
                ]);
            }
        }
    }

    // minutes since midnight -> "07:38:21" (random seconds, like a real clock-in)
    private function clock(int $minutes): string
    {
        return sprintf('%02d:%02d:%02d', intdiv($minutes, 60), $minutes % 60, mt_rand(0, 59));
    }

    private function loans(array $people): void
    {
        $rows = [
            // email, type, total, monthly, start date
            ['mark.bautista@biogeohr.test', 'Company', 6000, 1000, '2026-09-10'],
            ['nestor.pascual@biogeohr.test', 'SSS', 12000, 1500, '2026-08-20'],
            ['rosa.torres@biogeohr.test', 'Cash Advance', 1500, 1500, '2026-09-20'],
            ['maria.santos@biogeohr.test', 'Pag-IBIG', 9000, 1500, '2026-10-05'],
        ];
        foreach ($rows as [$email, $type, $total, $monthly, $start]) {
            Loan::create([
                'user_id' => $people[$email]['user']->id, 'loan_type' => $type,
                'total_amount' => $total, 'monthly_deduction' => $monthly,
                'remaining_balance' => $total, 'start_date' => $start, 'status' => 'Active',
            ]);
        }
    }

    // a few clock-ins where the phone was outside the geofence for a while
    private function flagged(): void
    {
        // every 7th late day of the first 40, so they are spread over different people and dates
        $late = Attendance::where('status', 'Late')->whereNotNull('time_out')
            ->orderBy('date')->limit(40)->get()
            ->values()->filter(fn ($a, $i) => $i % 7 === 0);
        foreach ($late as $a) {
            $date = substr((string) $a->date, 0, 10);
            $out = Carbon::parse($date . ' ' . $a->time_in)->addMinutes(mt_rand(120, 200));
            DB::table('flagged_attendances')->insert([
                'attendance_id' => $a->id,
                'out_at' => $out, 'in_at' => $out->copy()->addMinutes(mt_rand(12, 30)),
                'created_at' => $out, 'updated_at' => $out,
            ]);
        }
    }

    // the whole of September, through the same code the Run Payroll page uses
    private function payroll(): void
    {
        foreach ([['2026-09-01', '2026-09-15'], ['2026-09-16', '2026-09-30']] as [$start, $end]) {
            app(PayslipController::class)->run(Request::create('/api/payslips/run', 'POST', [
                'period_start' => $start, 'period_end' => $end,
            ]));
        }
    }

    private function audit(array $people): void
    {
        $hr = $people['hr@biogeohr.test']['user'];
        $rows = [
            ['2026-09-01 08:05:00', 'login', 'login', 'success', null, $hr],
            ['2026-09-01 08:20:00', 'admin', 'employee_created', 'success', 'Maria Santos', $hr],
            ['2026-09-01 08:22:00', 'admin', 'employee_created', 'success', 'Jose Dela Cruz', $hr],
            ['2026-09-01 08:25:00', 'admin', 'employee_created', 'success', 'Kevin Aquino', $hr],
            ['2026-09-09 15:10:00', 'admin', 'leave_approved', 'success', 'Sick Leave, 1 day(s). Approved. Get well soon.', $hr],
            ['2026-09-18 09:00:00', 'admin', 'leave_approved', 'success', 'Emergency Leave, 1 day(s)', $hr],
            ['2026-09-20 17:30:00', 'admin', 'employee_deactivated', 'success', 'Dante Cabrera', $hr],
            ['2026-09-29 10:45:00', 'admin', 'leave_rejected', 'success', 'Emergency Leave. Not enough coverage that week.', $hr],
            ['2026-10-06 09:12:00', 'login', 'login', 'failed', 'Wrong password', $hr],
            ['2026-10-06 09:13:00', 'login', 'login', 'success', null, $hr],
            ['2026-10-07 14:02:00', 'check_in', 'geofence_check', 'failed', 'Out of range at Real Home: 438 m', $people['test@test.com']['user']],
            ['2026-10-07 14:05:00', 'check_in', 'clock_in', 'success', 'On-Time at Real Home', $people['test@test.com']['user']],
        ];
        foreach ($rows as [$when, $category, $action, $status, $details, $user]) {
            $log = AuditLog::create([
                'user_id' => $user->id, 'email' => $user->email, 'category' => $category,
                'action' => $action, 'status' => $status, 'description' => $details,
                'ip_address' => '127.0.0.1',
            ]);
            DB::table('audit_logs')->where('id', $log->id)->update(['created_at' => $when, 'updated_at' => $when]);
        }
    }
}
