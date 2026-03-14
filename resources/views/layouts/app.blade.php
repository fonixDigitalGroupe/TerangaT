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
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen overflow-x-hidden">
    <x-header />

    <div class="flex-grow flex w-full h-[calc(100vh-64px)]">
        <!-- Sidebar Navigation (Left) -->
        <aside class="hidden md:flex flex-col w-[100px] lg:w-[120px] shrink-0 bg-[#212b5a] text-white py-8 items-center gap-6 overflow-y-auto">
            <!-- Navigation items and logos can be placed here later -->
        </aside>

        <!-- Main Content (Center) -->
        <main class="flex-grow w-full p-4 lg:p-8 overflow-y-auto">
            @yield('content')
        </main>

        <!-- Banner (Right Card Container) -->
        <aside class="hidden lg:block w-[300px] xl:w-[350px] shrink-0 p-4 lg:pt-[220px] xl:pt-[250px] lg:pb-12 lg:pr-8 overflow-y-auto">
            <x-banner />
        </aside>
    </div>
</body>
</html>
