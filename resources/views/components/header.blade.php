<header class="bg-white border-b border-slate-200 sticky top-0 z-50 h-24">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div class="flex items-center gap-8">
            <a href="/" class="flex items-center">
                <img src="{{ asset('images/logo-teranga.png') }}" alt="Téranga Transfert" style="height: 90px; width: auto; object-fit: contain;">
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
                    <a href="{{ route('register') }}" class="text-white px-5 py-2 rounded-[8px] font-medium transition-all shadow-sm active:scale-95" style="background-color: #fb6300;">
                        Inscription
                    </a>
                    <a href="{{ route('login') }}" class="bg-white border text-white px-5 py-[6px] rounded-[8px] font-medium transition-all shadow-sm active:scale-95" style="border-color: #fb6300; color: #fb6300;">
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
