@extends('layouts.admin')

@section('title', 'Commissions')

@section('content')
<div class="bg-white border border-slate-200 shadow-sm">

    {{-- Titre --}}
    <div class="px-5 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1" style="background-color:#5b6675;">
        <h2 class="font-normal text-white uppercase text-sm tracking-wide">Commissions</h2>
        <span class="text-xs text-white/90">
            Plateforme : <span class="font-semibold">{{ number_format($totalPlatform, 0, ',', ' ') }} XOF</span>
            &nbsp;·&nbsp; Agents : <span class="font-semibold">{{ number_format($totalAgent, 0, ',', ' ') }} XOF</span>
        </span>
    </div>

    {{-- Contrôles --}}
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
        <form method="GET" class="flex items-center gap-2 text-xs text-slate-600">
            <span>Afficher</span>
            <select name="perPage" onchange="this.form.submit()" class="px-1.5 py-1 border border-slate-300 rounded-md outline-none focus:border-slate-400 bg-white" style="font-size:10px;">
                @foreach([10, 25, 50, 100] as $n)<option value="{{ $n }}" @selected($perPage == $n)>{{ $n }}</option>@endforeach
            </select>
            <span>lignes</span>
        </form>
        <div class="flex items-center gap-2">
            <label for="search" class="text-xs text-slate-600">Chercher :</label>
            <input type="text" id="search" onkeyup="filterTable(this.value)" class="px-3 py-1 text-xs border border-slate-300 rounded-md outline-none focus:border-slate-400 w-56 bg-slate-100 focus:bg-white">
        </div>
    </div>

    {{-- Tableau --}}
    <div class="overflow-x-auto px-5 pb-1">
        <table class="w-full text-sm border border-slate-200 border-collapse" id="dataTable">
            <thead class="bg-white text-slate-700 text-left">
                <tr>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Référence</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Agent</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold text-right">Part agent</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold text-right">Part plateforme</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse($commissions as $com)
                    <tr class="odd:bg-slate-50 hover:bg-slate-100">
                        <td class="border border-slate-200 px-4 py-3 font-mono text-xs text-slate-600">{{ $com->transaction->reference ?? '—' }}</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-700">{{ $com->transaction->agent->user->name ?? '—' }}</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-900 text-right">{{ number_format($com->agent_amount, 0, ',', ' ') }} XOF</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs font-semibold text-right" style="color:#F26522;">{{ number_format($com->platform_amount, 0, ',', ' ') }} XOF</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{{ $com->created_at?->format('d/m/y H:i') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="border border-slate-200 px-5 py-8 text-center text-slate-400">Aucune commission</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4">
        <p class="text-xs text-slate-500">Lignes {{ $commissions->firstItem() ?? 0 }} à {{ $commissions->lastItem() ?? 0 }} sur {{ $commissions->total() }}</p>
        <nav class="flex items-center gap-1 text-xs">
            <a href="{{ $commissions->previousPageUrl() ?? '#' }}" class="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 {{ $commissions->onFirstPage() ? 'opacity-50 pointer-events-none' : '' }}">Prec</a>
            @foreach($commissions->getUrlRange(1, $commissions->lastPage()) as $page => $url)
                <a href="{{ $url }}" class="min-w-[24px] text-center px-2 py-1 rounded border {{ $page == $commissions->currentPage() ? 'text-white border-transparent' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50' }}" @if($page == $commissions->currentPage()) style="background-color:#F26522;" @endif>{{ $page }}</a>
            @endforeach
            <a href="{{ $commissions->nextPageUrl() ?? '#' }}" class="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 {{ ! $commissions->hasMorePages() ? 'opacity-50 pointer-events-none' : '' }}">Suiv</a>
        </nav>
    </div>
</div>

<script>
    function filterTable(q) {
        q = q.toLowerCase();
        document.querySelectorAll('#dataTable tbody tr').forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none');
    }
</script>
@endsection
