<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Commission;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TransactionService
{
    /**
     * Create a transaction, its commission breakdown and update the agent wallet
     * atomically inside a single database transaction.
     *
     * @param  array{type:string, fee_strategy:string, amount:float|int, client_phone:string}  $data
     *
     * @throws RuntimeException when the wallet balance is insufficient.
     */
    public function create(Agent $agent, array $data): Transaction
    {
        $amount = (float) $data['amount'];
        $type = $data['type'];
        $feeStrategy = $data['fee_strategy'];

        // Commission calculation (5% total, split 60% agent / 40% platform)
        $totalFee = $amount * 0.05;
        $agentCommission = $totalFee * 0.60;
        $platformCommission = $totalFee * 0.40;

        $impactAmount = 0;      // signed change applied to the wallet balance
        $finalAmount = $amount; // amount reaching the phone or paid in cash

        if ($type === 'dépôt') {
            if ($feeStrategy === 'client_pays') {
                // Client pays amount + fee in cash; agent wallet loses exactly 'amount'.
                $finalAmount = $amount;
                $impactAmount = -$amount;
            } else {
                // 'deducted' or 'agent_receives': fee is taken from the amount.
                // Client gets amount - totalFee; agent wallet loses (amount - totalFee).
                $finalAmount = $amount - $totalFee;
                $impactAmount = -$finalAmount;
            }
        } else {
            // Retrait: agent pays 'amount' cash to client and receives amount + commission.
            $finalAmount = $amount;
            $impactAmount = $amount + $agentCommission;
        }

        return DB::transaction(function () use (
            $agent, $type, $feeStrategy, $finalAmount, $agentCommission, $platformCommission, $impactAmount, $data
        ) {
            // Lock the wallet row to avoid race conditions on concurrent requests.
            $wallet = $agent->wallet()->lockForUpdate()->first();

            if ($impactAmount < 0 && $wallet->balance < abs($impactAmount)) {
                throw new RuntimeException('Solde insuffisant dans le wallet.');
            }

            $transaction = Transaction::create([
                'agent_id' => $agent->id,
                'type' => $type,
                'fee_strategy' => $feeStrategy,
                'amount' => $finalAmount,
                'commission' => $agentCommission,
                'total' => $finalAmount + $agentCommission,
                'client_phone' => $data['client_phone'],
                'status' => 'completed',
                'reference' => 'TRX-' . strtoupper(uniqid()),
            ]);

            Commission::create([
                'transaction_id' => $transaction->id,
                'agent_amount' => $agentCommission,
                'platform_amount' => $platformCommission,
            ]);

            $wallet->balance += $impactAmount;
            $wallet->save();

            return $transaction;
        });
    }
}
