<?php

namespace App\Services;

use App\DTOs\TransactionCalculationResult;
use App\Exceptions\TransactionException;

class FeeCalculatorService
{
    private const MERCHANT_COMMISSION = 50.0;
    private const FEE_PERCENTAGE = 0.03;
    private const BASE_FEE = 50.0;

    /**
     * Calculate fees and impacts based on operation type
     *
     * @param float $amount
     * @param string $type 'deposit' or 'withdrawal'
     * @return TransactionCalculationResult
     * @throws TransactionException
     */
    public function calculate(float $amount, string $type): TransactionCalculationResult
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException("Le montant doit être supérieur à 0.");
        }

        // Formule de base : Frais = (Montant × 3%) + 50 FCFA
        $fee = ($amount * self::FEE_PERCENTAGE) + self::BASE_FEE;
        
        $merchantCommission = self::MERCHANT_COMMISSION;

        if ($type === 'deposit') {
            // debit_wallet_marchand = montant + frais
            $merchantWalletImpact = $amount + $fee;
            
            // especes_client = debit_wallet_marchand + 50
            $clientTotal = $merchantWalletImpact + $merchantCommission;

            return new TransactionCalculationResult(
                amount: $amount,
                fee: $fee,
                merchantCommission: $merchantCommission,
                clientTotal: $clientTotal,
                merchantWalletImpact: -$merchantWalletImpact, // Negative because it's a debit
                type: $type
            );
        }

        if ($type === 'withdrawal') {
            // credit_wallet_marchand = montant + frais
            $merchantWalletImpact = $amount + $fee;
            
            // paiement_client = credit_wallet_marchand + 50
            $clientTotal = $merchantWalletImpact + $merchantCommission;

            return new TransactionCalculationResult(
                amount: $amount,
                fee: $fee,
                merchantCommission: $merchantCommission,
                clientTotal: $clientTotal,
                merchantWalletImpact: $merchantWalletImpact, // Positive because it's a credit
                type: $type
            );
        }

        throw TransactionException::invalidType($type);
    }
}
