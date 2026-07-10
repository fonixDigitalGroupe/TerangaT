@extends('layouts.admin')

@section('title', 'Transactions')

@section('content')

<div class="bg-white border border-slate-200 shadow-sm">

    {{-- Titre --}}
    <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
        <h2 class="font-normal text-white uppercase text-sm tracking-wide">Transactions</h2>
    </div>

    {{-- Contrôles : Afficher N lignes + Chercher --}}
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
        <form method="GET" class="flex items-center gap-2 text-xs text-slate-600">
            <span>Afficher</span>
            <select name="perPage" onchange="this.form.submit()"
                    class="px-1.5 py-1 border border-slate-300 rounded-md outline-none focus:border-slate-400 bg-white" style="font-size:10px;">
                @foreach([10, 25, 50, 100] as $n)
                    <option value="{{ $n }}" @selected($perPage == $n)>{{ $n }}</option>
                @endforeach
            </select>
            <span>lignes</span>
        </form>

        <div class="flex items-center gap-2">
            <label for="search" class="text-xs text-slate-600">Chercher :</label>
            <input type="text" id="search" onkeyup="filterTable(this.value)" placeholder=""
                   class="px-3 py-1 text-xs border border-slate-300 rounded-md outline-none focus:border-slate-400 w-56 bg-slate-100 focus:bg-white">
        </div>
    </div>

    {{-- Tableau --}}
    <div class="overflow-x-auto px-5 pb-1">
        <table class="w-full text-sm border border-slate-200 border-collapse" id="dataTable">
            <thead class="bg-white text-slate-700 text-left">
                <tr>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(0,'text')">Référence</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(1,'text')">Agent</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(2,'text')">Type</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(3,'num')">Montant</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(4,'num')">Commission</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(5,'text')">Statut</th>
                    <th class="border border-slate-200 px-2 py-3 text-xs font-semibold cursor-pointer select-none w-px" onclick="sortTable(6,'text')">Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse($transactions as $tx)
                    <tr class="odd:bg-slate-50 hover:bg-slate-100">
                        <td class="border border-slate-200 px-4 py-3 font-mono text-xs text-slate-600">{{ $tx->reference ?? '—' }}</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-700">{{ $tx->agent->user->name ?? '—' }}</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-600 capitalize">{{ $tx->type }}</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-900" data-sort="{{ $tx->amount }}">{{ number_format($tx->amount, 0, ',', ' ') }} XOF</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-600" data-sort="{{ $tx->commission }}">{{ number_format($tx->commission, 0, ',', ' ') }} XOF</td>
                        <td class="border border-slate-200 px-4 py-3">
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
                        <td class="border border-slate-200 px-2 py-3 text-xs text-slate-500 whitespace-nowrap w-px">{{ $tx->created_at?->format('d/m/y H:i') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="7" class="border border-slate-200 px-5 py-8 text-center text-slate-400">Aucune transaction</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- Pied : Lignes X à Y sur Z + pagination --}}
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4">
        <p class="text-xs text-slate-500">
            Lignes {{ $transactions->firstItem() ?? 0 }} à {{ $transactions->lastItem() ?? 0 }} sur {{ $transactions->total() }}
        </p>
        <nav class="flex items-center gap-1 text-xs">
            <a href="{{ $transactions->previousPageUrl() ?? '#' }}" class="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 {{ $transactions->onFirstPage() ? 'opacity-50 pointer-events-none' : '' }}">Prec</a>
            @foreach($transactions->getUrlRange(1, $transactions->lastPage()) as $page => $url)
                <a href="{{ $url }}" class="min-w-[24px] text-center px-2 py-1 rounded border {{ $page == $transactions->currentPage() ? 'text-white border-transparent' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50' }}" @if($page == $transactions->currentPage()) style="background-color:#F26522;" @endif>{{ $page }}</a>
            @endforeach
            <a href="{{ $transactions->nextPageUrl() ?? '#' }}" class="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 {{ ! $transactions->hasMorePages() ? 'opacity-50 pointer-events-none' : '' }}">Suiv</a>
        </nav>
    </div>
</div>

<script>
    function filterTable(q) {
        q = q.toLowerCase();
        document.querySelectorAll('#dataTable tbody tr').forEach(function(row) {
            row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    }

    let sortDir = {};
    function sortTable(col, type) {
        const tbody = document.querySelector('#dataTable tbody');
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.querySelectorAll('td').length > 1);
        const dir = sortDir[col] = !sortDir[col];
        rows.sort(function(a, b) {
            let x = a.children[col], y = b.children[col];
            let vx = type === 'num' ? parseFloat(x.dataset.sort || 0) : x.textContent.trim().toLowerCase();
            let vy = type === 'num' ? parseFloat(y.dataset.sort || 0) : y.textContent.trim().toLowerCase();
            if (vx < vy) return dir ? -1 : 1;
            if (vx > vy) return dir ? 1 : -1;
            return 0;
        });
        rows.forEach(r => tbody.appendChild(r));
    }
</script>
@endsection
