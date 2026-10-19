<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * payslips.holiday_pay becomes payslips.additional_pay: the pay added on top of the monthly salary for
     * work on a rest day (Sunday) or a holiday (SalaryService::additionalPay). payslips.overtime_pay keeps
     * the pay for hours past 8. The amounts in the column are not touched.
     */
    public function up(): void
    {
        if (Schema::hasColumn('payslips', 'holiday_pay') && !Schema::hasColumn('payslips', 'additional_pay')) {
            Schema::table('payslips', function (Blueprint $table) {
                $table->renameColumn('holiday_pay', 'additional_pay');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('payslips', 'additional_pay') && !Schema::hasColumn('payslips', 'holiday_pay')) {
            Schema::table('payslips', function (Blueprint $table) {
                $table->renameColumn('additional_pay', 'holiday_pay');
            });
        }
    }
};
