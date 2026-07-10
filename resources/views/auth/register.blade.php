@extends('layouts.app')

@push('styles')
<style>
    body { background-color: #ffffff !important; }
</style>
@endpush

@section('content')
<div class="max-w-lg mx-auto -mt-8 mb-12 px-4">
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900 mb-2 text-center">Devenir un Agent Téranga Trans</h2>
        <p class="text-slate-500 text-center mb-6">Rejoignez le réseau leader du transfert d'argent</p>

        <form action="{{ route('register') }}" method="POST" class="space-y-6">
            @csrf
            
            <div class="space-y-4">
                <!-- Row 1: Prénom & Nom -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                        <input type="text" name="first_name" value="{{ old('first_name') }}" required autofocus class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none transition-all focus:ring-1" onfocus="this.style.borderColor='#F26522'" onblur="this.style.borderColor=''">
                        @error('first_name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                        <input type="text" name="last_name" value="{{ old('last_name') }}" required class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none transition-all focus:ring-1" onfocus="this.style.borderColor='#F26522'" onblur="this.style.borderColor=''">
                        @error('last_name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                </div>

                <!-- Row 2: Pays & Téléphone -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Pays de résidence</label>
                        <select name="country" required class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none transition-all bg-white focus:ring-1" onfocus="this.style.borderColor='#F26522'" onblur="this.style.borderColor=''">
                            <option value="">Sélectionnez un pays</option>
                            <option value="Senegal" {{ old('country') == 'Senegal' ? 'selected' : '' }}>Sénégal</option>
                            <option value="Mali" {{ old('country') == 'Mali' ? 'selected' : '' }}>Mali</option>
                            <option value="Cote d'Ivoire" {{ old('country') == "Cote d'Ivoire" ? 'selected' : '' }}>Côte d'Ivoire</option>
                            <option value="Guinee" {{ old('country') == 'Guinee' ? 'selected' : '' }}>Guinée</option>
                            <option value="Burkina Faso" {{ old('country') == 'Burkina Faso' ? 'selected' : '' }}>Burkina Faso</option>
                        </select>
                        @error('country') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Numéro de Téléphone</label>
                        <input type="tel" id="phone" name="phone_input" value="{{ old('phone_input') }}" required class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none transition-all focus:ring-1" placeholder="Ex: 771234567" onfocus="this.style.borderColor='#F26522'" onblur="this.style.borderColor=''">
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

                            // Update hidden input on change
                            const updateHiddenInput = () => {
                                if (iti.isValidNumber()) {
                                    phoneFull.value = iti.getNumber();
                                } else {
                                    phoneFull.value = phoneInput.value; // Fallback to raw value
                                }
                            };

                            phoneInput.addEventListener('change', updateHiddenInput);
                            phoneInput.addEventListener('keyup', updateHiddenInput);
                            phoneInput.addEventListener('countrychange', updateHiddenInput);
                        });
                    </script>
                </div>

                <!-- Row 3: Code PIN & Confirmer -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Code PIN (4 chiffres)</label>
                        <div class="relative">
                            <input type="password" name="password" id="pin" required maxlength="4" class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none transition-all pr-12 focus:ring-1" onfocus="this.style.borderColor='#F26522'" onblur="this.style.borderColor=''">
                            <button type="button" onclick="toggleVisibility('pin')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center p-1" style="z-index: 10;">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" id="pin-eye-open">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 hidden" id="pin-eye-closed">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822L21 21m-2.228-2.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L9.878 9.878" />
                                </svg>
                            </button>
                        </div>
                        @error('password') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Confirmer le code</label>
                        <div class="relative">
                            <input type="password" name="password_confirmation" id="pin_confirmation" required maxlength="4" class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none transition-all pr-12 focus:ring-1" onfocus="this.style.borderColor='#F26522'" onblur="this.style.borderColor=''">
                            <button type="button" onclick="toggleVisibility('pin_confirmation')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center p-1" style="z-index: 10;">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" id="pin_confirmation-eye-open">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 hidden" id="pin_confirmation-eye-closed">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822L21 21m-2.228-2.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L9.878 9.878" />
                                </svg>
                            </button>
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
            </div>

            <button type="submit" class="w-full text-white py-3 rounded-xl font-bold text-lg transition-all mt-6 active:scale-[0.98] border-none" style="background-color: #F26522;">
                Créer mon compte
            </button>
        </form>
        
        <p class="text-center text-slate-500 text-sm mt-8">
    </div>
</div>
@endsection
