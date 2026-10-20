<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The pay lost to absences, and how many days that was, saved with each payslip so it can be shown as its
     * own line. They are nullable on purpose: a payslip made before these columns existed has no value, and the
     * pages read that as "an older payslip" (its contributions are stored as monthly amounts, see PayslipsOutlet).
     */
    public function up(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->decimal('absence_deduction', 10, 2)->nullable()->after('late_deduction');
            $table->unsignedSmallInteger('absent_days')->nullable()->after('absence_deduction');
        });
    }

    public function down(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropColumn(['absence_deduction', 'absent_days']);
        });
    }
};
