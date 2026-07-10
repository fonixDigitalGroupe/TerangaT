@extends('layouts.admin')

@section('title', 'Rapports')

@section('content')
<div class="max-w-2xl">
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Générer un rapport</h2>
        </div>

        <form action="{{ route('admin.rapports.export') }}" method="GET" class="p-6 space-y-5">

            {{-- Type de rapport --}}
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Type de rapport</label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    @php
                        $types = [
                            ['transactions', 'Transactions', 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'],
                            ['agents', 'Agents', 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'],
                            ['commissions', 'Commissions', 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
                        ];
                    @endphp
                    @foreach($types as $i => [$val, $label, $icon])
                        <label class="relative cursor-pointer">
                            <input type="radio" name="type" value="{{ $val }}" class="peer sr-only" {{ $i === 0 ? 'checked' : '' }}>
                            <div class="flex flex-col items-center gap-2 border border-slate-200 rounded-lg p-4 text-center transition-all peer-checked:border-[#F26522] peer-checked:bg-orange-50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="#5b6675" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="{{ $icon }}" /></svg>
                                <span class="text-xs font-medium text-slate-700">{{ $label }}</span>
                            </div>
                        </label>
                    @endforeach
                </div>
            </div>

            {{-- Période --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Du</label>
                    <input type="date" name="from" class="w-full h-9 text-sm border border-slate-300 rounded-md px-2 outline-none focus:border-slate-400">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Au</label>
                    <input type="date" name="to" class="w-full h-9 text-sm border border-slate-300 rounded-md px-2 outline-none focus:border-slate-400">
                </div>
            </div>
            <p class="text-xs text-slate-400">Laissez les dates vides pour exporter toutes les données.</p>

            {{-- Bouton --}}
            <div class="pt-2">
                <button type="submit" class="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-md" style="background-color:#F26522;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Télécharger le CSV
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
