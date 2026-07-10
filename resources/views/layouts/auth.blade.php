<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Téranga Trans — Administration</title>
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
<body class="antialiased bg-white text-slate-900 min-h-screen">
    <main class="w-full min-h-screen">
        @yield('content')
    </main>
</body>
</html>
