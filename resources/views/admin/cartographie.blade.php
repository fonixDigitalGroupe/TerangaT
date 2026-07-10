@extends('layouts.admin')

@section('title', 'Cartographie')

@push('styles')
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>#map { height: 420px; width: 100%; z-index: 0; }</style>
@endpush

@section('content')

{{-- Résumé --}}
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
    <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <p class="text-slate-500 text-xs mb-0.5">Agents localisés</p>
        <p class="text-lg font-bold text-slate-900">{{ number_format($totalAgents, 0, ',', ' ') }}</p>
    </div>
    <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <p class="text-slate-500 text-xs mb-0.5">Régions couvertes</p>
        <p class="text-lg font-bold text-slate-900">{{ $byRegion->count() }}</p>
    </div>
    <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <p class="text-slate-500 text-xs mb-0.5">Région principale</p>
        <p class="text-lg font-bold" style="color:#F26522;">{{ $byRegion->first()->region ?? '—' }}</p>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

    {{-- Carte --}}
    <div class="lg:col-span-2 bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Carte des agents</h2>
        </div>
        <div class="p-4"><div id="map" class="rounded-md overflow-hidden border border-slate-200"></div></div>
    </div>

    {{-- Répartition --}}
    <div class="bg-white border border-slate-200 shadow-sm">
        <div class="px-5 pt-4 pb-3" style="background-color:#5b6675;">
            <h2 class="font-normal text-white uppercase text-sm tracking-wide">Répartition par région</h2>
        </div>
        <div class="p-5 space-y-3">
            @forelse($byRegion as $r)
                <div>
                    <div class="flex justify-between text-xs mb-1">
                        <span class="text-slate-700 font-medium">{{ $r->region }}</span>
                        <span class="text-slate-500">{{ $r->total }}</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div class="h-full rounded-full" style="width: {{ $maxRegion ? ($r->total / $maxRegion * 100) : 0 }}%; background-color:#F26522;"></div>
                    </div>
                </div>
            @empty
                <p class="text-sm text-slate-400 text-center py-6">Aucune donnée</p>
            @endforelse
        </div>
    </div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        // Coordonnées approximatives par région / pays (Afrique de l'Ouest)
        const COORDS = {
            'sénégal': [14.6928, -17.4467], 'senegal': [14.6928, -17.4467],
            'mali': [12.6392, -8.0029], 'côte d\'ivoire': [5.3599, -4.0083], 'cote d\'ivoire': [5.3599, -4.0083],
            'guinée': [9.6412, -13.5784], 'guinee': [9.6412, -13.5784],
            'burkina faso': [12.3714, -1.5197], 'burkina': [12.3714, -1.5197],
            'dakar': [14.6928, -17.4467], 'thiès': [14.7910, -16.9256], 'thies': [14.7910, -16.9256],
            'saint-louis': [16.0179, -16.4896], 'ziguinchor': [12.5641, -16.2639], 'kaolack': [14.1652, -16.0728],
        };
        const regions = @json($byRegion->map(fn($r) => ['region' => $r->region, 'total' => $r->total]));

        const map = L.map('map').setView([14.4974, -14.4524], 6); // Sénégal
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap', maxZoom: 18
        }).addTo(map);

        const bounds = [];
        regions.forEach(function (r) {
            const key = (r.region || '').toLowerCase().trim();
            const c = COORDS[key];
            if (!c) return;
            bounds.push(c);
            const shopSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72L4.318 3.44A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" /></svg>';
            const icon = L.divIcon({
                className: '',
                html: '<div style="position:relative;width:40px;height:40px;">'
                    + '<div style="background:#F26522;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff;">'
                    + '<span style="transform:rotate(45deg);display:flex;">'+shopSvg+'</span></div>'
                    + '<span style="position:absolute;top:-6px;right:-6px;background:#1e2a4a;color:#fff;font-size:10px;font-weight:700;min-width:16px;height:16px;padding:0 4px;border-radius:9px;display:flex;align-items:center;justify-content:center;border:1.5px solid #fff;">'+r.total+'</span>'
                    + '</div>',
                iconSize: [40, 40], iconAnchor: [18, 36], popupAnchor: [0, -34]
            });
            L.marker(c, { icon }).addTo(map).bindPopup('<b>'+r.region+'</b><br>'+r.total+' agent(s)');
        });
        if (bounds.length) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 });
    });
</script>
@endsection
