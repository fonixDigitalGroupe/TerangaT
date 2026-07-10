@extends('layouts.admin')

@section('title', 'Notifications')

@section('content')

@if(session('success'))
    <div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{{ session('success') }}</div>
@endif

<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

    {{-- Composer --}}
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Nouvelle notification</h2>
        </div>
        <form action="{{ route('admin.notifications.store') }}" method="POST" class="p-5 space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                <input type="text" name="title" value="{{ old('title') }}" required
                       class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">
                @error('title') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea name="message" rows="4" required
                          class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400">{{ old('message') }}</textarea>
                @error('message') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Destinataires</label>
                <select name="audience" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md outline-none focus:border-slate-400 bg-white">
                    <option value="tous">Tous les agents ({{ $counts['tous'] }})</option>
                    <option value="verifie">Agents vérifiés ({{ $counts['verifie'] }})</option>
                    <option value="en_attente">Agents en attente ({{ $counts['en_attente'] }})</option>
                </select>
            </div>
            <button type="submit" class="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-md" style="background-color:#F26522;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
                Envoyer
            </button>
        </form>
    </div>

    {{-- Historique --}}
    <div class="lg:col-span-2 bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Historique des envois</h2>
        </div>
        <div class="divide-y divide-slate-100">
            @forelse($notifications as $notif)
                <div class="px-5 py-4 flex items-start gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style="background-color:#fff0e8;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="#F26522" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                            <p class="text-sm font-semibold text-slate-800">{{ $notif->title }}</p>
                            <span class="text-xs text-slate-400 whitespace-nowrap">{{ $notif->created_at?->format('d/m/y H:i') }}</span>
                        </div>
                        <p class="text-sm text-slate-600 mt-0.5">{{ $notif->message }}</p>
                        <div class="flex items-center gap-3 mt-2">
                            @php $aud = ['tous'=>'Tous les agents','verifie'=>'Agents vérifiés','en_attente'=>'Agents en attente'][$notif->audience] ?? $notif->audience; @endphp
                            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{{ $aud }}</span>
                            <span class="text-xs text-slate-400">{{ $notif->recipients }} destinataire(s)</span>
                            <form action="{{ route('admin.notifications.destroy', $notif) }}" method="POST" onsubmit="return confirm('Supprimer cette notification ?');" class="ml-auto">
                                @csrf @method('DELETE')
                                <button type="submit" class="text-xs font-medium" style="color:#d9534f;">Supprimer</button>
                            </form>
                        </div>
                    </div>
                </div>
            @empty
                <p class="px-5 py-10 text-center text-sm text-slate-400">Aucune notification envoyée</p>
            @endforelse
        </div>
        @if($notifications->hasPages())
            <div class="px-5 py-4">{{ $notifications->links() }}</div>
        @endif
    </div>
</div>
@endsection
