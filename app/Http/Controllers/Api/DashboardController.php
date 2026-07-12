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

        // Seules les transactions réellement abouties (« completed ») comptent :
        // l'argent n'est débité qu'à la confirmation du paiement.
        $done = fn () => $agent->transactions()->where('status', 'completed');

        $stats = [
            'total_transactions' => (int) $done()->count(),
            'total_depot' => (float) $done()->where('type', 'dépôt')->sum('amount'),
            'total_retrait' => (float) $done()->where('type', 'retrait')->sum('amount'),
            'total_commission' => (float) $done()->sum('commission'),
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
