<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The cutoff that takes the loan's monthly deduction: the school allows either one, so HR picks it for each
     * loan. 'first' is the 1st-15th, 'second' is the 16th to the end of the month. Loans already in the system
     * keep being taken in the 1st-15th, as before.
     */
    public function up(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->string('cutoff', 10)->default('first')->after('monthly_deduction');
        });
    }

    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropColumn('cutoff');
        });
    }
};
