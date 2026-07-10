@extends('layouts.admin')

@section('title', 'Modifier un agent')

@section('content')
<div class="max-w-xl">
    <div class="bg-white rounded-lg border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-200">
            <h2 class="font-semibold text-slate-700 uppercase text-sm tracking-wide">Modifier l'agent</h2>
        </div>

        <form action="{{ route('admin.agents.update', $agent) }}" method="POST" class="p-6 space-y-4">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                    <input type="text" name="first_name" value="{{ old('first_name', $agent->user->first_name) }}" required
                           class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
                    @error('first_name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                    <input type="text" name="last_name" value="{{ old('last_name', $agent->user->last_name) }}" required
                           class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
                    @error('last_name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input type="text" name="phone" value="{{ old('phone', $agent->user->phone) }}" required
                       class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
                @error('phone') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Boutique</label>
                <input type="text" name="shop_name" value="{{ old('shop_name', $agent->shop_name) }}"
                       class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
                @error('shop_name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="flex items-center gap-3 pt-2">
                <button type="submit" class="text-white text-sm font-semibold px-5 py-2 rounded-md" style="background-color:#3b82f6;">
                    Enregistrer
                </button>
                <a href="{{ route('admin.agents') }}" class="text-sm font-medium text-slate-500 hover:text-slate-700">Annuler</a>
            </div>
        </form>
    </div>
</div>
@endsection
