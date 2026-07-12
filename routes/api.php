<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

// Public auth endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/otp/send', [AuthController::class, 'sendOtp']);
Route::post('/otp/verify', [AuthController::class, 'verifyOtp']);

// IPN PayDunya (public — appelé par les serveurs PayDunya)
Route::post('/paydunya/ipn', [PaymentController::class, 'ipn']);

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
    });
});
