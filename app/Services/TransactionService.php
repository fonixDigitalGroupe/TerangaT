<?php

namespace App\Services;

use App\DTOs\TransactionData;
use App\DTOs\TransactionCalculationResult;
use App\Events\TransactionCompleted;
use App\Events\TransactionFailed;
use App\Exceptions\TransactionException;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class TransactionService
{
    public function __construct(
        private FeeCalculatorService $feeCalculator,
        private PayDunyaService $payDunyaService
    ) {}

    /**
     * Preview transaction impacts before confirmation.
     */
    public function previewTransaction(TransactionData $data): TransactionCalculationResult
    {
        return $this->feeCalculator->calculate($data->amount, $data->type);
    }

    /**
     * Execute a Deposit transaction.
     */
    public function executeDeposit(TransactionData $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $calculation = $this->feeCalculator->calculate($data->amount, $data->type);
            $reference = 'TRG-DEP-' . strtoupper(Str::random(8));

            $transaction = $this->createTransactionRecord($data, $calculation, $reference);

            try {
                // Call PayDunya to debit merchant and credit client
                $response = $this->payDunyaService->triggerPayout(
                    $data->clientNumber,
                    $data->amount,
                    $reference
                );

                $transaction->update([
                    'status' => 'success',
                    'paydunya_transaction_id' => $response['transaction_id'] ?? null,
                ]);

                event(new TransactionCompleted($transaction));

                return $transaction;
            } catch (Exception $e) {
                $this->handleTransactionFailure($transaction, $e);
                throw $e;
            }
        });
    }

    /**
     * Execute a Withdrawal transaction.
     */
    public function executeWithdrawal(TransactionData $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $calculation = $this->feeCalculator->calculate($data->amount, $data->type);
            $reference = 'TRG-WIT-' . strtoupper(Str::random(8));

            $transaction = $this->createTransactionRecord($data, $calculation, $reference);

            try {
                // Call PayDunya for Request To Pay
                $response = $this->payDunyaService->requestToPay(
                    $data->clientNumber,
                    $calculation->clientTotal, // Client pays the total amount calculated
                    $reference
                );

                $transaction->update([
                    'status' => 'pending', // Waiting for client to validate PIN
                    'paydunya_transaction_id' => $response['transaction_id'] ?? null,
                ]);

                // We assume successful confirmation in this synchronous flow for demonstration,
                // but in reality, a webhook from PayDunya will update this to 'success'.
                $transaction->update(['status' => 'success']);
                
                event(new TransactionCompleted($transaction));

                return $transaction;
            } catch (Exception $e) {
                $this->handleTransactionFailure($transaction, $e);
                throw $e;
            }
        });
    }

    private function createTransactionRecord(TransactionData $data, TransactionCalculationResult $calc, string $reference): Transaction
    {
        return Transaction::create([
            'reference' => $reference,
            'agent_id' => $data->merchantId, // Using agent_id for backwards compatibility
            'client_phone' => $data->clientNumber,
            'operator' => $data->operator,
            'type' => $data->type,
            'amount' => $calc->amount,
            'fee' => $calc->fee,
            'merchant_commission' => $calc->merchantCommission,
            'total_client' => $calc->clientTotal,
            'merchant_wallet_impact' => $calc->merchantWalletImpact,
            'status' => 'pending',
        ]);
    }

    private function handleTransactionFailure(Transaction $transaction, Exception $e): void
    {
        $transaction->update([
            'status' => 'failed',
        ]);

        Log::error("Transaction failed: {$transaction->reference}. Error: {$e->getMessage()}");
        event(new TransactionFailed($transaction, $e->getMessage()));
    }
}
