<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Administration — Téranga Trans</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        /* Échelle racine réduite : toutes les tailles Tailwind (rem) rétrécissent proportionnellement */
        html { font-size: 14px; }
        body { font-family: 'Inter', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        /* Tableaux compacts, alignés sur la maquette */
        main table th, main table td { padding-top:.4rem; padding-bottom:.4rem; }
        main table thead th { font-size:.8125rem; }
        main table tbody tr { transition: background .12s; }
        .nav-link { position:relative; display:flex; align-items:center; gap:.7rem; margin:2px 12px; padding:.6rem .85rem; border-radius:.625rem; font-size:.875rem; font-weight:500; color:#c7d0e0; transition:all .15s; }
        .nav-link:hover { background:rgba(255,255,255,.07); color:#fff; }
        .nav-link:hover svg { color:#fff; }
        .nav-link.active { background:rgba(255,255,255,.10); color:#F26522; font-weight:600; }
        .nav-link.active svg { color:#F26522; }
        .nav-link svg { color:#8b96ac; transition:color .15s; }
        .nav-badge { margin-left:auto; min-width:18px; height:18px; padding:0 5px; display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; border-radius:9px; background:#f59e0b; color:#fff; }
        .logout-link { color:#f0a0a0 !important; }
        .logout-link:hover { background:rgba(239,68,68,.12) !important; color:#fca5a5 !important; }
        .logout-link svg { color:#f0a0a0 !important; }
        .sidebar-label { padding:0 1.5rem; margin-bottom:.4rem; font-size:10px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#6b7896; }
        /* Sidebar repliable */
        #sidebar { width:15rem; transition:width .25s ease; }
        #sidebar.collapsed { width:68px; }
        #sidebar .side-collapsed-only { display:none; }
        #sidebar.collapsed .side-hide { display:none !important; }
        #sidebar.collapsed .side-collapsed-only { display:flex; }
        #sidebar.collapsed .nav-link { justify-content:center; margin:2px 10px; padding:.6rem; }
        #sidebar.collapsed .profile-row { justify-content:center; padding-left:0; padding-right:0; }
        /* Boutons d'action */
        .btn { display:inline-flex; align-items:center; gap:.3rem; font-size:.75rem; font-weight:600; padding:.3rem .65rem; border-radius:.375rem; color:#fff; transition:filter .12s, transform .06s; }
        .btn:hover { filter:brightness(.93); }
        .btn:active { transform:scale(.97); }
        .btn-edit { background:#3b82f6; }
        .btn-del  { background:#ef4444; }
    </style>
    @stack('styles')
</head>
<body class="antialiased bg-slate-100 text-slate-900 min-h-screen">
@php $pendingAgents = \App\Models\Agent::where('status', 'en attente')->count(); @endphp
<div class="min-h-screen flex">

    {{-- Sidebar (sombre, style KELASI) --}}
    <aside id="sidebar" class="shrink-0 flex flex-col overflow-hidden" style="background-color:#1e2a4a;">
        {{-- Logo (similaire à la version mobile) --}}
        <div class="h-16 flex flex-col items-center justify-center" style="background-color:#F26522;">
            <div class="side-hide flex flex-col items-center justify-center">
                <span class="leading-none text-white" style="font-family:'Dancing Script',cursive; font-size:2rem;">Téranga</span>
                <span class="font-bold uppercase text-white/90" style="letter-spacing:.28em; font-size:.45rem; margin-top:1px; transform:translateX(-16px);">Transfert</span>
            </div>
            <div class="side-collapsed-only w-9 h-9 rounded-md items-center justify-center bg-white">
                <span class="font-bold" style="color:#F26522;">T</span>
            </div>
        </div>

        {{-- Menu --}}
        @php
            if (! function_exists('navIcon')) { function navIcon($p) { return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 shrink-0">'.$p.'</svg>'; } }
            $icons = [
                'dashboard'     => '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />',
                'agents'        => '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />',
                'clients'       => '<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />',
                'transactions'  => '<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />',
                'wallets'       => '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />',
                'recharges'     => '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
                'commissions'   => '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
                'operateurs'    => '<path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />',
                'cartographie'  => '<path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />',
                'statistiques'  => '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />',
                'rapports'      => '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />',
                'notifications' => '<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />',
                'litiges'       => '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
                'utilisateurs'  => '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />',
                'roles'         => '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />',
                'compte'        => '<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />',
                'parametres'    => '<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.241.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />',
                'aide'          => '<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
            ];
            $sections = [
                'Gestion' => [
                    ['dashboard',    'admin.dashboard',    'Tableau de bord'],
                    ['agents',       'admin.agents',       'Agents'],
                    ['transactions', 'admin.transactions', 'Transactions'],
                    ['commissions',  'admin.commissions',  'Commissions'],
                    ['operateurs',   'admin.operateurs',   'Opérateurs'],
                ],
                'Suivi' => [
                    ['cartographie', 'admin.cartographie', 'Cartographie'],
                    ['statistiques', 'admin.statistiques', 'Statistiques'],
                    ['rapports',     'admin.rapports',     'Rapports'],
                    ['notifications','admin.notifications','Notifications'],
                    ['litiges',      'admin.litiges',      'Litiges'],
                ],
                'Système' => [
                    ['parametres',   'admin.parametres',   'Paramètres'],
                ],
            ];
        @endphp
        <nav class="flex-1 py-4 overflow-y-auto no-scrollbar">
            @foreach($sections as $label => $items)
                <p class="sidebar-label side-hide {{ ! $loop->first ? 'mt-4' : '' }}">{{ $label }}</p>
                @foreach($items as [$key, $route, $text])
                    <a href="{{ route($route) }}" title="{{ $text }}" class="nav-link {{ request()->routeIs($route) ? 'active' : '' }}">
                        {!! navIcon($icons[$key]) !!}
                        <span class="side-hide">{{ $text }}</span>
                        @if($key === 'agents' && $pendingAgents > 0)<span class="nav-badge side-hide">{{ $pendingAgents }}</span>@endif
                    </a>
                @endforeach
            @endforeach
        </nav>

    </aside>

    {{-- Zone principale --}}
    <div class="flex-1 flex flex-col min-w-0">

        {{-- Header (blanc) --}}
        <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
            <button type="button" onclick="toggleSidebar()" class="w-9 h-9 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>

            <div class="flex items-center gap-4 text-slate-500">
                {{-- Plein écran --}}
                <button type="button" title="Plein écran" onclick="toggleFullscreen()" class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                </button>

                <span class="w-px h-6 bg-slate-200"></span>

                {{-- Profil --}}
                <div class="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-200">
                    @include('admin.partials.avatar')
                </div>
            </div>
        </header>

        <main class="flex-1 p-6 overflow-x-auto">
            @yield('content')
        </main>

        <footer class="text-center text-xs text-slate-400 py-4">
            {{ date('Y') }} &copy; Téranga Trans
        </footer>
    </div>
</div>

<script>
    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }
</script>
</body>
</html>
