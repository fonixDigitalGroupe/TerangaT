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
    | Taux estimé des frais PayDunya (collecte + déboursement), en %.
    | Utilisé pour déduire les frais du montant reçu par le destinataire
    | quand PayDunya ne renvoie pas le montant exact des frais.
    | À ajuster selon les frais réels constatés dans les logs.
    */
    'fee_percent' => (float) env('PAYDUNYA_FEE_PERCENT', 3),

    /*
    |--------------------------------------------------------------------------
    | Logique métier des frais Téranga
    |--------------------------------------------------------------------------
    | Espèces échangées (dépôt/retrait) = montant + frais (grille).
    | Le marchand garde sa commission ; son wallet bouge de :
    |     brut = montant + frais − commission_marchand
    | La différence brut/net couvre les frais PayDunya + la marge Téranga.
    */
    'merchant_commission' => (int) env('PAYDUNYA_MERCHANT_COMMISSION', 50),

    // Grille tarifaire des frais facturés au client (jamais une formule).
    // Bornes sur le MONTANT REÇU par le client. Modifiable sans toucher au code.
    'fee_grid' => [
        ['min' => 100,    'max' => 2000,  'fee' => 150],
        ['min' => 2001,   'max' => 5000,  'fee' => 250],
        ['min' => 5001,   'max' => 10000, 'fee' => 400],
        ['min' => 10001,  'max' => 15000, 'fee' => 600],
        ['min' => 15001,  'max' => 20000, 'fee' => 800],
        ['min' => 20001,  'max' => 25000, 'fee' => 950],
        ['min' => 25001,  'max' => 30000, 'fee' => 1100],
        ['min' => 30001,  'max' => 35000, 'fee' => 1300],
        ['min' => 35001,  'max' => 40000, 'fee' => 1500],
        ['min' => 40001,  'max' => 45000, 'fee' => 1650],
        ['min' => 45001,  'max' => 50000, 'fee' => 1850],
    ],

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
