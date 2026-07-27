@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Page Header & Navigation -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 class="text-3xl font-bold text-slate-900">Nouvelle Transaction</h1>
            <p class="text-slate-500">Effectuez un dépôt ou un retrait pour un client</p>
        </div>
        <a href="{{ route('transactions.index') }}" class="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95">
            ← Retour
        </a>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar / Top Cards -->
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p class="text-slate-500 text-sm font-medium mb-1">Solde Wallet</p>
                <p class="text-2xl font-bold text-blue-600">{{ number_format(auth()->user()->agent->wallet->balance, 0, ',', ' ') }} XOF</p>
            </div>
            
            <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 class="font-bold text-blue-900 mb-2">Informations</h3>
                <ul class="text-sm text-blue-800 space-y-2">
                    <li>• Vérifiez toujours le numéro du client avant validation.</li>
                    <li>• Les frais de dépôt peuvent être déduits ou payés en espèces.</li>
                    <li>• Les commissions de retrait sont créditées automatiquement.</li>
                </ul>
            </div>
        </div>

        <!-- Main Form Area -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 class="font-bold text-slate-900">Détails de l'opération</h2>
                </div>
                <div class="p-6 sm:p-8">
                    <form action="{{ route('transactions.store') }}" method="POST" class="space-y-6">
                        @csrf
                        
                        <div class="space-y-5">
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Type d'opération</label>
                                <select name="type" id="type-selector" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 bg-white">
                                    <option value="dépôt" {{ old('type', request('type')) == 'dépôt' ? 'selected' : '' }}>Dépôt</option>
                                    <option value="retrait" {{ old('type', request('type')) == 'retrait' ? 'selected' : '' }}>Retrait</option>
                                </select>
                            </div>

                            <div id="strategy-container">
                                <label class="block text-sm font-medium text-slate-500 mb-1">Stratégie des frais</label>
                                <select name="fee_strategy" id="strategy-selector" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 bg-white">
                                    <!-- Options will be populated by JS -->
                                </select>
                                <div id="strategy-description" class="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                                    <!-- Description will be populated by JS -->
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label class="block text-sm font-medium text-slate-500 mb-1">Montant (XOF)</label>
                                    <input type="number" name="amount" id="amount-input" value="{{ old('amount') }}" required min="1" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xl font-bold text-slate-900">
                                    @error('amount') <p class="text-red-500 text-sm mt-1 font-medium">{{ $message }}</p> @enderror
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-slate-500 mb-1">Téléphone Client</label>
                                    <input type="text" name="client_phone" value="{{ old('client_phone') }}" required placeholder="Ex: 77 000 00 00" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900">
                                    @error('client_phone') <p class="text-red-500 text-sm mt-1 font-medium">{{ $message }}</p> @enderror
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all mt-8 shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                            Confirmer l'opération
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    const typeSelector = document.getElementById('type-selector');
    const strategySelector = document.getElementById('strategy-selector');
    const strategyDesc = document.getElementById('strategy-description');
    const amountInput = document.getElementById('amount-input');

    const strategies = {
        'dépôt': [
            { value: 'client_pays', label: 'Frais payés par le client (Cash)', desc: 'Le client paie le montant + 5% de frais en espèces. Votre wallet est débité du montant exact.' },
            { value: 'deducted', label: 'Frais déduits du montant', desc: 'Les frais de 5% sont retirés du montant. Le client reçoit (Montant - 5%) sur son compte. Votre wallet est débité du net reçu par le client.' }
        ],
        'retrait': [
            { value: 'agent_receives', label: 'Commission créditée au Wallet', desc: 'Vous payez le montant en espèces au client. Votre wallet est crédité du (Montant + votre part de commission).' }
        ]
    };

    function updateStrategies() {
        const type = typeSelector.value;
        const options = strategies[type];
        
        strategySelector.innerHTML = '';
        options.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.value;
            el.textContent = opt.label;
            strategySelector.appendChild(el);
        });
        
        updateDescription();
    }

    function updateDescription() {
        const type = typeSelector.value;
        const strategy = strategySelector.value;
        const opt = strategies[type].find(o => o.value === strategy);
        strategyDesc.textContent = opt ? opt.desc : '';
    }

    typeSelector.addEventListener('change', updateStrategies);
    strategySelector.addEventListener('change', updateDescription);

    // Initialize
    updateStrategies();
</script>
@endsection
