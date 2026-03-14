<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Commission;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = auth()->user()->agent->transactions()->latest()->paginate(10);
        return view('transactions.index', compact('transactions'));
    }

    public function create()
    {
        return view('transactions.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:dépôt,retrait',
            'fee_strategy' => 'required|in:client_pays,deducted,agent_receives',
            'amount' => 'required|numeric|min:1',
            'client_phone' => 'required|string',
        ]);

        $agent = auth()->user()->agent;
        $wallet = $agent->wallet;
        $amount = $request->amount;

        // Commission calculation (5% total)
        $totalFee = $amount * 0.05;
        $agentCommission = $totalFee * 0.60;
        $platformCommission = $totalFee * 0.40;

        // Final amounts based on strategy
        $impactAmount = 0;
        $finalAmount = $amount; // Amount reaching the phone or paid in cash

        if ($request->type === 'dépôt') {
            if ($request->fee_strategy === 'client_pays') {
                // Client pays amount + fee in cash
                // Agent wallet loses exactly 'amount'
                $impactAmount = -$amount;
                $finalAmount = $amount;
            } else {
                // Fee is deducted from the amount
                // Client gets amount - totalFee
                // Agent wallet loses (amount - totalFee)
                $finalAmount = $amount - $totalFee;
                $impactAmount = -$finalAmount;
            }
        } else {
            // Retrait
            // Client pays nothing (or pays via provider)
            // Agent pays 'amount' in cash to client
            // Agent wallet receives 'amount + agent_commission'
            $impactAmount = $amount + $agentCommission;
            $finalAmount = $amount;
        }

        // Validate wallet for deposits
        if ($impactAmount < 0 && $wallet->balance < abs($impactAmount)) {
            return back()->with('error', 'Solde insuffisant dans le wallet.')->withInput();
        }

        $transaction = Transaction::create([
            'agent_id' => $agent->id,
            'type' => $request->type,
            'fee_strategy' => $request->fee_strategy,
            'amount' => $finalAmount,
            'commission' => $agentCommission,
            'total' => $finalAmount + $agentCommission,
            'client_phone' => $request->client_phone,
            'status' => 'completed',
            'reference' => 'TRX-' . strtoupper(uniqid()),
        ]);

        Commission::create([
            'transaction_id' => $transaction->id,
            'agent_amount' => $agentCommission,
            'platform_amount' => $platformCommission,
        ]);

        $wallet->balance += $impactAmount;
        $wallet->save();

        return redirect()->route('dashboard')->with('success', 'Transaction effectuée avec succès.');
    }

    public function show(Transaction $transaction)
    {
        // Ensure agent can only see their own transactions
        if ($transaction->agent_id !== auth()->user()->agent->id) {
            abort(403);
        }
        return view('transactions.show', compact('transaction'));
    }
}
