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
                <label class="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input type="tel" id="phone" name="phone_input" value="{{ old('phone_input') }}" required autofocus class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none transition-all focus:ring-1" onfocus="this.style.borderColor='#fb6300'" onblur="this.style.borderColor=''">
                <input type="hidden" name="phone" id="phone_full" value="{{ old('phone') }}">
                @error('phone') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const phoneInput = document.querySelector("#phone");
                    const phoneFull = document.querySelector("#phone_full");
                    
                    const iti = window.intlTelInput(phoneInput, {
                        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.10/build/js/utils.js",
                        initialCountry: "sn",
                        separateDialCode: true,
                        preferredCountries: ["sn", "ml", "ci", "gn", "bf"],
                        autoPlaceholder: "aggressive"
                    });

                    const updateHiddenInput = () => {
                        if (iti.isValidNumber()) {
                            phoneFull.value = iti.getNumber();
                        } else {
                            phoneFull.value = phoneInput.value;
                        }
                    };

                    phoneInput.addEventListener('change', updateHiddenInput);
                    phoneInput.addEventListener('keyup', updateHiddenInput);
                    phoneInput.addEventListener('countrychange', updateHiddenInput);
                });
            </script>
            
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                <div class="relative">
                    <input type="password" name="password" id="password" required class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none transition-all pr-10 focus:ring-1" onfocus="this.style.borderColor='#fb6300'" onblur="this.style.borderColor=''">
                    <button type="button" onclick="toggleVisibility('password')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center p-1" style="z-index: 10;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" id="password-eye-open">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 hidden" id="password-eye-closed">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822L21 21m-2.228-2.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L9.878 9.878" />
                        </svg>
                    </button>
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
            @error('login') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror

            <button type="submit" class="w-full text-white py-3 rounded-lg font-bold transition-all mt-4 active:scale-[0.98] border-none" style="background-color: #fb6300;">
                Se connecter
            </button>
        </form>
        
        <p class="text-center text-slate-500 text-sm mt-6">
            Pas encore de compte ? <a href="{{ route('register') }}" class="text-blue-600 font-bold">Inscrivez-vous</a>
        </p>
    </div>
</div>
@endsection
