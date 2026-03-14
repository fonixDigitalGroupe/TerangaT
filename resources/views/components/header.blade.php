<header class="bg-white border-b border-slate-200 sticky top-0 z-50">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-8">
            <a href="/" class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Téranga Trans
            </a>
            <div class="hidden md:flex items-center gap-6 text-slate-600 font-medium">
                <a href="/" class="hover:text-blue-600 transition-colors">Accueil</a>
                @auth
                    <a href="{{ route('dashboard') }}" class="hover:text-blue-600 transition-colors">Tableau de bord</a>
                    <a href="{{ route('transactions.index') }}" class="hover:text-blue-600 transition-colors">Transactions</a>
                    <a href="{{ route('wallets.index') }}" class="hover:text-blue-600 transition-colors">E-Wallet</a>
                @endauth
            </div>
        </div>
        <div class="flex items-center gap-4">
            @guest
                <a href="{{ route('register') }}" class="bg-[#e27630] hover:bg-[#c96627] text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm shadow-orange-200 active:scale-95">
                    Inscription
                </a>
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
