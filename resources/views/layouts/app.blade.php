<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Téranga Trans</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
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
</head>
<body class="antialiased bg-[#0f172a] text-slate-900 flex flex-col min-h-screen overflow-x-hidden">
    <x-header />

    <div class="flex-grow flex w-full h-[calc(100vh-64px)]">
        <!-- Sidebar Navigation (Left) -->
        <aside class="hidden md:flex flex-col w-[100px] lg:w-[120px] shrink-0 bg-teranga-blue text-white py-8 items-center gap-8 overflow-y-auto no-scrollbar">
            <!-- Accueil -->
            <a href="/" class="flex flex-col items-center group gap-2">
                <div class="w-14 h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center text-teranga-blue shadow-lg transition-all group-hover:scale-110 group-active:scale-95">
                    <span class="sr-only">ICON</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 lg:w-8 lg:h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </div>
                <span class="text-xs lg:text-sm font-medium text-center">Accueil</span>
            </a>

            <!-- Contact -->
            <a href="#" class="flex flex-col items-center group gap-2">
                <div class="w-14 h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center text-teranga-blue shadow-lg transition-all group-hover:scale-110 group-active:scale-95">
                    <span class="sr-only">ICON</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 lg:w-8 lg:h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                </div>
                <span class="text-xs lg:text-sm font-medium text-center">Contact</span>
            </a>

            <!-- FAQ -->
            <a href="#" class="flex flex-col items-center group gap-2">
                <div class="w-14 h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center text-teranga-blue shadow-lg transition-all group-hover:scale-110 group-active:scale-95">
                    <span class="sr-only">ICON</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 lg:w-8 lg:h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                </div>
                <span class="text-xs lg:text-sm font-medium text-center">FAQ</span>
            </a>

            <!-- Sécurité -->
            <a href="#" class="flex flex-col items-center group gap-2">
                <div class="w-14 h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center text-teranga-blue shadow-lg transition-all group-hover:scale-110 group-active:scale-95">
                    <span class="sr-only">ICON</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 lg:w-8 lg:h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6.223h4.756c.622 0 1.124.504 1.124 1.127V8.25c0 .623-.502 1.127-1.124 1.127H3.598c-.146 0-.289.028-.43.082L3.17 10.46a1.5 1.5 0 0 0 0 1.08l.002.006c.14.054.284.082.43.082h4.756c.622 0 1.124.504 1.124 1.127v.9c0 .623-.502 1.127-1.124 1.127H3.598a11.959 11.959 0 0 1 8.402 3.398c2.92-2.92 6.471-4.704 10.402-5.398h-4.756c-.622 0-1.124-.504-1.124-1.127v-.9c0-.623.502-1.127-1.124-1.127h4.756a1.5 1.5 0 0 0 0-1.08l-.002-.006a1.5 1.5 0 0 0-.43-.082h-4.756c-.622 0-1.124-.504-1.124-1.127v-.9c0-.623.502-1.127 1.124-1.127h4.756A11.959 11.959 0 0 1 12 2.714Z" />
                    </svg>
                </div>
                <span class="text-xs lg:text-sm font-medium text-center">Sécurité</span>
            </a>

            <!-- Mention Légale -->
            <a href="#" class="flex flex-col items-center group gap-2">
                <div class="w-14 h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center text-teranga-blue shadow-lg transition-all group-hover:scale-110 group-active:scale-95">
                    <span class="sr-only">ICON</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 lg:w-8 lg:h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                    </svg>
                </div>
                <span class="text-xs lg:text-sm font-medium text-center leading-tight">Mentions<br>Légales</span>
            </a>
        </aside>

        <!-- Main Content (Center) -->
        <main class="flex-grow w-full p-4 lg:p-8 overflow-y-auto no-scrollbar">
            @yield('content')
        </main>

        <!-- Banner (Right Card Container) -->
        <aside class="hidden lg:block w-[300px] xl:w-[350px] shrink-0 pt-0 pr-0 pb-12 pl-4 overflow-y-auto no-scrollbar">
            <x-banner />
        </aside>
    </div>
</body>
</html>
