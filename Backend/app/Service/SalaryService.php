<?php
namespace App\Service;

//Just for Testing
use Illuminate\Http\Request;

class SalaryService
{
    
    function dailyWage($salaryBasis, $daysPerMonth){
        return $dailyWage = $salaryBasis / $daysPerMonth;
    }

    function hourlyRate($dailyWage, $hrsPerDay){
        return $hrlyRate = $dailyWage / hrsPerDay;
    }

    function lateDeduction(){
        //3 lates = 1 day deduction 
        //find all the user attendance in a month
        $late = Attendance::whereMonth('date', Carbon::now()->month)->where('status', "Late")->count();
        if ($late > 3){
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
    function sssContributionTable(Request $request){
        $salary = $request->salary;
        //Salary is based on monthly salary credit
        $minMSC = 5000.00;
        $maxMSC = 35000.00;
        //Mandatory Provident Fund
        $mpf = $this->mpf($salary);
        //Employees' Compensation is for employer only 
        $ec = 0;
        $employeeCont = $this->employeeCont($salary); // if not greater than 20K
        $employerCont = $this->employerCont($salary);
        
        // deducted the 0.5 and 0.10 of the share
        $employeeMPF = $this->employeeCont($mpf);
        $employerMPF = $this->employerCont($mpf);

        //Employees' Compensation
        $ec = $this->eeCompensation($salary);

        $employeeTotal =  $employeeCont + $employeeMPF; //need for tax in employee
        $employerTotal = $employerCont + $ec + $employerMPF;

        $total = $employeeTotal + $employerTotal;

         return response()->json([
                'salary' => $salary,
                'mpf' => $mpf, 
                'ec' => $ec,
                'Employee Contribution' => $employeeCont, 
                'Employee MPF' => $employeeMPF,
                'Employee Total' => $employeeTotal,
                'Employer Contribution' => $employerCont, 
                'Employer MPF' => $employerMPF,
                'Employer Total' => $employerTotal,
                'Total' => $total]);
    }
    function philHealth($salary){
        return $salary * .025;
    }
    function pagIbig($salary){
        return $salary * .025;
    }
    
    function paycheck($salary){
        $dailyWage = $this->dailyWage($salary);
        $hrRate = $this->hourlyRate($dailyWage);
        //use the user
        $lateDeduction = $this->lateDeduction(); //-1 day if true
        $sss = 1; //the sss table later fix it
        $philHealth = $this->philHealth($salary);
        $pagIbig = $this->pagIbig($salary);
        $tax = $sss + $philHealth + $pagIbig;

        $loan; //unknow i don know later

        $paycheck = $salary - $tax; // this is monthly

        $semiMonth = $paycheck / 2;
    }

}