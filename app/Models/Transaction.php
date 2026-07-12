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
        'fee_strategy',
        'amount',
        'commission',
        'total',
        'client_phone',
        'sender_phone',
        'status',
        'reference',
        'paydunya_token',
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
