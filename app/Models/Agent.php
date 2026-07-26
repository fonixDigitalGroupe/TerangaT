<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Agent extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'code',
        'shop_name',
        'shop_number',
        'cni_number',
        'status',
        'ninea',
        'address',
        'wave_number',
        'om_number',
        'cni_recto_path',
        'cni_verso_path',
        'selfie_path',
        'kyc_submitted_at',
    ];

    protected $attributes = [
        'status' => 'en attente',
    ];

    protected static function booted(): void
    {
        static::creating(function (Agent $agent) {
            if (empty($agent->code)) {
                $agent->code = self::generateUniqueCode();
            }
        });
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = 'TT-' . strtoupper(Str::random(6));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
