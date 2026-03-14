<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AgentDashboardController extends Controller
{
    public function index()
    {
        $agent = auth()->user()->agent;
        $wallet = $agent->wallet;
        $recentTransactions = $agent->transactions()->latest()->take(5)->get();
        
        $stats = [
            'total_transactions' => $agent->transactions()->count(),
            'total_depot' => $agent->transactions()->where('type', 'dépôt')->sum('amount'),
            'total_retrait' => $agent->transactions()->where('type', 'retrait')->sum('amount'),
            'total_commission' => $agent->transactions()->sum('commission'),
        ];

        return view('dashboard', compact('agent', 'wallet', 'recentTransactions', 'stats'));
    }
}
