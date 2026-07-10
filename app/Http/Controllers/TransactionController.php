<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use RuntimeException;

class TransactionController extends Controller
{
    public function __construct(private TransactionService $transactions)
    {
    }

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
        $data = $request->validate([
            'type' => 'required|in:dépôt,retrait',
            'fee_strategy' => 'required|in:client_pays,deducted,agent_receives',
            'amount' => 'required|numeric|min:1',
            'client_phone' => 'required|string',
        ]);

        try {
            $this->transactions->create(auth()->user()->agent, $data);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage())->withInput();
        }

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
