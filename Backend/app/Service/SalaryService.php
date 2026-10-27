<?php
namespace App\Service;

//Just for Testing
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Salary;
use Carbon\Carbon;
class SalaryService
{
    function absentDays($userId, $periodStart, $periodEnd, $createdAt)
    {
        $start = Carbon::parse($periodStart)->max(Carbon::parse($createdAt)->startOfDay());
        $end   = Carbon::parse($periodEnd)->min(now('Asia/Manila')->subDay());   // today isn't over yet
        $absent = 0;

        foreach ($start->daysUntil($end->copy()->addDay()) as $date) {
            if ($date->isSaturday() || $date->isSunday()) continue;                    // <- working days, see question below
            if (Holiday::where('date', $date->toDateString())->exists()) continue;
            if (Attendance::where('user_id', $userId)->whereDate('date', $date)->exists()) continue;
            $onLeave = LeaveApplication::where('user_id', $userId)
                ->where('status', 'Approved')
                ->whereDate('start_date', '<=', $date)
                ->whereDate('end_date', '>=', $date)->exists();
            if ($onLeave) continue;
            $absent++;
        }
        return $absent;
    }

    function dailyWage($salaryBasis, $daysPerMonth){
        return $dailyWage = $salaryBasis / $daysPerMonth;
    }

    function hourlyRate($dailyWage, $hrsPerDay){
        return $dailyWage / $hrsPerDay;
    }

    function lateDeduction($userId, $periodEnd = null){
        $month = $periodEnd ? Carbon::parse($periodEnd) : Carbon::now();
        $late = Attendance::where('user_id', $userId)
            ->whereYear('date', $month->year)
            ->whereMonth('date', $month->month)
            ->where('status', 'Late')
            ->count();
        return $late >= 3;
    }
    
    // overtime Comment
    
    // DOLE multipliers (Table 7 in the paper)
    const OT_RATES = [
        'regular'                 => 1.25,
        'rest_day'                => 1.69,
        'special_day'             => 1.69,
        'special_day_rest_day'    => 1.95,
        'regular_holiday'         => 2.6,
        'regular_holiday_rest_day'=> 3.38,
    ];
    const REGULAR_RATES =[
        'sunday'                  => 1,
        'regular'                 => 1,
        'rest_day'                => 1,
        'special_day'             => 1.3,
        'special_day_rest_day'    => 1.5,
        'regular_holiday'         => 2,
        'regular_holiday_rest_day'=> 2.6,
    ];

    
    
    // overtime Comment

    //Employees' Compensation
    function eeCompensation($salary){
        if($salary > 14500.00){
            return 30.00;
        }
        return 10.00;
    }
    //For employee Contribution of 5%
    function employeeCont($salary){
        $employeeContRate = .05;
        if ($salary > 20000.00){
            return 20000.00 * $employeeContRate;
        }
        return $salary * $employeeContRate;
    }

    //For employer Contribution of 10%
    function employerCont($salary){
        $employerContRate = .10;
        if ($salary > 20000.00){
            return 20000.00 * $employerContRate;
        }
        return $salary * $employerContRate;
    }
    
    function mpf($salary){
        if ($salary > 20000.00){
            return $salary - 20000;
        }
        return 0;
    }

    //based on 2025 SSS Contribution Table
    function sssContributionTable($monthlySalary){
        $salary = $monthlySalary;
        //Salary is based on monthly salary credit
        $minMSC = 5000.00;
        $maxMSC = 35000.00;

        $msc = max($minMSC, min($salary, $maxMSC));

        //Mandatory Provident Fund
        $mpf = $this->mpf($msc);
        //Employees' Compensation is for employer only 
        $ec = 0;
        $employeeCont = $this->employeeCont($msc); // if not greater than 20K
        $employerCont = $this->employerCont($msc);
        
        // deducted the 0.5 and 0.10 of the share
        $employeeMPF = $this->employeeCont($mpf);
        $employerMPF = $this->employerCont($mpf);

        //Employees' Compensation
        $ec = $this->eeCompensation($msc);

        $employeeTotal =  $employeeCont + $employeeMPF; //need for tax in employee
        $employerTotal = $employerCont + $ec + $employerMPF;

        $total = $employeeTotal + $employerTotal;

         return ([
                'salary' => $salary,
                'msc' => $msc,
                'mpf' => $mpf, 
                'ec' => $ec,
                'employee_contribution' => $employeeCont, 
                'employee_mpf' => $employeeMPF,
                'employee_total' => $employeeTotal,
                'employer_contribution' => $employerCont, 
                'employer_mPF' => $employerMPF,
                'employer_total' => $employerTotal,
                'total' => $total]);
    }
    function philHealth($salary){
        return $salary * .025;
    }
    function pagIbig($salary){
        return $salary * .025;
    } 
    
    function cutoffNetPay($salary, string $cutoff = 'first'){
        if ($cutoff === 'second') {
            // the 16th-end cutoff takes no contributions (SSS, PhilHealth and Pag-IBIG come out of the 1st-15th)
            $half = $salary / 2;

            return round($half - $this->incomeTax($half), 2);
        }

        $contributions = $this->sssContributionTable($salary)['employee_total']
            + $this->philHealth($salary)
            + $this->pagIbig($salary);
        // $semiMonth = ($salary - $contributions) / 2;
        $semiMonth = $salary / 2 - $contributions;

        return round($semiMonth - $this->incomeTax($semiMonth), 2);
    }

    
    function paycheck($salary, $daysPerMonth, $hrsPerDay, $userId, $periodStart = null, $periodEnd = null){
        $dailyWage = $this->dailyWage($salary, $daysPerMonth);
        $hrRate = $this->hourlyRate($dailyWage, $hrsPerDay);
        $lateDeduction = $this->lateDeduction($userId, $periodEnd);

        // first cutoff = period starts on the 1st-15th (no period given = treat as first)
        $firstCutoff = !$periodStart || Carbon::parse($periodStart)->day <= 15;

        $sss        = $firstCutoff ? $this->sssContributionTable($salary)['employee_total'] : 0;
        $philHealth = $firstCutoff ? $this->philHealth($salary) : 0;
        $pagIbig    = $firstCutoff ? $this->pagIbig($salary) : 0;
        $contributions = $sss + $philHealth + $pagIbig;   // full monthly amount, or 0
        
        // $sss = $this->sssContributionTable($salary)['employee_total']; 
        // $philHealth = $this->philHealth($salary);
        // $pagIbig = $this->pagIbig($salary);
        // $contributions = $sss + $philHealth + $pagIbig;

        // $paycheck = $salary - $contributions;
        // if($lateDeduction == true){
        //     $paycheck = $paycheck - $dailyWage;
        // }

        $lateDay  = $lateDeduction ? $dailyWage : 0;
        $paycheck = $salary - $lateDay - $contributions;   
        // overtime Comment
        
        $overtimePay = 0;
        // if ($periodStart && $periodEnd) {
        //     $otHours = $this->overtimeHours($userId, $hrsPerDay, $periodStart, $periodEnd);
        //     $overtimePay = $this->overtimePay($hrRate, $otHours, 'regular');
        // }
        $absenceDeduction = 0;
        $absentDays = 0;
        //rates regular
        $restday = 0;
        $specialDay = 0;
        $specialDayRestDay = 0;
        $regularHoliday = 0;
        $regularHolidayRestDay = 0;

        $additionalPay = 0;
        if ($periodStart && $periodEnd) {
            $absentDays = Attendance::where('user_id', $userId)
                ->where('status', 'Absent')
                ->whereBetween('date', [$periodStart, $periodEnd])
                ->whereNotIn('date', Holiday::nonWorking()->select('date'))   // no one is absent on a holiday
                ->count();

            $additionalPay = $this->additionalPay($userId, $periodStart, $periodEnd, $dailyWage);
            // UNCOMMENT THIS TO ENABLE OVERTIME PAY
            //$overtimePay = $this->overtime($userId, $periodStart, $periodEnd, $hrRate);
            $absenceDeduction = $absentDays * $dailyWage;
           
        }
        // $taxableIncome = ($salary - $contributions) / 2 + $overtimePay + $additionalPay - $absenceDeduction;
        // $taxableIncome = (($salary - $contributions) / 2) - $absenceDeduction;
        // the late day is not paid, so it is not taxed either
        $taxableIncome = ($salary - $lateDay) / 2 - $contributions + $overtimePay + $additionalPay - $absenceDeduction;
        // $semiMonth = ($paycheck / 2) - $absenceDeduction;
        $semiMonth = ($salary - $lateDay) / 2 - $contributions - $absenceDeduction;

        $incomeTax = $this->incomeTax($taxableIncome);
        // overtime Comment
        $netPay = $semiMonth + $overtimePay + $additionalPay - $incomeTax;
        // $netPay = $semiMonth - $incomeTax;
        return [
            'sss' => $sss,
            'philhealth' => $philHealth,
            'pagibig' => $pagIbig,
            'late_deduction' => $lateDeduction ? $dailyWage : 0,
            'net_pay' => $netPay,
            'income_tax' => $incomeTax,
            'absence_deduction' => $absenceDeduction,
            'absent_days' => $absentDays,
            'semi_month' => $semiMonth,
            'paycheck' => $paycheck,
            'taxable_income' => $taxableIncome,
            // overtime Comment
            'overtime_pay' => $overtimePay,
            'additional_pay' => $additionalPay,
        ];
    }

    function incomeTax($taxableIncome)
    {
        if ($taxableIncome <= 10417) {
            return 0;
        } elseif ($taxableIncome <= 16666) {
            return ($taxableIncome - 10417) * 0.15;
        } elseif ($taxableIncome <= 33332) {
            return 937.50 + ($taxableIncome - 16667) * 0.20;
        } elseif ($taxableIncome <= 83332) {
            return 4270.70 + ($taxableIncome - 33333) * 0.25;
        } elseif ($taxableIncome <= 333332) {
            return 16770.70 + ($taxableIncome - 83333) * 0.30;
        } else {
            return 91770.70 + ($taxableIncome - 333333) * 0.35;
        }
    }
    function additionalPay($userId, $periodStart, $periodEnd, $dailyWage){
        $weekend = 'DAYOFWEEK(date) IN (1, 7)';

        // $sundayCount = Attendance::where('user_id', $userId)
        //     ->whereIn('status', ['On-Time', 'Late'])
        //     ->whereRaw($weekend) //saturday
        //     ->whereBetween('date', [$periodStart, $periodEnd])
        //     ->whereNotIn('date', Holiday::nonWorking()->select('date'))
        //     ->count();

        $restdayCount = Attendance::where('user_id', $userId)
            ->whereIn('status', ['On-Time', 'Late'])
            ->whereRaw($weekend) //restday
            ->whereBetween('date', [$periodStart, $periodEnd])
            ->whereNotIn('date', Holiday::select('date')->where('type', '!=', 'special_working'))   // a Sunday holiday is paid as a holiday, not twice
            ->count(); //restday

        $specialDayCount = Attendance::where('user_id', $userId)
            ->whereIn('status', ['On-Time', 'Late'])
            ->whereRaw("NOT ($weekend)") //exclude sunday
            ->whereBetween('date', [$periodStart, $periodEnd])
            ->whereIn('date', Holiday::select('date')->where('type', 'special_non_working'))  
            ->count();
            
        //BOTH REST and SPECIAL
        $specialDayRestDayCount = Attendance::where('user_id', $userId)
            ->whereIn('status', ['On-Time', 'Late'])
            ->whereRaw($weekend)
            ->whereBetween('date', [$periodStart, $periodEnd])
            ->whereIn('date', Holiday::select('date')->where('type', 'special_non_working'))  
            ->count();

        $regularHolidayCount =Attendance::where('user_id', $userId)
            ->whereIn('status', ['On-Time', 'Late'])
            ->whereRaw("NOT ($weekend)")
            ->whereBetween('date', [$periodStart, $periodEnd])
            ->whereIn('date', Holiday::select('date')->where('type', 'regular'))  
            ->count();

        $regularHolidayRestDayCount =Attendance::where('user_id', $userId)
            ->whereIn('status', ['On-Time', 'Late'])
            ->whereRaw($weekend)
            ->whereBetween('date', [$periodStart, $periodEnd])
            ->whereIn('date', Holiday::select('date')->where('type', 'regular'))   
            ->count();

        // $sunday = $sundayCount * ($dailyWage * self::REGULAR_RATES['sunday']);
        $restday =  $restdayCount * ($dailyWage * self::REGULAR_RATES['rest_day']);
        $specialDay =  $specialDayCount * ($dailyWage * (self::REGULAR_RATES['special_day']-1));
        $specialDayRestDay =  $specialDayRestDayCount * ($dailyWage * self::REGULAR_RATES['special_day_rest_day']);
        $regularHoliday =  $regularHolidayCount * ($dailyWage * (self::REGULAR_RATES['regular_holiday']-1));
        $regularHolidayRestDay=  $regularHolidayRestDayCount * ($dailyWage * self::REGULAR_RATES['regular_holiday_rest_day']);
        
        // return $additionalPay = $restday + $sunday + $specialDay + $specialDayRestDay + $regularHoliday + $regularHolidayRestDay;
        return $additionalPay = $restday + $specialDay + $specialDayRestDay + $regularHoliday + $regularHolidayRestDay;
    }
    function overtime($userId, $periodStart, $periodEnd, $hrRate)
    {
        $types = Holiday::whereBetween('date', [$periodStart, $periodEnd])->pluck('type', 'date');
        $userHrs= Salary::where('user_id', $userId)->pluck('working_hours_per_day')->first();
        $days = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$periodStart, $periodEnd])
            ->selectRaw('date, GREATEST(0, (' . Attendance::workedSecondsSql() . ') - ?) / 3600 as ot_hours', [$userHrs * 3600])
            ->get();

        $total = 0;
        foreach ($days as $day) {
            if ($day->ot_hours <= 0) continue;
            $date = Carbon::parse($day->date);
            $type = $types[$date->toDateString()] ?? null;
            $sunday = $date->isWeekend();

            $key = match (true) {
                $type === 'regular' && $sunday             => 'regular_holiday_rest_day',
                $type === 'special_non_working' && $sunday => 'special_day_rest_day',
                $type === 'regular'                        => 'regular_holiday',
                $type === 'special_non_working'            => 'special_day',
                $sunday                                    => 'rest_day',
                default                                    => 'regular',   // ordinary day or special working day
            };
            $total += $day->ot_hours * $hrRate * self::OT_RATES[$key];
        }
        return round($total, 2);
    }

    function overtimePay($hourlyRate, $overtimeHours, $dayType = 'regular'){
        $multiplier = self::OT_RATES[$dayType] ?? self::OT_RATES['regular'];
        return round($hourlyRate * $multiplier * $overtimeHours, 2);
    }

    function overtimeHours($userId, $workingHoursPerDay, $periodStart, $periodEnd){
        $seconds = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$periodStart, $periodEnd])
            ->selectRaw('COALESCE(SUM(GREATEST(0, (' . Attendance::workedSecondsSql() . ') - ?)), 0) as ot',
                        [$workingHoursPerDay * 3600])
            ->value('ot');

        return round($seconds / 3600, 2);
    }
}