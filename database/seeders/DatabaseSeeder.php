<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin user
        \App\Models\User::factory()->create([
            'name' => 'Admin Téranga',
            'email' => 'admin@teranga.sn',
            'phone' => '770000000',
            'role' => 'admin',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        // 10 Agents with Wallets and Transactions
        \App\Models\User::factory(10)->create(['role' => 'agent'])->each(function ($user) {
            $agent = \App\Models\Agent::factory()->create([
                'user_id' => $user->id,
            ]);

            \App\Models\Wallet::factory()->create([
                'agent_id' => $agent->id,
            ]);

            \App\Models\Transaction::factory(5)->create([
                'agent_id' => $agent->id,
            ])->each(function ($trx) {
                \App\Models\Commission::create([
                    'transaction_id' => $trx->id,
                    'agent_amount' => $trx->commission * 0.6,
                    'platform_amount' => $trx->commission * 0.4,
                ]);
            });
        });
    }
}
