@extends('layouts.admin')

@section('title', $operator->exists ? 'Modifier opérateur' : 'Nouvel opérateur')

@section('content')
<div class="max-w-xl">
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">{{ $operator->exists ? 'Modifier l\'opérateur' : 'Nouvel opérateur' }}</h2>
        </div>

        <form action="{{ $operator->exists ? route('admin.operateurs.update', $operator) : route('admin.operateurs.store') }}" method="POST" class="p-6 space-y-4">
            @csrf
            @if($operator->exists) @method('PUT') @endif

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                <input type="text" name="name" value="{{ old('name', $operator->name) }}" required
                       class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
                @error('name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Logo (chemin image)</label>
                <input type="text" name="logo" value="{{ old('logo', $operator->logo) }}" placeholder="images/logo-wave.png"
                       class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
                <p class="text-xs text-slate-400 mt-1">Ex : images/logo-wave.png, images/logo-OM.png, images/logo-yass.png</p>
                @error('logo') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Frais (%)</label>
                    <input type="number" step="0.01" min="0" max="100" name="fee_percent" value="{{ old('fee_percent', $operator->fee_percent ?? 0) }}" required
                           class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
                    @error('fee_percent') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                    <select name="status" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400 bg-white">
                        <option value="actif" @selected(old('status', $operator->status) === 'actif')>Actif</option>
                        <option value="inactif" @selected(old('status', $operator->status) === 'inactif')>Inactif</option>
                    </select>
                </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
                <button type="submit" class="text-white text-sm font-semibold px-5 py-2 rounded-md" style="background-color:#F26522;">Enregistrer</button>
                <a href="{{ route('admin.operateurs') }}" class="text-sm font-medium text-slate-500 hover:text-slate-700">Annuler</a>
            </div>
        </form>
    </div>
</div>
@endsection
