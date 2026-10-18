<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The extra pay for holidays the employee worked (kept apart from the overtime / Saturday pay).
     */
    public function up(): void
    {
        if (!Schema::hasColumn('payslips', 'holiday_pay')) {
            Schema::table('payslips', function (Blueprint $table) {
                $table->decimal('holiday_pay', 10, 2)->default(0)->after('overtime_pay');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('payslips', 'holiday_pay')) {
            Schema::table('payslips', function (Blueprint $table) {
                $table->dropColumn('holiday_pay');
            });
        }
    }
};
