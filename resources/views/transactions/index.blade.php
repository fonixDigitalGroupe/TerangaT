@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Mes Transactions</h1>
        <a href="{{ route('transactions.create') }}" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            Nouvelle Transaction
        </a>
    </div>

    @if(session('success'))
        <div class="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
            <span class="text-xl">✅</span> {{ session('success') }}
        </div>
    @endif

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                        <th class="px-6 py-4">Référence</th>
                        <th class="px-6 py-4">Type</th>
                        <th class="px-6 py-4">Client</th>
                        <th class="px-6 py-4">Montant</th>
                        <th class="px-6 py-4">Commission</th>
                        <th class="px-6 py-4">Statut</th>
                        <th class="px-6 py-4">Date</th>
                        <th class="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @foreach($transactions as $trx)
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 font-mono text-sm">{{ $trx->reference }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-bold {{ $trx->type === 'dépôt' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600' }}">
                                    {{ ucfirst($trx->type) }}
                                </span>
                                <div class="text-[10px] text-slate-400 mt-1">
                                    {{ str_replace('_', ' ', $trx->fee_strategy) }}
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm">{{ $trx->client_phone }}</td>
                            <td class="px-6 py-4 font-bold">{{ number_format($trx->amount, 0, ',', ' ') }} XOF</td>
                            <td class="px-6 py-4 text-green-600">+{{ number_format($trx->commission, 0, ',', ' ') }}</td>
                            <td class="px-6 py-4">
                                <span class="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md">Terminé</span>
                            </td>
                            <td class="px-6 py-4 text-slate-500 text-sm">{{ $trx->created_at->format('d/m/Y H:i') }}</td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('transactions.show', $trx) }}" class="text-blue-600 hover:text-blue-800 font-bold text-sm">Détails</a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100">
            {{ $transactions->links() }}
        </div>
    </div>
</div>
@endsection
