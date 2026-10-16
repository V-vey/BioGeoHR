<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('system_settings', 'school_year_start')) {
                $table->date('school_year_start')->nullable()->after('late_grace_period_minutes');
            }
            if (!Schema::hasColumn('system_settings', 'school_year_end')) {
                $table->date('school_year_end')->nullable()->after('school_year_start');
            }
        });
    }

    public function down(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {
            $table->dropColumn(['school_year_start', 'school_year_end']);
        });
    }
};
