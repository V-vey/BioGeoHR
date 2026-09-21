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
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->integer('sick')->default(0);
            $table->integer('vacation')->default(0);
            $table->integer('emergency')->default(0);
            $table->integer('birthday')->default(0);
            $table->integer('solo_parent')->default(0);
            $table->integer('paternity')->default(0);
            $table->integer('maternity')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_balances');
    }
};
