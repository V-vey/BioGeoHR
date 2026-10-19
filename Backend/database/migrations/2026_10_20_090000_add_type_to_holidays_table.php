<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * What kind of day a holiday is: it decides the pay.
     *   regular             a regular holiday (200% if worked, paid even if not worked)
     *   special_non_working a special non-working day (130% if worked)
     *   special_working     a special working day (an ordinary workday, nothing special in payroll)
     * Existing holidays stay "regular", which is how they were always paid.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('holidays', 'type')) {
            Schema::table('holidays', function (Blueprint $table) {
                $table->string('type')->default('regular')->after('name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('holidays', 'type')) {
            Schema::table('holidays', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }
    }
};
