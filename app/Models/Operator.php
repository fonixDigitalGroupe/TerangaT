<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Operator extends Model
{
    protected $fillable = [
        'name',
        'logo',
        'fee_percent',
        'status',
    ];

    protected $attributes = [
        'status' => 'actif',
    ];
}
