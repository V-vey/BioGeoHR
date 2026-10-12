<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * One attendance row is still one employee on one day (it keeps the first clock-in and its
     * Late / On-Time status). Each in/out pair of that day is a session, so an employee can clock
     * in again after clocking out and the hours are added up.
     */
    public function up(): void
    {
        if (Schema::hasTable('attendance_sessions')) {
            return;
        }
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_id')->constrained('attendances')->cascadeOnDelete();
            $table->time('time_in');
            $table->time('time_out')->nullable(); // empty while the employee is still clocked in
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_sessions');
    }
};
