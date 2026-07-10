@extends('layouts.admin')

@section('title', 'Tableau de bord')

@section('content')

{{-- Statistiques --}}
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @php
        $cards = [
            ['label' => 'Agents',        'value' => number_format($stats['total_agents'], 0, ',', ' '),                 'color' => '#2d547d', 'icon' => 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'],
            ['label' => 'Transactions',  'value' => number_format($stats['total_transactions'], 0, ',', ' '),           'color' => '#0ea5e9', 'icon' => 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'],
            ['label' => 'Volume total',  'value' => number_format($stats['total_volume'], 0, ',', ' ') . ' XOF',        'color' => '#16a34a', 'icon' => 'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941'],
            ['label' => 'Commissions',   'value' => number_format($stats['total_commission'], 0, ',', ' ') . ' XOF',    'color' => '#F26522', 'icon' => 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
        ];
    @endphp
    @foreach($cards as $c)
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style="background:{{ $c['color'] }}1a;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="{{ $c['color'] }}" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="{{ $c['icon'] }}" /></svg>
            </div>
            <div class="min-w-0">
                <p class="text-slate-500 text-xs mb-0.5">{{ $c['label'] }}</p>
                <p class="text-lg font-bold truncate" style="color:{{ $c['color'] }};">{{ $c['value'] }}</p>
            </div>
        </div>
    @endforeach
</div>

{{-- Transactions récentes --}}
<div class="bg-white rounded-lg border border-slate-200 shadow-sm">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 class="font-semibold text-slate-700 uppercase text-xs tracking-wider">Transactions récentes</h2>
        <a href="{{ route('admin.transactions') }}" class="text-sm font-medium" style="color:#F26522;">Tout voir →</a>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-left border-b border-slate-200">
                <tr>
                    <th class="px-5 py-3 font-semibold">Référence</th>
                    <th class="px-5 py-3 font-semibold">Agent</th>
                    <th class="px-5 py-3 font-semibold">Type</th>
                    <th class="px-5 py-3 font-semibold text-right">Montant</th>
                    <th class="px-5 py-3 font-semibold">Statut</th>
                    <th class="px-5 py-3 font-semibold">Date</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse($recentTransactions as $tx)
                    <tr class="hover:bg-slate-50">
                        <td class="px-5 py-3 font-mono text-xs text-slate-600">{{ $tx->reference ?? '—' }}</td>
                        <td class="px-5 py-3 text-slate-700">{{ $tx->agent->user->name ?? '—' }}</td>
                        <td class="px-5 py-3 text-slate-600 capitalize">{{ $tx->type }}</td>
                        <td class="px-5 py-3 text-right font-medium text-slate-900">{{ number_format($tx->amount, 0, ',', ' ') }} XOF</td>
                        <td class="px-5 py-3">
                            @php
                                $st = strtolower($tx->status ?? '');
                                $cls = match(true) {
                                    str_contains($st, 'succ') || str_contains($st, 'valid') || str_contains($st, 'complet') => 'bg-green-100 text-green-700',
                                    str_contains($st, 'attente') || str_contains($st, 'pend')                                  => 'bg-amber-100 text-amber-700',
                                    str_contains($st, 'échou') || str_contains($st, 'echou') || str_contains($st, 'annul')     => 'bg-red-100 text-red-700',
                                    default                                                                                    => 'bg-slate-100 text-slate-600',
                                };
                            @endphp
                            <span class="text-xs px-2 py-0.5 rounded-full capitalize {{ $cls }}">{{ $tx->status ?? '—' }}</span>
                        </td>
                        <td class="px-5 py-3 text-slate-500 text-xs">{{ $tx->created_at?->format('d/m/Y H:i') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="px-5 py-8 text-center text-slate-400">Aucune transaction</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
