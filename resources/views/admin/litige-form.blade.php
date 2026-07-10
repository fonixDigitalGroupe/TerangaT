@extends('layouts.admin')

@section('title', 'Nouveau litige')

@section('content')
<div class="max-w-xl">
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Nouveau litige</h2>
        </div>

        <form action="{{ route('admin.litiges.store') }}" method="POST" class="p-6 space-y-4">
            @csrf

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Agent concerné</label>
                <select name="agent_id" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400 bg-white">
                    <option value="">— Aucun —</option>
                    @foreach($agents as $agent)
                        <option value="{{ $agent->id }}" @selected(old('agent_id') == $agent->id)>{{ $agent->user->name ?? 'Agent #'.$agent->id }} ({{ $agent->code }})</option>
                    @endforeach
                </select>
                @error('agent_id') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Référence transaction (optionnel)</label>
                <input type="text" name="transaction_reference" value="{{ old('transaction_reference') }}"
                       class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Sujet</label>
                <input type="text" name="subject" value="{{ old('subject') }}" required
                       class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
                @error('subject') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea name="description" rows="4" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">{{ old('description') }}</textarea>
            </div>

            <div class="flex items-center gap-3 pt-2">
                <button type="submit" class="text-white text-sm font-semibold px-5 py-2 rounded-md" style="background-color:#F26522;">Enregistrer</button>
                <a href="{{ route('admin.litiges') }}" class="text-sm font-medium text-slate-500 hover:text-slate-700">Annuler</a>
            </div>
        </form>
    </div>
</div>
@endsection
