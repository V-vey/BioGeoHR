<?php
namespace App\Service;

//Just for Testing
use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;

class SalaryService
{
    
    function dailyWage($salaryBasis, $daysPerMonth){
        return $dailyWage = $salaryBasis / $daysPerMonth;
    }

    function hourlyRate($dailyWage, $hrsPerDay){
        return $dailyWage / $hrsPerDay;
    }

    function lateDeduction($userId){
    $late = Attendance::where('user_id', $userId)
        ->whereMonth('date', Carbon::now()->month)
        ->where('status', 'Late')
        ->count();
    if($late >= 3){
        return true;
    }
    return false;
}

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
    
    function paycheck($salary, $daysPerMonth, $hrsPerDay, $userId){
        $dailyWage = $this->dailyWage($salary, $daysPerMonth);
        $hrRate = $this->hourlyRate($dailyWage, $hrsPerDay);
        $lateDeduction = $this->lateDeduction($userId);
        $sss = $this->sssContributionTable($salary)['employee_total']; 
        $philHealth = $this->philHealth($salary);
        $pagIbig = $this->pagIbig($salary);
        $contributions = $sss + $philHealth + $pagIbig;
        $paycheck = $salary - $contributions; 
        if($lateDeduction == true){
            $paycheck = $paycheck - $dailyWage;
        }

        $taxableIncome = ($salary - $contributions) / 2;
        $semiMonth = $paycheck / 2;

        $incomeTax = $this->incomeTax($taxableIncome);
        $netPay = $semiMonth - $incomeTax;
        return [
            'sss' => $sss,
            'philhealth' => $philHealth,
            'pagibig' => $pagIbig,
            'late_deduction' => $lateDeduction ? $dailyWage : 0,
            'net_pay' => $netPay,
            'income_tax' => $incomeTax,
            'semi_month' => $semiMonth,
            'paycheck' => $paycheck,
            'taxable_income' => $taxableIncome
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
}