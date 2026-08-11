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
        <div class="px-5 pt-4 pb-3" style="background-color:#ffffff;border-bottom:1px solid #e2e8f0;">
            <h2 class="font-normal text-slate-800 uppercase text-sm tracking-wide">Informations</h2>
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
        <div class="px-5 pt-4 pb-3" style="background-color:#ffffff;border-bottom:1px solid #e2e8f0;">
            <h2 class="font-normal text-slate-800 uppercase text-sm tracking-wide">Transactions récentes</h2>
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

{{-- Vérification d'identité (KYC) --}}
<div class="mt-5 bg-white border border-slate-200 shadow-sm">
    <div class="px-5 pt-4 pb-3 flex items-center justify-between" style="background-color:#ffffff;border-bottom:1px solid #e2e8f0;">
        <h2 class="font-normal text-slate-800 uppercase text-sm tracking-wide">Vérification d'identité (KYC)</h2>
        @if($agent->kyc_submitted_at)
            <span class="text-[11px] text-white/80">Soumis le {{ $agent->kyc_submitted_at->format('d/m/Y H:i') }}</span>
        @endif
    </div>

    <div class="p-6">
        @if(!$agent->kyc_submitted_at && !$agent->cni_recto_path)
            <p class="text-sm text-slate-400 text-center py-4">L'agent n'a pas encore soumis ses pièces d'identité.</p>
        @else
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div class="flex justify-between px-1 py-2 border-b border-slate-100">
                    <span class="text-slate-500 text-sm">Numéro de la boutique</span>
                    <span class="text-slate-800 text-sm font-medium">{{ $agent->shop_number ?? 'Non renseigné' }}</span>
                </div>
                <div class="flex justify-between px-1 py-2 border-b border-slate-100">
                    <span class="text-slate-500 text-sm">Numéro CNI</span>
                    <span class="text-slate-800 text-sm font-medium">{{ $agent->cni_number ?? 'Non renseigné' }}</span>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                @php
                    $docs = [
                        'CNI recto'       => $agent->cni_recto_path,
                        'CNI verso'       => $agent->cni_verso_path,
                        'Selfie avec CNI' => $agent->selfie_path,
                    ];
                @endphp
                @foreach($docs as $label => $path)
                    <div>
                        <p class="text-xs font-semibold text-slate-600 mb-2">{{ $label }}</p>
                        @if($path)
                            <a href="{{ asset('storage/' . $path) }}" target="_blank" class="block">
                                <img src="{{ asset('storage/' . $path) }}" alt="{{ $label }}"
                                     class="w-full h-40 object-cover rounded-md border border-slate-200 hover:opacity-90 transition">
                            </a>
                        @else
                            <div class="w-full h-40 rounded-md border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                                Non fourni
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>

            {{-- Actions de validation --}}
            <div class="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                <span class="text-sm text-slate-500">Décision :</span>
                <form method="POST" action="{{ route('admin.agents.kyc-status', $agent) }}">
                    @csrf
                    <input type="hidden" name="status" value="vérifié">
                    <button type="submit" class="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-sm transition-colors">
                        ✓ Valider l'agent
                    </button>
                </form>
                <form method="POST" action="{{ route('admin.agents.kyc-status', $agent) }}">
                    @csrf
                    <input type="hidden" name="status" value="rejeté">
                    <button type="submit" class="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-sm transition-colors">
                        ✕ Rejeter
                    </button>
                </form>
                <form method="POST" action="{{ route('admin.agents.kyc-status', $agent) }}">
                    @csrf
                    <input type="hidden" name="status" value="en attente">
                    <button type="submit" class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-sm transition-colors">
                        Remettre en attente
                    </button>
                </form>
            </div>
        @endif
    </div>
</div>
@endsection
