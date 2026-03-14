<header class="bg-white border-b border-slate-200 sticky top-0 z-50 h-24">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div class="flex items-center gap-8">
            <a href="/" class="flex items-center gap-4 group">
                <!-- Circular Icon SVG (Professional & Sharp) -->
                <div class="relative flex items-center justify-center shrink-0" style="width: 60px; height: 60px;">
                    <svg viewBox="0 0 100 100" class="w-full h-full shadow-sm rounded-full">
                        <circle cx="50" cy="50" r="48" fill="#fb6300" />
                        <!-- Clean T Shape -->
                        <rect x="28" y="35" width="44" height="8" rx="2" fill="white" />
                        <rect x="46" y="35" width="8" height="35" rx="2" fill="white" />
                        <!-- Elegant Upward Arrow -->
                        <path d="M40 28 L50 14 L60 28 Z" fill="white" />
                    </svg>
                </div>
                <!-- Text Logo with Premium Typography -->
                <div class="flex items-baseline gap-1 select-none">
                    <span class="text-3xl font-extrabold tracking-tight" style="color: #2d547d; font-family: 'Inter', sans-serif;">Téranga</span>
                    <span class="text-4xl font-bold italic" style="color: #fb6300; font-family: 'Dancing Script', cursive; margin-left: 6px; text-shadow: 0.5px 0.5px 0px rgba(0,0,0,0.05);">Transfert</span>
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
