<?php

namespace App\Console\Commands;

use App\Services\PaydunyaService;
use Illuminate\Console\Command;

/**
 * Diagnostic déboursement : envoie un montant EXACT à un numéro, sans aucune
 * commission Téranga/agent, pour mesurer les frais réels prélevés par PayDunya
 * et en déduire la grille de commissions.
 *
 * ⚠️ PAIEMENT RÉEL : débite le solde PayDunya du compte.
 *
 *   php artisan paydunya:test-disburse 77XXXXXXX --amount=300 --operator=orange-money
 *   php artisan paydunya:test-disburse 77XXXXXXX --amount=300 --operator=wave
 */
class TestPaydunyaDisburse extends Command
{
    protected $signature = 'paydunya:test-disburse {phone : Numéro bénéficiaire (9 chiffres)} {--amount=300} {--operator=orange-money : wave | orange-money}';

    protected $description = 'Envoie un déboursement réel et affiche le montant reçu + les frais PayDunya.';

    private const MODES = [
        'wave'         => 'wave-senegal',
        'orange-money' => 'orange-money-senegal',
    ];

    public function handle(PaydunyaService $paydunya): int
    {
        $phone    = preg_replace('/\D/', '', (string) $this->argument('phone'));
        $amount   = (int) $this->option('amount');
        $operator = (string) $this->option('operator');
        $mode     = self::MODES[$operator] ?? null;

        if (! $mode) {
            $this->error("Opérateur invalide : {$operator} (attendu : wave ou orange-money)");
            return self::FAILURE;
        }

        $this->line('Mode PayDunya : ' . config('paydunya.mode'));
        $this->line("Déboursement RÉEL -> {$phone}, montant={$amount}, canal={$mode}");
        $this->warn('⚠️  Ceci débite votre solde PayDunya. Ctrl+C pour annuler.');
        $this->newLine();

        $res = $paydunya->disburse($phone, $amount, $mode, 'TEST-' . $phone);

        $this->line('ok=' . var_export($res['ok'], true) . ' status=' . ($res['status'] ?? '—'));
        $this->newLine();
        $this->comment('Réponse brute PayDunya (cherchez « Amount of X FCFA has been transfered ») :');
        $this->line(json_encode($res['raw'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        $this->newLine();
        $this->info("Vous avez envoyé {$amount}. Comparez avec le montant réellement transféré ci-dessus : la différence = frais PayDunya sur le déboursement.");

        return $res['ok'] ? self::SUCCESS : self::FAILURE;
    }
}
