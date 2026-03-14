@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 class="text-3xl font-bold text-slate-900">Tableau de bord</h1>
            <p class="text-slate-500">Bienvenue, {{ auth()->user()->name }} - {{ $agent->shop_name }}</p>
        </div>
        <a href="{{ route('transactions.create') }}" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            Nouvelle Transaction
        </a>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p class="text-slate-500 text-sm font-medium mb-1">Solde Wallet</p>
            <p class="text-2xl font-bold text-blue-600">{{ number_format($wallet->balance, 0, ',', ' ') }} {{ $wallet->currency }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p class="text-slate-500 text-sm font-medium mb-1">Total Transactions</p>
            <p class="text-2xl font-bold text-slate-900">{{ $stats['total_transactions'] }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p class="text-slate-500 text-sm font-medium mb-1">Commissions Totales</p>
            <p class="text-2xl font-bold text-green-600">{{ number_format($stats['total_commission'], 0, ',', ' ') }} XOF</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p class="text-slate-500 text-sm font-medium mb-1">Volume (Dépôts)</p>
            <p class="text-2xl font-bold text-indigo-600">{{ number_format($stats['total_depot'], 0, ',', ' ') }} XOF</p>
        </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 class="font-bold text-slate-900">Transactions Récentes</h2>
            <a href="{{ route('transactions.index') }}" class="text-blue-600 text-sm font-bold hover:underline">Voir tout</a>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                        <th class="px-6 py-4">Référence</th>
                        <th class="px-6 py-4">Type</th>
                        <th class="px-6 py-4">Client</th>
                        <th class="px-6 py-4">Montant</th>
                        <th class="px-6 py-4">Commission</th>
                        <th class="px-6 py-4">Date</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($recentTransactions as $trx)
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 font-mono text-sm">{{ $trx->reference }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-bold {{ $trx->type === 'dépôt' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600' }}">
                                    {{ ucfirst($trx->type) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm">{{ $trx->client_phone }}</td>
                            <td class="px-6 py-4 font-bold">{{ number_format($trx->amount, 0, ',', ' ') }}</td>
                            <td class="px-6 py-4 text-green-600">+{{ number_format($trx->commission, 0, ',', ' ') }}</td>
                            <td class="px-6 py-4 text-slate-500 text-sm">{{ $trx->created_at->format('d/m/Y H:i') }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-slate-500 italic">Aucune transaction pour le moment.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
