@extends('layouts.admin')

@section('title', 'Opérateurs')

@section('content')

@if(session('success'))
    <div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{{ session('success') }}</div>
@endif

<div class="bg-white border border-slate-200 shadow-sm">

    {{-- Titre --}}
    <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
        <h2 class="font-normal text-white uppercase text-sm tracking-wide">Opérateurs</h2>
    </div>

    {{-- Barre d'outils --}}
    <div class="px-5 pt-4">
        <a href="{{ route('admin.operateurs.create') }}"
           class="inline-flex items-center gap-2 h-8 text-xs font-medium text-white px-3 rounded-sm transition-colors" style="background-color:#F26522;"
           onmouseover="this.style.filter='brightness(.93)'" onmouseout="this.style.filter=''">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Nouvel opérateur
        </a>
    </div>

    {{-- Tableau --}}
    <div class="overflow-x-auto px-5 py-4">
        <table class="w-full text-sm border border-slate-200 border-collapse">
            <thead class="bg-white text-slate-700 text-left">
                <tr>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Opérateur</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold text-right">Frais (%)</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Statut</th>
                    <th class="border border-slate-200 px-4 py-3 text-xs font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($operators as $op)
                    <tr class="odd:bg-slate-50 hover:bg-slate-100">
                        <td class="border border-slate-200 px-4 py-3">
                            <div class="flex items-center gap-3">
                                @if($op->logo)
                                    <img src="{{ asset($op->logo) }}" alt="{{ $op->name }}" class="w-8 h-8 object-contain rounded">
                                @else
                                    <span class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style="background-color:#5b6675;">{{ strtoupper(substr($op->name, 0, 1)) }}</span>
                                @endif
                                <span class="text-xs font-medium text-slate-800">{{ $op->name }}</span>
                            </div>
                        </td>
                        <td class="border border-slate-200 px-4 py-3 text-xs text-slate-700 text-right">{{ rtrim(rtrim(number_format($op->fee_percent, 2, ',', ' '), '0'), ',') }} %</td>
                        <td class="border border-slate-200 px-4 py-3">
                            @php $cls = $op->status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; @endphp
                            <span class="text-xs px-2 py-0.5 rounded-full capitalize {{ $cls }}">{{ $op->status }}</span>
                        </td>
                        <td class="border border-slate-200 px-4 py-3">
                            <div class="flex items-center gap-2">
                                <a href="{{ route('admin.operateurs.edit', $op) }}" class="btn btn-edit">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                                    Modifier
                                </a>
                                <form action="{{ route('admin.operateurs.destroy', $op) }}" method="POST" onsubmit="return confirm('Supprimer cet opérateur ?');">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="btn btn-del">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                        Supprimer
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="border border-slate-200 px-5 py-8 text-center text-slate-400">Aucun opérateur</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
