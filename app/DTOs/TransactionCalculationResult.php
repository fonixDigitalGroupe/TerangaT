<?php

namespace App\DTOs;

class TransactionCalculationResult
{
    public float $amount;
    public float $fee;
    public float $merchantCommission;
    public float $clientTotal; // Cash expected from client (deposit) OR Cash to give to client + payment request (withdrawal)
    public float $merchantWalletImpact; // Amount added or subtracted from merchant MM wallet
    public string $type;

    public function __construct(
        float $amount,
        float $fee,
        float $merchantCommission,
        float $clientTotal,
        float $merchantWalletImpact,
        string $type
    ) {
        $this->amount = $amount;
        $this->fee = $fee;
        $this->merchantCommission = $merchantCommission;
        $this->clientTotal = $clientTotal;
        $this->merchantWalletImpact = $merchantWalletImpact;
        $this->type = $type;
    }
}
