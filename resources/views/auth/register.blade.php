@extends('layouts.app')

@section('content')
<div class="max-w-2xl mx-auto my-12 px-4">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900 mb-2 text-center">Devenir un Agent Téranga Trans</h2>
        <p class="text-slate-500 text-center mb-8">Rejoignez le réseau leader du transfert d'argent</p>

        <form action="{{ route('register') }}" method="POST" class="space-y-6">
            @csrf
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- User Info -->
                <div class="space-y-4">
                    <h3 class="font-bold text-slate-900 border-b pb-2">Informations Personnelles</h3>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
                        <input type="text" name="name" value="{{ old('name') }}" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        @error('name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                        <input type="text" name="phone" value="{{ old('phone') }}" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        @error('phone') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" name="email" value="{{ old('email') }}" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        @error('email') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                        <input type="password" name="password" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Confirmer mot de passe</label>
                        <input type="password" name="password_confirmation" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>
                </div>

                <!-- Agent/Shop Info -->
                <div class="space-y-4">
                    <h3 class="font-bold text-slate-900 border-b pb-2">Informations de la Boutique</h3>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Nom de la Boutique</label>
                        <input type="text" name="shop_name" value="{{ old('shop_name') }}" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        @error('shop_name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">NINEA</label>
                        <input type="text" name="ninea" value="{{ old('ninea') }}" class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                        <input type="text" name="address" value="{{ old('address') }}" class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Numéro Wave</label>
                        <input type="text" name="wave_number" value="{{ old('wave_number') }}" class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Numéro OM</label>
                        <input type="text" name="om_number" value="{{ old('om_number') }}" class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    </div>
                </div>
            </div>

            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all mt-6 shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                Créer mon compte Agent
            </button>
        </form>
        
        <p class="text-center text-slate-500 text-sm mt-8">
            Déjà inscrit ? <a href="{{ route('login') }}" class="text-blue-600 font-bold">Connectez-vous ici</a>
        </p>
    </div>
</div>
@endsection
