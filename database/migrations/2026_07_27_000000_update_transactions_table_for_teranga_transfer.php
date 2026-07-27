<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // S'assurer que les nouvelles colonnes existent
            if (!Schema::hasColumn('transactions', 'fee')) {
                $table->decimal('fee', 10, 2)->default(0)->after('amount');
            }
            if (!Schema::hasColumn('transactions', 'merchant_commission')) {
                $table->decimal('merchant_commission', 10, 2)->default(0)->after('fee');
            }
            if (!Schema::hasColumn('transactions', 'total_client')) {
                $table->decimal('total_client', 10, 2)->default(0)->after('merchant_commission');
            }
            if (!Schema::hasColumn('transactions', 'merchant_wallet_impact')) {
                $table->decimal('merchant_wallet_impact', 10, 2)->default(0)->after('total_client');
            }
            if (!Schema::hasColumn('transactions', 'paydunya_transaction_id')) {
                $table->string('paydunya_transaction_id')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'fee', 
                'merchant_commission', 
                'total_client', 
                'merchant_wallet_impact', 
                'paydunya_transaction_id'
            ]);
        });
    }
};
