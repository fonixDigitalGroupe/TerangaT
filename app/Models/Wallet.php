<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;
    protected $fillable = [
        'agent_id',
        'balance',
        'currency',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}
