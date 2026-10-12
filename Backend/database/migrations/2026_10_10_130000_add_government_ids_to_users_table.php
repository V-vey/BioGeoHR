<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $columns = ['tin', 'sss_number', 'philhealth_number', 'pagibig_number'];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // The numbers government forms ask for. All optional (a new hire may not have them all yet)
            // and unique, because each one belongs to one person. Stored with dashes, e.g. 123-456-789-000.
            if (!Schema::hasColumn('users', 'tin')) {
                $table->string('tin', 15)->nullable()->unique()->after('nationality');
            }
            if (!Schema::hasColumn('users', 'sss_number')) {
                $table->string('sss_number', 12)->nullable()->unique()->after('tin');
            }
            if (!Schema::hasColumn('users', 'philhealth_number')) {
                $table->string('philhealth_number', 14)->nullable()->unique()->after('sss_number');
            }
            if (!Schema::hasColumn('users', 'pagibig_number')) {
                $table->string('pagibig_number', 14)->nullable()->unique()->after('philhealth_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach ($this->columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropUnique([$column]);
                    $table->dropColumn($column);
                }
            }
        });
    }
};
