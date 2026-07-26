<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->string('shop_number')->nullable()->after('shop_name');
            $table->string('cni_recto_path')->nullable()->after('shop_number');
            $table->string('cni_verso_path')->nullable()->after('cni_recto_path');
            $table->string('selfie_path')->nullable()->after('cni_verso_path');
            $table->timestamp('kyc_submitted_at')->nullable()->after('selfie_path');
        });
    }

    public function down(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->dropColumn(['shop_number', 'cni_recto_path', 'cni_verso_path', 'selfie_path', 'kyc_submitted_at']);
        });
    }
};
