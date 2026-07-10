<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AgentAuthController;
use App\Http\Controllers\AgentDashboardController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TransactionController;

Route::get('/', function () {
    if (! auth()->check()) {
        return redirect()->route('login');
    }

    return auth()->user()->isAdmin()
        ? redirect()->route('admin.dashboard')
        : redirect()->route('dashboard');
});

// Auth Routes
Route::get('/register', [AgentAuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AgentAuthController::class, 'register']);
Route::get('/login', [AgentAuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AgentAuthController::class, 'login']);
Route::post('/logout', [AgentAuthController::class, 'logout'])->name('logout');

// Protected Admin Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/agents', [AdminController::class, 'agents'])->name('agents');
    Route::get('/agents/{agent}', [AdminController::class, 'showAgent'])->name('agents.show');
    Route::get('/agents/{agent}/edit', [AdminController::class, 'editAgent'])->name('agents.edit');
    Route::put('/agents/{agent}', [AdminController::class, 'updateAgent'])->name('agents.update');
    Route::delete('/agents/{agent}', [AdminController::class, 'destroyAgent'])->name('agents.destroy');
    Route::get('/transactions', [AdminController::class, 'transactions'])->name('transactions');
    Route::get('/commissions', [AdminController::class, 'commissions'])->name('commissions');
    Route::get('/operateurs', [AdminController::class, 'operateurs'])->name('operateurs');
    Route::get('/operateurs/nouveau', [AdminController::class, 'createOperator'])->name('operateurs.create');
    Route::post('/operateurs', [AdminController::class, 'storeOperator'])->name('operateurs.store');
    Route::get('/operateurs/{operator}/edit', [AdminController::class, 'editOperator'])->name('operateurs.edit');
    Route::put('/operateurs/{operator}', [AdminController::class, 'updateOperator'])->name('operateurs.update');
    Route::delete('/operateurs/{operator}', [AdminController::class, 'destroyOperator'])->name('operateurs.destroy');
    Route::get('/cartographie', [AdminController::class, 'cartographie'])->name('cartographie');
    Route::get('/statistiques', [AdminController::class, 'statistiques'])->name('statistiques');
    Route::get('/rapports', [AdminController::class, 'rapports'])->name('rapports');
    Route::get('/rapports/export', [AdminController::class, 'exportRapport'])->name('rapports.export');
    Route::get('/notifications', [AdminController::class, 'notifications'])->name('notifications');
    Route::post('/notifications', [AdminController::class, 'storeNotification'])->name('notifications.store');
    Route::delete('/notifications/{notification}', [AdminController::class, 'destroyNotification'])->name('notifications.destroy');
    Route::get('/litiges', [AdminController::class, 'litiges'])->name('litiges');
    Route::get('/litiges/nouveau', [AdminController::class, 'createLitige'])->name('litiges.create');
    Route::post('/litiges', [AdminController::class, 'storeLitige'])->name('litiges.store');
    Route::put('/litiges/{dispute}/statut', [AdminController::class, 'updateLitigeStatus'])->name('litiges.status');
    Route::delete('/litiges/{dispute}', [AdminController::class, 'destroyLitige'])->name('litiges.destroy');
    Route::get('/compte', [AdminController::class, 'compte'])->name('compte');
    Route::get('/parametres', [AdminController::class, 'parametres'])->name('parametres');

    // Pages placeholder (à construire) — gestion complète
    $placeholders = [
        'clients'       => ['Clients', 'Gestion des clients finaux et de leur historique.'],
        'utilisateurs'  => ['Utilisateurs', 'Gestion des comptes administrateurs.'],
        'roles'         => ['Rôles & permissions', 'Définition des rôles et droits d\'accès.'],
        'aide'          => ['Aide & support', 'Centre d\'aide et contact support.'],
    ];
    foreach ($placeholders as $slug => $meta) {
        Route::get("/$slug", fn () => view('admin.placeholder', [
            'pageTitle' => $meta[0],
            'desc'      => $meta[1],
        ]))->name($slug);
    }
});

// Protected Agent Routes
Route::middleware(['auth', 'agent'])->group(function () {
    Route::get('/dashboard', [AgentDashboardController::class, 'index'])->name('dashboard');
    
    Route::resource('transactions', TransactionController::class);
    Route::get('/wallets', function() {
        return view('wallets.index', ['wallet' => auth()->user()->agent->wallet]);
    })->name('wallets.index');
});
