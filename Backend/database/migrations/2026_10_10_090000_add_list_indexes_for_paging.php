<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The paged lists filter and sort on these columns, so give them indexes
     * (the filters stay fast when there are tens of thousands of rows).
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasIndex('attendances', ['date'])) {
                $table->index('date');
            }
            if (!Schema::hasIndex('attendances', ['status', 'date'])) {
                $table->index(['status', 'date']);
            }
        });

        Schema::table('payslips', function (Blueprint $table) {
            if (!Schema::hasIndex('payslips', ['period_start', 'period_end'])) {
                $table->index(['period_start', 'period_end']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['date']);
            $table->dropIndex(['status', 'date']);
        });
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropIndex(['period_start', 'period_end']);
        });
    }
};
