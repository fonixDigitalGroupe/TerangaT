<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use App\Services\PaydunyaService;
use Illuminate\Console\Command;

/**
 * Relance le reversement (déboursement) des transactions dont la collecte a
 * réussi mais dont le versement au client a échoué (statut « à reverser »),
 * typiquement après un solde PayDunya insuffisant.
 *
 * À lancer une fois le compte PayDunya réapprovisionné :
 *   php artisan paydunya:retry-disburse                 # toutes les « à reverser »
 *   php artisan paydunya:retry-disburse TRX-HWYFOAE8D3Q # une transaction précise
 */
class RetryPaydunyaDisburse extends Command
{
    protected $signature = 'paydunya:retry-disburse {reference? : Référence précise ; sinon toutes les transactions à reverser}';

    protected $description = 'Relance le reversement des transactions collectées mais non reversées.';

    private const MODES = [
        'wave'         => 'wave-senegal',
        'orange-money' => 'orange-money-senegal',
    ];

    public function handle(PaydunyaService $paydunya): int
    {
        $query = Transaction::where('status', 'à reverser');
        if ($ref = $this->argument('reference')) {
            $query->where('reference', $ref);
        }
        $txs = $query->get();

        if ($txs->isEmpty()) {
            $this->info('Aucune transaction à reverser.');
            return self::SUCCESS;
        }

        $this->info("{$txs->count()} transaction(s) à reverser.");
        $okCount = 0;

        foreach ($txs as $tx) {
            $operator = $tx->recipient_operator ?? $tx->operator;
            $mode = self::MODES[$operator] ?? 'wave-senegal';
            $this->line("→ {$tx->reference} : reversement de {$tx->amount} vers {$tx->client_phone} ({$mode})…");

            $disb = $paydunya->disburse($tx->client_phone, (int) $tx->amount, $mode, $tx->reference);

            if ($disb['ok']) {
                $status = ($disb['status'] ?? null) === 'pending' ? 'en attente' : 'completed';
                $tx->update([
                    'status'       => $status,
                    'disburse_ref' => data_get($disb, 'raw.provider_ref') ?? data_get($disb, 'raw.transaction_id'),
                ]);
                $this->info("  OK ({$status})");
                $okCount++;
            } else {
                $this->error('  Échec : ' . ($disb['message'] ?? 'inconnu'));
                $this->line('  ' . json_encode($disb['raw'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            }
        }

        $this->newLine();
        $this->info("Terminé : {$okCount}/{$txs->count()} reversée(s).");

        return self::SUCCESS;
    }
}
