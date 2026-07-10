@extends('layouts.auth')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
    <div class="w-full max-w-xs bg-white shadow-sm border border-slate-200 overflow-hidden">

        {{-- Bandeau titre (orange) --}}
        <div class="py-5 px-5 text-center" style="background-color: #F26522;">
            <p class="text-white text-sm font-semibold tracking-wide">Espace d'administration</p>
        </div>

        {{-- Corps du formulaire --}}
        <div class="px-6 py-6">
            @if(session('error'))
                <div class="bg-red-50 text-red-600 p-2.5 mb-4 text-xs text-center">
                    {{ session('error') }}
                </div>
            @endif

            <form action="{{ route('login') }}" method="POST" class="space-y-3">
                @csrf

                {{-- Email --}}
                <div>
                    <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus
                           placeholder="Votre adresse email"
                           class="w-full px-3 py-2 text-sm border border-slate-200 text-slate-700 placeholder-slate-400 outline-none transition-colors"
                           onfocus="this.style.borderColor='#fdc9a3'" onblur="this.style.borderColor=''">
                    @error('email') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- Mot de passe --}}
                <div>
                    <div class="relative">
                        <input type="password" name="password" id="password" required
                               placeholder="Votre mot de passe"
                               class="w-full px-3 py-2 text-sm border border-slate-200 text-slate-700 placeholder-slate-400 outline-none transition-colors pr-9"
                               onfocus="this.style.borderColor='#fdc9a3'" onblur="this.style.borderColor=''">
                        <button type="button" onclick="toggleVisibility('password')" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center" style="z-index: 10;">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" id="password-eye-open">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 hidden" id="password-eye-closed">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822L21 21m-2.228-2.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L9.878 9.878" />
                            </svg>
                        </button>
                    </div>
                    @error('login') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- Bouton (gris) --}}
                <div class="pt-1">
                    <button type="submit"
                            class="w-full py-2 text-sm font-semibold text-white transition-colors"
                            style="background-color: #5b6675;"
                            onmouseover="this.style.backgroundColor='#4a5563'" onmouseout="this.style.backgroundColor='#5b6675'">
                        Se connecter
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    function toggleVisibility(id) {
        const input = document.getElementById(id);
        const eyeOpen = document.getElementById(id + '-eye-open');
        const eyeClosed = document.getElementById(id + '-eye-closed');

        if (input.type === 'password') {
            input.type = 'text';
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
        } else {
            input.type = 'password';
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
        }
    }
</script>
@endsection
