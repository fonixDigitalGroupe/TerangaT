<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AgentAuthController;
use App\Http\Controllers\AgentDashboardController;
use App\Http\Controllers\TransactionController;

Route::get('/', function () {
    return view('home');
});

// Auth Routes
Route::get('/register', [AgentAuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AgentAuthController::class, 'register']);
Route::get('/login', [AgentAuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AgentAuthController::class, 'login']);
Route::post('/logout', [AgentAuthController::class, 'logout'])->name('logout');

// Protected Agent Routes
Route::middleware(['auth', 'agent'])->group(function () {
    Route::get('/dashboard', [AgentDashboardController::class, 'index'])->name('dashboard');
    
    Route::resource('transactions', TransactionController::class);
    Route::get('/wallets', function() {
        return view('wallets.index', ['wallet' => auth()->user()->agent->wallet]);
    })->name('wallets.index');
});
