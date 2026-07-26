<?php

namespace App\Service;

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
    //based on 2025 SSS Contribution Table
    function sssContributionTable($salary){
        $minMSC = 5000.00;
        $maxMSC = 35000.00;
        $employeeCont = employeeCont($salary);
        $employerContRate = employerCont($salary);

        if ($salary>20000.00){
            //Mandatory Provident Fund
            $mpf = salary - 20000.00;
            $employeeCont = employeeCont(20000.00);
            $employerCont = employerCont(20000.00);

            $employeeMPF = employeeCont($mpf);
            $employerMPF = employerCont($mpf);

            $employeeTotal =  $employeeCont + $employeeMPF;
        };


    }   
    function employeeCont($salary){
        $employeeContRate = .05;
        return $salary * $employeeContRate;
    }
    function employerCont($salary){
        $employerContRate = .10;
        return $salary * $employerContRate;
    }



}