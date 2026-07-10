<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Dispute extends Model
{
    protected $fillable = [
        'code',
        'agent_id',
        'transaction_reference',
        'subject',
        'description',
        'status',
    ];

    protected $attributes = [
        'status' => 'ouvert',
    ];

    protected static function booted(): void
    {
        static::creating(function (Dispute $dispute) {
            if (empty($dispute->code)) {
                do {
                    $code = 'LT-' . strtoupper(Str::random(6));
                } while (self::where('code', $code)->exists());
                $dispute->code = $code;
            }
        });
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}
