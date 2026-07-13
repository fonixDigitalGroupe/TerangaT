<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Références réelles PayDunya (traçables pour les litiges)
            $table->string('paydunya_ref')->nullable()->after('paydunya_token');  // réf. collecte (provider_reference)
            $table->string('disburse_ref')->nullable()->after('paydunya_ref');    // réf. déboursement (provider_ref)
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['paydunya_ref', 'disburse_ref']);
        });
    }
};
