<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `operator` = wallet du marchand débité (SOFTPAY).
     * `recipient_operator` = wallet du client crédité (déboursement).
     * Les deux peuvent différer : marchand sur Wave, client sur Orange Money.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('transactions', 'recipient_operator')) {
                $table->string('recipient_operator')->nullable()->after('operator'); // wave | orange-money
            }
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'recipient_operator')) {
                $table->dropColumn('recipient_operator');
            }
        });
    }
};
