@extends('layouts.admin')

@section('title', 'Statistiques')

@section('content')

{{-- Filtre par période --}}
<div class="bg-white border border-slate-200 shadow-sm mb-4 px-5 py-3">
    <form method="GET" class="flex flex-wrap items-end gap-3">
        <div>
            <label class="block text-xs text-slate-500 mb-1">Du</label>
            <input type="date" name="from" value="{{ $from }}" class="h-8 text-xs border border-slate-300 rounded-sm px-2 outline-none focus:border-slate-400">
        </div>
        <div>
            <label class="block text-xs text-slate-500 mb-1">Au</label>
            <input type="date" name="to" value="{{ $to }}" class="h-8 text-xs border border-slate-300 rounded-sm px-2 outline-none focus:border-slate-400">
        </div>
        <div>
            <label class="block text-xs text-slate-500 mb-1">Année (graphiques)</label>
            <select name="year" class="h-8 text-xs border border-slate-300 rounded-sm px-2 outline-none focus:border-slate-400 bg-white">
                @foreach($years as $y)
                    <option value="{{ $y }}" @selected($year == $y)>{{ $y }}</option>
                @endforeach
            </select>
        </div>
        <button type="submit" class="h-8 inline-flex items-center gap-2 text-xs font-medium text-white px-4 rounded-sm" style="background-color:#F26522;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
            Filtrer
        </button>
        @if($from || $to)
            <a href="{{ route('admin.statistiques') }}" class="h-8 inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-700 px-2">Réinitialiser</a>
        @endif
    </form>
</div>

{{-- KPIs --}}
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
    @php
        $kpiCards = [
            ['Transactions', number_format($kpis['transactions'], 0, ',', ' '), '#0ea5e9'],
            ['Volume total', number_format($kpis['volume'], 0, ',', ' ').' XOF', '#16a34a'],
            ['Commissions', number_format($kpis['commission'], 0, ',', ' ').' XOF', '#F26522'],
            ['Agents', number_format($kpis['agents'], 0, ',', ' '), '#2d547d'],
        ];
    @endphp
    @foreach($kpiCards as [$label, $value, $color])
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p class="text-slate-500 text-xs mb-0.5">{{ $label }}</p>
            <p class="text-lg font-bold truncate" style="color:{{ $color }};">{{ $value }}</p>
        </div>
    @endforeach
</div>

<div class="grid grid-cols-1 gap-4 mb-4">
    {{-- Volume mensuel --}}
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Volume par mois</h2>
        </div>
        <div class="p-5"><canvas id="chartMonth" height="70"></canvas></div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
    {{-- Par type (mensuel) --}}
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Nombre de transactions par type</h2>
        </div>
        <div class="p-5"><canvas id="chartType" height="130"></canvas></div>
    </div>

    {{-- Par statut (mensuel) --}}
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Nombre de transactions par statut</h2>
        </div>
        <div class="p-5"><canvas id="chartStatus" height="130"></canvas></div>
    </div>
</div>

<div class="grid grid-cols-1 gap-4">
    {{-- Top agents --}}
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Top agents (volume)</h2>
        </div>
        <div class="overflow-x-auto px-5 py-4">
            <table class="w-full text-sm border border-slate-200 border-collapse">
                <thead class="bg-white text-slate-700 text-left">
                    <tr>
                        <th class="border border-slate-200 px-4 py-2.5 text-xs font-semibold">Agent</th>
                        <th class="border border-slate-200 px-4 py-2.5 text-xs font-semibold text-right">Transactions</th>
                        <th class="border border-slate-200 px-4 py-2.5 text-xs font-semibold text-right">Volume</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($topAgents as $t)
                        <tr class="odd:bg-slate-50">
                            <td class="border border-slate-200 px-4 py-2.5 text-xs text-slate-700">{{ $t->agent->user->name ?? '—' }}</td>
                            <td class="border border-slate-200 px-4 py-2.5 text-xs text-slate-700 text-right">{{ number_format($t->c, 0, ',', ' ') }}</td>
                            <td class="border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 text-right">{{ number_format($t->v, 0, ',', ' ') }} XOF</td>
                        </tr>
                    @empty
                        <tr><td colspan="3" class="border border-slate-200 px-5 py-8 text-center text-slate-400">Aucune donnée</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof Chart === 'undefined') return;
        Chart.defaults.font.family = 'Inter, sans-serif';
        Chart.defaults.font.size = 11;
        const ORANGE = '#F26522', BLUE = '#2d547d', SKY = '#0ea5e9', GREEN = '#16a34a', AMBER = '#f59e0b', RED = '#ef4444', SLATE = '#94a3b8';

        // Volume par mois
        new Chart(document.getElementById('chartMonth'), {
            type: 'bar',
            data: {
                labels: @json($monthLabels),
                datasets: [{ label: 'Volume (XOF)', data: @json($monthlyData), backgroundColor: ORANGE, borderRadius: 4 }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
        });

        const MONTHS = @json($monthLabels);
        const stackedOpts = {
            plugins: { legend: { position: 'bottom' } },
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: {
                    stacked: true, beginAtZero: true,
                    ticks: { precision: 0, stepSize: 1 },
                    title: { display: true, text: 'Nombre de transactions' }
                }
            }
        };
        const typePalette = [BLUE, ORANGE, SKY, GREEN, AMBER];
        const statusPalette = [GREEN, AMBER, RED, SLATE, BLUE];

        // Par type (mensuel, empilé)
        new Chart(document.getElementById('chartType'), {
            type: 'bar',
            data: {
                labels: MONTHS,
                datasets: @json($typeDatasets).map(function (d, i) {
                    return { label: d.label, data: d.data, backgroundColor: typePalette[i % typePalette.length], borderRadius: 3 };
                })
            },
            options: stackedOpts
        });

        // Par statut (mensuel, empilé)
        new Chart(document.getElementById('chartStatus'), {
            type: 'bar',
            data: {
                labels: MONTHS,
                datasets: @json($statusDatasets).map(function (d, i) {
                    return { label: d.label, data: d.data, backgroundColor: statusPalette[i % statusPalette.length], borderRadius: 3 };
                })
            },
            options: stackedOpts
        });
    });
</script>
@endsection
