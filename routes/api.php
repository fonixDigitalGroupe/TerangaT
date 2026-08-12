<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

// Public auth endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/otp/send', [AuthController::class, 'sendOtp']);
Route::post('/otp/verify', [AuthController::class, 'verifyOtp']);
Route::post('/otp/check', [AuthController::class, 'checkOtp']);

// Connexion en deux étapes : numéro puis code secret.
// Limitées en débit : le code secret ne fait que 4 chiffres (10 000 combinaisons)
// et /phone/check permettrait sinon d'énumérer les numéros inscrits.
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/phone/check', [AuthController::class, 'checkPhone']);
    Route::post('/login', [AuthController::class, 'login']);
});

// IPN PayDunya (public — appelé par les serveurs PayDunya).
// GET autorisé : PayDunya sonde l'URL en GET avant un déboursement (doit répondre 200).
Route::match(['get', 'post'], '/paydunya/ipn', [PaymentController::class, 'ipn']);

// Authenticated endpoints (Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Agent-only endpoints
    Route::middleware('agent.api')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/wallet', [WalletController::class, 'show']);
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);

        // Paiements PayDunya
        Route::post('/paiements/retrait', [PaymentController::class, 'retrait']);
        Route::post('/paiements/depot', [PaymentController::class, 'depot']);
        Route::post('/paiements/transfert', [PaymentController::class, 'transfert']);
        // Confirmation d'un dépôt web « à confirmer » par le marchand.
        Route::post('/paiements/{transaction}/confirmer', [PaymentController::class, 'confirmerDepot']);

        // KYC : soumission des pièces d'identité
        Route::post('/agent/kyc', [AgentController::class, 'uploadKyc']);
    });
});
