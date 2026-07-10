<header class="bg-white border-b border-slate-200 sticky top-0 z-50 h-32">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div class="flex items-center gap-8">
            <a href="/" class="flex items-center gap-1 group">
                <!-- Original Icon + Téranga (Isolated from image) -->
                <img src="{{ asset('images/logo-teranga-partial.png') }}" alt="Téranga" style="height: 60px; width: auto; object-fit: contain;">
                
                <!-- 'Transfert' in Cursive/Italic Font as requested -->
                <span class="text-5xl font-bold italic" style="color: #F26522; font-family: 'Dancing Script', cursive; margin-left: -12px; transform: translateY(-4px);">Transfert</span>
                
                <!-- Country Selector -->
                <div class="flex items-center gap-2 transition-opacity" style="margin-left: 100px; padding-left: 24px; border-left: 1px solid #e2e8f0; cursor: pointer;">
                    <img src="https://flagcdn.com/w40/sn.png" alt="Sénégal" class="w-6 h-auto rounded-sm border border-slate-100">
                    <span class="text-[#2d547d] font-semibold text-lg">Sénégal</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-[#2d547d]">
                        <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    </svg>
                </div>
            </a>
            <div class="hidden md:flex items-center gap-6 text-slate-600 font-medium">
                <!-- Accueil link removed for now -->
                @auth
                    <a href="{{ route('dashboard') }}" class="hover:text-blue-600 transition-colors">Tableau de bord</a>
                    <a href="{{ route('transactions.index') }}" class="hover:text-blue-600 transition-colors">Transactions</a>
                    <a href="{{ route('wallets.index') }}" class="hover:text-blue-600 transition-colors">E-Wallet</a>
                @endauth
            </div>
        </div>
        <div class="flex items-center gap-4">
            @guest
                <div class="flex items-center gap-3">
                    <a href="{{ route('register') }}" class="text-white px-5 py-2 rounded-[8px] font-medium transition-all shadow-sm active:scale-95" style="background-color: #F26522;">
                        Inscription
                    </a>
                    <a href="{{ route('login') }}" class="bg-white border text-white px-5 py-[6px] rounded-[8px] font-medium transition-all shadow-sm active:scale-95" style="border-color: #F26522; color: #F26522;">
                        Connexion
                    </a>
                </div>
            @else
                <div class="flex items-center gap-4">
                    <span class="text-slate-600 font-medium hidden sm:inline">{{ auth()->user()->name }}</span>
                    <form action="{{ route('logout') }}" method="POST" class="inline">
                        @csrf
                        <button type="submit" class="text-red-600 hover:text-red-700 font-medium transition-colors">
                            Déconnexion
                        </button>
                    </form>
                </div>
            @endguest
        </div>
    </nav>
</header>
