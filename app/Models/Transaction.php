<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;
    protected $fillable = [
        'agent_id',
        'type',
        'operator',
        'recipient_operator',
        'fee_strategy',
        'amount',
        'fee',
        'commission',
        'merchant_commission',
        'total',
        'total_client',
        'merchant_wallet_impact',
        'client_phone',
        'sender_phone',
        'status',
        'source',
        'reference',
        'paydunya_token',
        'paydunya_ref',
        'disburse_ref',
        'paydunya_transaction_id',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function commission_breakdown()
    {
        return $this->hasOne(Commission::class);
    }
}
