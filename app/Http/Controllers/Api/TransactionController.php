<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use RuntimeException;

class TransactionController extends Controller
{
    public function __construct(private TransactionService $transactions)
    {
    }

    public function index(Request $request)
    {
        $transactions = $request->user()->agent
            ->transactions()
            ->latest()
            ->paginate(15);

        return TransactionResource::collection($transactions);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:dépôt,retrait',
            'fee_strategy' => 'required|in:client_pays,deducted,agent_receives',
            'amount' => 'required|numeric|min:1',
            'client_phone' => 'required|string|max:20',
        ]);

        try {
            $transaction = $this->transactions->create($request->user()->agent, $data);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return new TransactionResource($transaction->load('commission_breakdown'));
    }

    public function show(Request $request, Transaction $transaction)
    {
        if ($transaction->agent_id !== $request->user()->agent->id) {
            abort(403);
        }

        return new TransactionResource($transaction->load('commission_breakdown'));
    }
}
