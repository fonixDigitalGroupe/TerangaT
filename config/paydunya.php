<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mode PayDunya
    |--------------------------------------------------------------------------
    | 'test' (bac à sable) ou 'live' (production).
    */
    'mode' => env('PAYDUNYA_MODE', 'test'),

    /*
    |--------------------------------------------------------------------------
    | Clés API (renseignées UNIQUEMENT dans le .env du serveur — jamais ici)
    |--------------------------------------------------------------------------
    */
    'master_key'  => env('PAYDUNYA_MASTER_KEY'),
    'public_key'  => env('PAYDUNYA_PUBLIC_KEY'),
    'private_key' => env('PAYDUNYA_PRIVATE_KEY'),
    'token'       => env('PAYDUNYA_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | URLs de base de l'API PayDunya
    |--------------------------------------------------------------------------
    */
    'base_url' => [
        'live' => 'https://app.paydunya.com/api/v1',
        'test' => 'https://app.paydunya.com/sandbox-api/v1',
    ],

    /*
    | Déboursement (API PUSH) — endpoints en v2 (obligatoire d'après la doc).
    */
    'disburse_url' => [
        'live' => 'https://app.paydunya.com/api/v2',
        'test' => 'https://app.paydunya.com/api/v2',
    ],

    /*
    |--------------------------------------------------------------------------
    | Informations de la boutique (affichées sur les paiements)
    |--------------------------------------------------------------------------
    */
    'store' => [
        'name'          => env('PAYDUNYA_STORE_NAME', 'Téranga Transfert'),
        'phone'         => env('PAYDUNYA_STORE_PHONE'),
        'postal_address'=> env('PAYDUNYA_STORE_ADDRESS'),
    ],

    /*
    |--------------------------------------------------------------------------
    | URLs de callback / retour
    |--------------------------------------------------------------------------
    */
    'callback_url' => env('PAYDUNYA_CALLBACK_URL'), // IPN (notification serveur)
    'return_url'   => env('PAYDUNYA_RETURN_URL'),
    'cancel_url'   => env('PAYDUNYA_CANCEL_URL'),

];
