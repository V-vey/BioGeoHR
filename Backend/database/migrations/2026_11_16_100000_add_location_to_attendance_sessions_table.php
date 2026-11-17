<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Every clock-in (session) of a day has its own place. Before this, only the day had one, the place of the
     * first clock-in, so an employee who clocked in again at another place was still shown, and checked, against
     * the first. Sessions already in the system get the place of their day, which is the only place they had.
     */
    public function up(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->unsignedBigInteger('location_id')->nullable()->after('attendance_id');
            $table->index('location_id');
        });

        DB::statement(
            'UPDATE attendance_sessions s JOIN attendances a ON a.id = s.attendance_id SET s.location_id = a.location_id WHERE s.location_id IS NULL'
        );
    }

    public function down(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->dropIndex(['location_id']);
            $table->dropColumn('location_id');
        });
    }
};
