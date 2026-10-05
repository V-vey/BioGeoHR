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
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('email')->nullable()->after('user_id');
            $table->string('category')->default('admin')->after('email');
            $table->string('status')->default('success')->after('action');
        });
    }
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn(['email', 'category', 'status']);
        });
    }
};
