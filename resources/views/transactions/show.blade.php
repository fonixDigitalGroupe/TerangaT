@extends('layouts.app')

@section('content')
<div class="max-w-2xl mx-auto my-12 px-4">
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <h2 class="text-xl font-bold text-slate-900">Détails de la Transaction</h2>
            <span class="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase">Succès</span>
        </div>

        <div class="p-8 space-y-6">
            <div class="flex justify-between items-center bg-slate-50 p-6 rounded-xl">
                <div>
                    <p class="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Référence</p>
                    <p class="text-xl font-mono font-bold text-slate-900">{{ $transaction->reference }}</p>
                </div>
                <div class="text-right">
                    <p class="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Date</p>
                    <p class="text-slate-900 font-bold">{{ $transaction->created_at->format('d M Y, H:i') }}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8">
                <div>
                    <h3 class="text-sm font-medium text-slate-500 mb-4">Informations Client</h3>
                    <div class="space-y-2">
                        <p class="text-slate-900 font-bold">{{ $transaction->client_phone }}</p>
                        <p class="text-slate-400 text-xs">Destinataire / Émetteur</p>
                    </div>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-slate-500 mb-4">Type d'opération</h3>
                    <div class="flex flex-col gap-1">
                        <span class="px-3 py-1 rounded-lg text-sm font-bold {{ $transaction->type === 'dépôt' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600' }} w-fit">
                            {{ ucfirst($transaction->type) }}
                        </span>
                        <span class="text-xs text-slate-400 italic">
                            Stratégie: {{ str_replace('_', ' ', $transaction->fee_strategy) }}
                        </span>
                    </div>
                </div>
            </div>

            <hr class="border-slate-100">

            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <span class="text-slate-500">Montant de base</span>
                    <span class="font-bold text-slate-900">{{ number_format($transaction->amount, 0, ',', ' ') }} XOF</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-slate-500">Commission Agent</span>
                    <span class="font-bold text-green-600">+ {{ number_format($transaction->commission, 0, ',', ' ') }} XOF</span>
                </div>
                @if($transaction->commission_breakdown)
                <div class="flex justify-between items-center text-xs italic text-slate-400">
                    <span>Part plateforme</span>
                    <span>{{ number_format($transaction->commission_breakdown->platform_amount, 0, ',', ' ') }} XOF</span>
                </div>
                @endif
            </div>

            <div class="bg-blue-600 rounded-xl p-6 text-white flex justify-between items-center">
                <span class="font-medium">Total impact Wallet</span>
                <span class="text-2xl font-black">
                    {{ $transaction->type === 'dépôt' ? '-' : '+' }} 
                    {{ number_format($transaction->amount, 0, ',', ' ') }} XOF
                </span>
            </div>
        </div>

        <div class="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-4">
            <button onclick="window.print()" class="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                🖨️ Imprimer Reçu
            </button>
            <a href="{{ route('transactions.index') }}" class="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-center hover:bg-slate-800 transition-all">
                Fermer
            </a>
        </div>
    </div>
</div>
@endsection
