@extends('layouts.admin')

@section('title', 'Litiges')

@section('content')

@if(session('success'))
    <div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{{ session('success') }}</div>
@endif

{{-- Résumé --}}
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
    <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <p class="text-slate-500 text-xs mb-0.5">Ouverts</p>
        <p class="text-lg font-bold text-red-600">{{ $counts['ouvert'] }}</p>
    </div>
    <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <p class="text-slate-500 text-xs mb-0.5">En cours</p>
        <p class="text-lg font-bold" style="color:#2563eb;">{{ $counts['en_cours'] }}</p>
    </div>
    <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <p class="text-slate-500 text-xs mb-0.5">Résolus</p>
        <p class="text-lg font-bold text-green-600">{{ $counts['resolu'] }}</p>
    </div>
</div>

<div class="bg-white border border-slate-200 shadow-sm">
    <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
        <h2 class="font-normal text-white uppercase text-sm tracking-wide">Litiges &amp; réclamations</h2>
    </div>

    {{-- Barre d'outils --}}
    <form method="GET" class="px-5 pt-4 flex flex-wrap items-center gap-2">
        <a href="{{ route('admin.litiges.create') }}"
           class="inline-flex items-center gap-2 h-8 text-xs font-medium text-white px-3 rounded-sm" style="background-color:#F26522;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Nouveau litige
        </a>
        <select name="status" onchange="this.form.submit()" class="h-8 text-xs text-slate-600 bg-white border border-slate-300 rounded-sm px-2 outline-none focus:border-slate-400">
            <option value="">Tous les statuts</option>
            <option value="ouvert" @selected($status === 'ouvert')>Ouvert</option>
            <option value="en cours" @selected($status === 'en cours')>En cours</option>
            <option value="résolu" @selected($status === 'résolu')>Résolu</option>
        </select>
    </form>

    {{-- Tableau --}}
    <div class="overflow-x-auto px-5 py-4">
        <table class="w-full text-sm border border-slate-200 border-collapse">
            <thead class="bg-white text-slate-700 text-left">
                <tr>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Code</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Agent</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Sujet</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Réf. transaction</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Statut</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Date</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($disputes as $d)
                    <tr class="odd:bg-slate-50 hover:bg-slate-100">
                        <td class="border border-slate-200 px-4 py-3 whitespace-nowrap">
                            <span class="inline-block font-mono text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">{{ $d->code }}</span>
                        </td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-700">{{ $d->agent->user->name ?? '—' }}</td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-700">{{ $d->subject }}</td>
                        <td class="border border-slate-200 px-4 py-3 font-mono text-xs text-slate-600">{{ $d->transaction_reference ?? '—' }}</td>
                        <td class="border border-slate-200 px-4 py-3">
                            @php
                                $cls = match($d->status) {
                                    'résolu'   => 'bg-green-100 text-green-700',
                                    'en cours' => 'bg-blue-100 text-blue-700',
                                    default    => 'bg-red-100 text-red-700',
                                };
                            @endphp
                            <span class="text-xs px-2 py-0.5 rounded-full capitalize {{ $cls }}">{{ $d->status }}</span>
                        </td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{{ $d->created_at?->format('d/m/y H:i') }}</td>
                        <td class="border border-slate-200 px-4 py-3">
                            <div class="flex items-center gap-2">
                                <form action="{{ route('admin.litiges.status', $d) }}" method="POST" class="flex items-center gap-1">
                                    @csrf @method('PUT')
                                    <select name="status" onchange="this.form.submit()" class="h-7 text-xs border border-slate-300 rounded-sm px-1 outline-none bg-white">
                                        <option value="ouvert" @selected($d->status==='ouvert')>Ouvert</option>
                                        <option value="en cours" @selected($d->status==='en cours')>En cours</option>
                                        <option value="résolu" @selected($d->status==='résolu')>Résolu</option>
                                    </select>
                                </form>
                                <form action="{{ route('admin.litiges.destroy', $d) }}" method="POST" onsubmit="return confirm('Supprimer ce litige ?');">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="btn btn-del"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="7" class="border border-slate-200 px-5 py-8 text-center text-slate-400">Aucun litige</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="px-5 py-4">{{ $disputes->links() }}</div>
</div>
@endsection
