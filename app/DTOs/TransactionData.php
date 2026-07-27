<?php

namespace App\DTOs;

class TransactionData
{
    public string $merchantId;
    public string $clientNumber;
    public string $operator; // 'wave' or 'om'
    public float $amount;
    public string $type; // 'deposit' or 'withdrawal'

    public function __construct(
        string $merchantId,
        string $clientNumber,
        string $operator,
        float $amount,
        string $type
    ) {
        $this->merchantId = $merchantId;
        $this->clientNumber = $clientNumber;
        $this->operator = $operator;
        $this->amount = $amount;
        $this->type = $type;
    }
}
