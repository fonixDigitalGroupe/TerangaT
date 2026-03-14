@extends('layouts.app')

@section('content')
<div class="max-w-md mx-auto my-12 px-4">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900 mb-6 text-center">Connexion Agent</h2>
        
        @if(session('error'))
            <div class="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
                {{ session('error') }}
            </div>
        @endif

        <form action="{{ route('login') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" name="email" value="{{ old('email') }}" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                @error('email') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>
            
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                <input type="password" name="password" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            </div>

            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all mt-4">
                Se connecter
            </button>
        </form>
        
        <p class="text-center text-slate-500 text-sm mt-6">
            Pas encore de compte ? <a href="{{ route('register') }}" class="text-blue-600 font-bold">Inscrivez-vous</a>
        </p>
    </div>
</div>
@endsection
