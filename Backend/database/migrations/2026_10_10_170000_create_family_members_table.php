<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * An employee's spouse and children. Shown on the profile only: since the TRAIN law (2018)
     * dependents no longer change the tax withheld, so no payroll calculation reads this table.
     */
    public function up(): void
    {
        if (Schema::hasTable('family_members')) {
            return;
        }
        Schema::create('family_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('relationship', 10); // Spouse or Child
            $table->string('name', 100);
            $table->date('birthday')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_members');
    }
};
