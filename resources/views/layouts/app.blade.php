<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Téranga Trans</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
    <!-- Scripts & Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.10/build/css/intlTelInput.css">
    <script src="https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.10/build/js/intlTelInput.min.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bg-teranga-blue { background-color: #2d547d !important; }
        .iti { width: 100%; }
        .iti__flag-container { border-radius: 8px 0 0 8px; }
        .iti__selected-dial-code { 
            padding-right: 12px;
            margin-right: 12px;
            border-right: 1px solid #e2e8f0;
            height: 100%;
            display: flex;
            align-items: center;
        }
        .iti__selected-flag {
            height: 100%;
            display: flex;
            align-items: center;
        }
    </style>
    @stack('styles')
</head>
<body class="antialiased bg-white text-slate-900 min-h-screen flex flex-col">
    <x-header />

    <div class="flex-grow flex w-full max-w-[1600px] mx-auto">
        <!-- Sidebar Navigation (Left) -->
        <aside class="flex flex-col w-[100px] lg:w-[120px] shrink-0 text-white py-8 items-center gap-8 sticky top-32 self-start h-[calc(100vh-128px)] overflow-y-auto no-scrollbar" style="background-color: #2d547d;">
            <!-- Version Debug: {{ now()->toDateTimeString() }} -->

            <!-- Contact -->
            <a href="#" class="flex flex-col items-center group gap-2">
                <div class="bg-white rounded-full flex items-center justify-center shadow-md transition-all group-hover:scale-110 group-active:scale-95 shrink-0" style="width: 64px; height: 64px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#2d547d" style="width: 32px; height: 32px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.143-7.143c-.155-.441.011-.928.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                </div>
                <span class="text-xs lg:text-sm font-medium text-center">Contact</span>
            </a>

            <!-- FAQ -->
            <a href="#" class="flex flex-col items-center group gap-2">
                <div class="bg-white rounded-full flex items-center justify-center shadow-md transition-all group-hover:scale-110 group-active:scale-95 shrink-0" style="width: 64px; height: 64px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#2d547d" style="width: 32px; height: 32px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                </div>
                <span class="text-xs lg:text-sm font-medium text-center">FAQ</span>
            </a>

            <!-- Sécurité -->
            <a href="#" class="flex flex-col items-center group gap-2">
                <div class="bg-white rounded-full flex items-center justify-center shadow-md transition-all group-hover:scale-110 group-active:scale-95 shrink-0" style="width: 64px; height: 64px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#2d547d" style="width: 32px; height: 32px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                </div>
                <span class="text-xs lg:text-sm font-medium text-center">Sécurité</span>
            </a>

            <!-- Mention Légale -->
            <a href="#" class="flex flex-col items-center group gap-2">
                <div class="bg-white rounded-full flex items-center justify-center shadow-md transition-all group-hover:scale-110 group-active:scale-95 shrink-0" style="width: 64px; height: 64px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#2d547d" style="width: 32px; height: 32px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                </div>
                <span class="text-xs lg:text-sm font-medium text-center leading-tight">Mentions<br>Légales</span>
            </a>
        </aside>

        <!-- Main Content (Center) -->
        <main class="flex-grow w-full p-4 lg:p-8">
            @yield('content')
        </main>

        <!-- Banner (Right Card Container) -->
        <aside class="hidden lg:block w-[300px] xl:w-[350px] shrink-0 pt-0 pr-0 pb-12 pl-4 sticky top-32 self-start h-[calc(100vh-128px)] overflow-y-auto no-scrollbar">
            <x-banner />
        </aside>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 py-4 px-8 shrink-0">
        <div class="max-w-[1600px] mx-auto flex items-center justify-between relative">
            <!-- Left Side -->
            <div class="flex items-center gap-8 text-sm text-[#2d547d]">
                <span>&copy; InTouch SAS</span>
                <a href="#" class="hover:underline font-medium">Mentions légales</a>
            </div>

            <!-- Right Side + Support Badge -->
            <div class="flex items-center gap-6">
                <span class="text-sm text-slate-400">Suivez-nous</span>
                
                <div class="flex items-center gap-3">
                    <a href="#" class="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors">
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                    </a>
                    <a href="#" class="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors">
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                    <a href="#" class="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors">
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </a>
                    <a href="#" class="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors">
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    </a>
                </div>

                <!-- Support Badge -->
                <div class="absolute -top-12 right-64 xl:right-80">
                    <div class="relative group cursor-pointer">
                        <div class="w-20 h-20 bg-[#a61324] rounded-full border-4 border-white shadow-xl flex items-center justify-center -rotate-12 transform transition-transform group-hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-10 h-10">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.083.185.13.381.13.588 0 1.25-.79 2.25-1.875 2.25h-5.25c-1.085 0-1.875-1-1.875-2.25s.79-2.25 1.875-2.25h1.125c.34 0 .638-.175.76-.462.115-.27.12-.59-.033-.878A12.036 12.036 0 0 0 12 4.5c-6.627 0-12 5.373-12 12s5.373 12 12 12c4.095 0 7.728-2.05 9.93-5.207l1.32.99a.75.75 0 0 0 1.104-.897 13.515 13.515 0 0 0-1.12-2.12c.15-.323.235-.68.235-1.054 0-1.168-.787-2.1-1.815-2.235-.06-.17-.11-.345-.15-.525a.75.75 0 0 0-.25-.453l-.95-.712a.75.75 0 0 0-1.2 1.353l.95.712c.045.034.09.07.13.11-.01.076-.017.153-.017.23 0 .762.455 1.407 1.05 1.705l.39.195a12.043 12.043 0 0 1-8.55 4.575 12.04 12.04 0 0 1-8.55-4.575l.39-.195a1.868 1.868 0 0 0 1.05-1.705c0-.96-.71-1.758-1.638-1.862A10.5 10.5 0 1 1 12 22.5c-2.43 0-4.685-.826-6.484-2.21a.75.75 0 1 0-.932 1.173A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12 0-1.868-.427-3.633-1.185-5.2a.75.75 0 0 0-1.2.353z" />
                                <circle cx="12" cy="12" r="3" fill="white" />
                            </svg>
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span class="text-[10px] font-black text-[#a61324] bg-white px-2 py-0.5 rounded-full shadow-sm absolute -top-1 border border-[#a61324] rotate-[-15deg]">BESOIN D'AIDE ?</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>
