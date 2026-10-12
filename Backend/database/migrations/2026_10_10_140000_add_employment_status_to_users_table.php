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
        if (Schema::hasColumn('users', 'employment_status')) {
            return;
        }
        Schema::table('users', function (Blueprint $table) {
            // Contractual or Permanent. Empty for accounts made before this existed; HR sets it in Edit Profile.
            $table->string('employment_status', 20)->nullable()->after('contract_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'employment_status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('employment_status');
            });
        }
    }
};
