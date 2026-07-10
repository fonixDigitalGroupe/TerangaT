@extends('layouts.admin')

@section('title', 'Détail agent')

@section('content')

<div class="mb-4">
    <a href="{{ route('admin.agents') }}" class="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-sm transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
        Retour à la liste
    </a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

    {{-- Carte profil agent --}}
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Informations</h2>
        </div>
        <div class="p-6 flex flex-col items-center text-center border-b border-slate-100">
            <div class="w-16 h-16 rounded-full overflow-hidden ring-2 ring-slate-100 mb-3">
                @include('admin.partials.avatar')
            </div>
            <p class="font-semibold text-slate-800">{{ $agent->user->name ?? '—' }}</p>
            <span class="mt-1 inline-block font-mono text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">{{ $agent->code ?? '—' }}</span>
            @php
                $st = strtolower($agent->status ?? 'en attente');
                $cls = str_contains($st, 'vérif') || str_contains($st, 'verif') ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
            @endphp
            <span class="mt-2 text-xs px-2 py-0.5 rounded-full capitalize {{ $cls }}">{{ $agent->status ?? 'en attente' }}</span>
        </div>
        <dl class="divide-y divide-slate-100 text-sm">
            <div class="flex justify-between px-5 py-3"><dt class="text-slate-500">Téléphone</dt><dd class="text-slate-800">{{ $agent->user->phone ?? '—' }}</dd></div>
            <div class="flex justify-between px-5 py-3"><dt class="text-slate-500">Boutique</dt><dd class="text-slate-800">{{ $agent->shop_name ?? '—' }}</dd></div>
            <div class="flex justify-between px-5 py-3"><dt class="text-slate-500">Région</dt><dd class="text-slate-800">{{ $agent->user->country ?? '—' }}</dd></div>
            <div class="flex justify-between px-5 py-3"><dt class="text-slate-500">Transactions</dt><dd class="text-slate-800">{{ $agent->transactions_count }}</dd></div>
        </dl>
        <div class="p-4 border-t border-slate-100">
            <a href="{{ route('admin.agents.edit', $agent) }}" class="btn btn-edit w-full justify-center">Modifier</a>
        </div>
    </div>

    {{-- Transactions récentes --}}
    <div class="lg:col-span-2 bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Transactions récentes</h2>
        </div>
        <div class="overflow-x-auto px-5 py-4">
            <table class="w-full text-sm border border-slate-200 border-collapse">
                <thead class="bg-slate-50 text-slate-500 text-left">
                    <tr>
                        <th class="border border-slate-200 px-4 py-2.5 text-xs font-semibold">Référence</th>
                        <th class="border border-slate-200 px-4 py-2.5 text-xs font-semibold">Type</th>
                        <th class="border border-slate-200 px-4 py-2.5 text-xs font-semibold">Montant</th>
                        <th class="border border-slate-200 px-4 py-2.5 text-xs font-semibold">Statut</th>
                        <th class="border border-slate-200 px-4 py-2.5 text-xs font-semibold">Date</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($recentTransactions as $tx)
                        <tr class="odd:bg-slate-50">
                            <td class="border border-slate-200 px-4 py-2.5 font-mono text-xs text-slate-600">{{ $tx->reference ?? '—' }}</td>
                            <td class="border border-slate-200 px-4 py-2.5 text-xs text-slate-600 capitalize">{{ $tx->type }}</td>
                            <td class="border border-slate-200 px-4 py-2.5 text-xs text-slate-900">{{ number_format($tx->amount, 0, ',', ' ') }} XOF</td>
                            <td class="border border-slate-200 px-4 py-2.5">
                                @php
                                    $s = strtolower($tx->status ?? '');
                                    $c = match(true) {
                                        str_contains($s, 'succ') || str_contains($s, 'valid') || str_contains($s, 'complet') => 'bg-green-100 text-green-700',
                                        str_contains($s, 'attente') || str_contains($s, 'pend')                                 => 'bg-amber-100 text-amber-700',
                                        str_contains($s, 'échou') || str_contains($s, 'echou') || str_contains($s, 'annul')    => 'bg-red-100 text-red-700',
                                        default                                                                               => 'bg-slate-100 text-slate-600',
                                    };
                                @endphp
                                <span class="text-xs px-2 py-0.5 rounded-full capitalize {{ $c }}">{{ $tx->status ?? '—' }}</span>
                            </td>
                            <td class="border border-slate-200 px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{{ $tx->created_at?->format('d/m/y H:i') }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="border border-slate-200 px-5 py-8 text-center text-slate-400">Aucune transaction</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
