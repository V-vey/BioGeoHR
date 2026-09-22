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
        Schema::create('loans' , function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->string('loan_type'); //SSS, Pag-IBIG, Company, and Cash Advance
            $table->decimal('total_amount', 10, 2);
            $table->decimal('monthly_deduction', 10, 2);
            $table->decimal('remaining_balance', 10, 2);
            $table->date('start_date');
            $table->string('status')->default('Active');            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
