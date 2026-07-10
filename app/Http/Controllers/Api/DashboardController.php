<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\WalletResource;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $agent = $request->user()->agent;

        $stats = [
            'total_transactions' => (int) $agent->transactions()->count(),
            'total_depot' => (float) $agent->transactions()->where('type', 'dépôt')->sum('amount'),
            'total_retrait' => (float) $agent->transactions()->where('type', 'retrait')->sum('amount'),
            'total_commission' => (float) $agent->transactions()->sum('commission'),
        ];

        return response()->json([
            'wallet' => new WalletResource($agent->wallet),
            'stats' => $stats,
            'recent_transactions' => TransactionResource::collection(
                $agent->transactions()->latest()->take(5)->get()
            ),
        ]);
    }
}
