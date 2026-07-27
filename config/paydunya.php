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
    | Commission Téranga encaissée via PayDunya, en FCFA. Ajoutée au montant brut
    | débité au marchand afin qu'après prélèvement des frais PayDunya, elle reste
    | dans le compte PayDunya de Téranga. À ajuster selon les frais réels mesurés.
    */
    'teranga_commission' => (int) env('PAYDUNYA_TERANGA_COMMISSION', 50),

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
