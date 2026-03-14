@extends('layouts.app')

@section('content')
<div class="max-w-2xl mx-auto my-12 px-4">
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="bg-slate-900 text-white p-8 text-center">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                {{ $wallet->currency === 'XOF' ? 'FCFA' : '$' }}
            </div>
            <h1 class="text-2xl font-bold mb-1">Mon Portefeuille</h1>
            <p class="text-slate-400">ID Agent: #{{ str_pad($wallet->agent_id, 5, '0', STR_PAD_LEFT) }}</p>
        </div>

        <div class="px-8 py-10 text-center">
            <p class="text-slate-500 text-sm font-medium mb-2 uppercase tracking-widest">Solde Disponible</p>
            <p class="text-5xl font-black text-slate-900 mb-8">
                {{ number_format($wallet->balance, 0, ',', ' ') }} <span class="text-2xl font-bold text-blue-600">{{ $wallet->currency }}</span>
            </p>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-50 p-4 rounded-xl">
                    <p class="text-slate-500 text-xs mb-1">Dernière mise à jour</p>
                    <p class="text-slate-900 font-bold text-sm">{{ $wallet->updated_at->format('d/m/Y H:i') }}</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl">
                    <p class="text-slate-500 text-xs mb-1">Devise de base</p>
                    <p class="text-slate-900 font-bold text-sm">Franc CFA (BCEAO)</p>
                </div>
            </div>

            <div class="mt-10 pt-8 border-t border-slate-100">
                <h3 class="font-bold text-slate-900 mb-4">Actions rapides</h3>
                <div class="flex justify-center gap-4">
                    <a href="{{ route('transactions.create') }}?type=dépôt" class="px-6 py-3 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors">
                        Recharger Wallet
                    </a>
                    <a href="{{ route('transactions.create') }}?type=retrait" class="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                        Retirer Cash
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
