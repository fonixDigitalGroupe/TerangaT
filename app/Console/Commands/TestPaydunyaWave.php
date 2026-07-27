<?php

namespace App\Console\Commands;

use App\Services\PaydunyaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Diagnostic Wave SoftPay : crée une facture puis appelle softpay/wave-senegal
 * et affiche l'intégralité de la requête et de la réponse PayDunya.
 *
 * À lancer SUR LE SERVEUR (les clés PayDunya y sont) :
 *   php artisan paydunya:test-wave 77XXXXXXX --amount=200
 *
 * Le numéro doit être un compte Wave réel (sinon Wave rejette).
 */
class TestPaydunyaWave extends Command
{
    protected $signature = 'paydunya:test-wave {phone : Numéro Wave (9 chiffres, sans +221)} {--amount=200} {--name=Test Teranga} {--webhook= : URL joignable qui remplace callback/return/cancel_url pour ce test}';

    protected $description = 'Teste PayDunya Wave SoftPay et affiche la réponse brute.';

    public function handle(PaydunyaService $paydunya): int
    {
        $phone   = preg_replace('/\D/', '', (string) $this->argument('phone'));
        $amount  = (int) $this->option('amount');
        $name    = (string) $this->option('name');
        $webhook = trim((string) $this->option('webhook'));

        $this->line('Mode PayDunya : ' . config('paydunya.mode'));
        $this->line('Clés chargées : ' . (config('paydunya.master_key') ? 'oui' : 'NON — .env incomplet'));
        $this->line("Test Wave -> phone={$phone}, montant={$amount}");
        $this->newLine();

        // URLs d'action réellement envoyées (config .env, ou webhook si fourni).
        $actions = [];
        if ($webhook !== '') {
            $actions = ['cancel_url' => $webhook, 'return_url' => $webhook, 'callback_url' => $webhook];
            $this->comment("URLs d'action forcées sur : {$webhook}");
        } else {
            $this->comment("URLs d'action (config .env) :");
            $this->line('  callback_url = ' . (config('paydunya.callback_url') ?: 'VIDE'));
            $this->line('  return_url   = ' . (config('paydunya.return_url') ?: 'VIDE'));
            $this->line('  cancel_url   = ' . (config('paydunya.cancel_url') ?: 'VIDE'));
        }
        $this->newLine();

        // Test d'accessibilité : Wave exige que ces URLs répondent (idéalement 200).
        $this->comment("Accessibilité des URLs (ce que voit un serveur externe) :");
        $toCheck = $actions ?: [
            'callback_url' => config('paydunya.callback_url'),
            'return_url'   => config('paydunya.return_url'),
            'cancel_url'   => config('paydunya.cancel_url'),
        ];
        foreach ($toCheck as $key => $url) {
            if (! $url) {
                $this->line("  {$key} : VIDE");
                continue;
            }
            try {
                $status = Http::timeout(10)->get($url)->status();
                $flag = ($status >= 200 && $status < 400) ? 'OK' : 'PROBLEME';
                $this->line("  {$key} : HTTP {$status} [{$flag}] {$url}");
            } catch (\Throwable $e) {
                $this->line("  {$key} : INJOIGNABLE [{$url}] -> " . $e->getMessage());
            }
        }
        $this->newLine();

        $this->info('1) Création de la facture…');
        $invoice = $paydunya->createInvoice($amount, "Diagnostic Wave {$phone}", ['diagnostic' => true], $actions);
        $this->line('  ok=' . var_export($invoice['ok'], true) . ' token=' . ($invoice['token'] ?? 'AUCUN'));
        if (! $invoice['ok'] || ! $invoice['token']) {
            $this->error('Échec createInvoice — réponse brute :');
            $this->line(json_encode($invoice['raw'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            return self::FAILURE;
        }

        $this->newLine();
        $this->info('2) Appel softpay/wave-senegal…');
        $res = $paydunya->softpayWave($invoice['token'], $name, $phone);
        $this->line('  ok=' . var_export($res['ok'], true) . ' url=' . ($res['url'] ?? 'AUCUNE'));
        $this->newLine();
        $this->comment('Réponse brute PayDunya :');
        $this->line(json_encode($res['raw'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return $res['ok'] ? self::SUCCESS : self::FAILURE;
    }
}
