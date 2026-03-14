@extends('layouts.app')

@section('content')
<div class="max-w-2xl mx-auto my-12 px-4">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex items-center gap-4 mb-8">
            <a href="{{ route('transactions.index') }}" class="text-slate-400 hover:text-slate-600 transition-colors">
                ← Retour
            </a>
            <h2 class="text-2xl font-bold text-slate-900">Effectuer une Transaction</h2>
        </div>

        <form action="{{ route('transactions.store') }}" method="POST" class="space-y-6">
            @csrf
            
            <div class="bg-blue-50 p-6 rounded-xl border border-blue-100 flex justify-between items-center mb-6">
                <div>
                    <p class="text-blue-600 text-sm font-medium">Solde actuel</p>
                    <p class="text-2xl font-bold text-blue-900">{{ number_format(auth()->user()->agent->wallet->balance, 0, ',', ' ') }} XOF</p>
                </div>
                <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                    💰
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Type d'opération</label>
                    <select name="type" id="type-selector" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700">
                        <option value="dépôt" {{ old('type', request('type')) == 'dépôt' ? 'selected' : '' }}>Dépôt</option>
                        <option value="retrait" {{ old('type', request('type')) == 'retrait' ? 'selected' : '' }}>Retrait</option>
                    </select>
                </div>

                <div id="strategy-container">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Stratégie des frais</label>
                    <select name="fee_strategy" id="strategy-selector" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700">
                        <!-- Options will be populated by JS -->
                    </select>
                    <div id="strategy-description" class="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 italic">
                        <!-- Description will be populated by JS -->
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Montant (XOF)</label>
                    <input type="number" name="amount" id="amount-input" value="{{ old('amount') }}" required min="1" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xl font-bold">
                    @error('amount') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Téléphone Client</label>
                    <input type="text" name="client_phone" value="{{ old('client_phone') }}" required placeholder="Ex: 77 000 00 00" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    @error('client_phone') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
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
            </div>

            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all mt-6 shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                Confirmer l'opération
            </button>
        </form>
    </div>
</div>
@endsection
