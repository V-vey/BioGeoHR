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
        return $salary * $employeeContRate;
    }

    //For employer Contribution of 10%
    function employerCont($salary){
        $employerContRate = .10;
        return $salary * $employerContRate;
    }

    //based on 2025 SSS Contribution Table
    function sssContributionTable(Request $request){
        $salary = $request->salary;
        //Salary is based on monthly salary credit
        $minMSC = 5000.00;
        $maxMSC = 35000.00;
        $mpf = 0;
        //Employees' Compensation is for employer only 
        $ec = 0;
        $employeeCont = $this->employeeCont($salary); // if not greater than 20K
        $employerCont = $this->employerCont($salary);

        //Employees' Compensation
        $ec = $this->eeCompensation($salary);
        if ($salary>20000.00){
            //Mandatory Provident Fund
            $mpf = $salary - 20000.00;
            $employeeCont = $this->employeeCont(20000.00);
            $employerCont = $this->employerCont(20000.00);

            $employeeMPF = $this->employeeCont($mpf);
            $employerMPF = $this->employerCont($mpf);

            $employeeTotal =  $employeeCont + $employeeMPF;
            $employerTotal = $employerCont + $ec + $employerMPF;

            $total = $employeeTotal + $employerTotal;

            return response()->json([
                'mpf' => $mpf, 
                'Employee Contribution' => $employeeCont, 
                'Employee MPF' => $employeeMPF,
                'Employee Total' => $employeeTotal,
                'Employer Contribution' => $employerCont, 
                'Employer MPF' => $employerMPF,
                'Employer Total' => $employerTotal,
                'Total' => $total]);
        };
        $employeeTotal = $employeeCont;
        $employerTotal = $employerCont + $ec;

        $total = $employeeTotal + $employerTotal;

        return response()->json([
                'mpf' => $mpf, 
                'Employee Contribution' => $employeeCont, 
                'Employee Total' => $employeeTotal,
                'Employer Contribution' => $employerCont, 
                'Employer Total' => $employerTotal,
                'Total' => $total]);
    }
    function philHealth($salary){
        return $salary * .025;
    }
    function pagIbig($salary){
        return $salary * .025;
    }
    



}