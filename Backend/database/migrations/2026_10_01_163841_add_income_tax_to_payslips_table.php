<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('payslips', function (Blueprint $table) {
        $table->decimal('income_tax', 10, 2)->default(0);
    });
}

public function down(): void
{
    Schema::table('payslips', function (Blueprint $table) {
        $table->dropColumn('income_tax');
    });
}
};
