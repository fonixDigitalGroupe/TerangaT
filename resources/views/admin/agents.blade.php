@extends('layouts.admin')

@section('title', 'Agents')

@section('content')

@if(session('success'))
    <div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
        {{ session('success') }}
    </div>
@endif

<div class="bg-white border border-slate-200 shadow-sm">

    {{-- Titre --}}
    <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
        <h2 class="font-normal text-white uppercase text-sm tracking-wide">Agents</h2>
    </div>

    {{-- Barre d'outils --}}
    <form method="GET" id="toolbar" class="px-5 pt-4 flex flex-wrap items-center gap-2">
        <input type="hidden" name="perPage" value="{{ $perPage }}">

        <a href="{{ route('admin.agents') }}"
           class="inline-flex items-center gap-2 h-8 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 px-3 rounded-sm transition-colors">
            Liste des agents
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
        </a>

        {{-- Filtre par région --}}
        <select name="region" onchange="this.form.submit()"
                class="h-8 text-xs text-slate-600 bg-white border border-slate-300 rounded-sm px-2 outline-none focus:border-slate-400">
            <option value="">Toutes les régions</option>
            @foreach($regions as $r)
                <option value="{{ $r }}" @selected($region === $r)>{{ $r }}</option>
            @endforeach
        </select>

        {{-- Filtre par statut --}}
        <select name="status" onchange="this.form.submit()"
                class="h-8 text-xs text-slate-600 bg-white border border-slate-300 rounded-sm px-2 outline-none focus:border-slate-400">
            <option value="">Tous les statuts</option>
            <option value="vérifié" @selected($status === 'vérifié')>Vérifié</option>
            <option value="en attente" @selected($status === 'en attente')>En attente</option>
        </select>

        {{-- Imprimer --}}
        <button type="button" onclick="window.print()"
                class="inline-flex items-center gap-2 h-8 text-xs font-medium text-white px-3 rounded-sm transition-colors" style="background-color:#F26522;"
                onmouseover="this.style.filter='brightness(.93)'" onmouseout="this.style.filter=''">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
            Imprimer
        </button>
    </form>

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
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(0,'text')">Code</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(1,'text')">Agent</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(2,'text')">Téléphone</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(3,'text')">Boutique</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold cursor-pointer select-none" onclick="sortTable(4,'text')">Statut</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Détail</th>
                </tr>
            </thead>
            <tbody>
                @forelse($agents as $agent)
                    <tr class="odd:bg-slate-50 hover:bg-slate-100">
                        <td class="border border-slate-200 px-4 py-3 whitespace-nowrap">
                            <span class="inline-block font-mono text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">{{ $agent->code ?? '—' }}</span>
                        </td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-700 whitespace-nowrap">{{ $agent->user->name ?? '—' }}</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-600">{{ $agent->user->phone ?? '—' }}</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-600">{{ $agent->shop_name ?? '—' }}</td>
                        <td class="border border-slate-200 px-4 py-3">
                            @php
                                $st = strtolower($agent->status ?? 'en attente');
                                $cls = str_contains($st, 'vérif') || str_contains($st, 'verif')
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700';
                            @endphp
                            <span class="text-xs px-2 py-0.5 rounded-full capitalize {{ $cls }}">{{ $agent->status ?? 'en attente' }}</span>
                        </td>
                        <td class="border border-slate-200 px-4 py-3">
                            <a href="{{ route('admin.agents.show', $agent) }}"
                               class="inline-flex items-center gap-1 text-xs font-medium text-white px-2.5 py-1 rounded-md transition-colors" style="background-color:#2563eb;"
                               onmouseover="this.style.filter='brightness(.93)'" onmouseout="this.style.filter=''">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                Voir
                            </a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="border border-slate-200 px-5 py-8 text-center text-slate-400">Aucun agent</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- Pied : Lignes X à Y sur Z + pagination --}}
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4">
        <p class="text-xs text-slate-500">
            Lignes {{ $agents->firstItem() ?? 0 }} à {{ $agents->lastItem() ?? 0 }} sur {{ $agents->total() }}
        </p>

        <nav class="flex items-center gap-1 text-xs">
            <a href="{{ $agents->previousPageUrl() ?? '#' }}"
               class="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors {{ $agents->onFirstPage() ? 'opacity-50 pointer-events-none' : '' }}">Prec</a>

            @foreach($agents->getUrlRange(1, $agents->lastPage()) as $page => $url)
                <a href="{{ $url }}"
                   class="min-w-[24px] text-center px-2 py-1 rounded border transition-colors {{ $page == $agents->currentPage() ? 'text-white border-transparent' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50' }}"
                   @if($page == $agents->currentPage()) style="background-color:#F26522;" @endif>{{ $page }}</a>
            @endforeach

            <a href="{{ $agents->nextPageUrl() ?? '#' }}"
               class="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors {{ ! $agents->hasMorePages() ? 'opacity-50 pointer-events-none' : '' }}">Suiv</a>
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
