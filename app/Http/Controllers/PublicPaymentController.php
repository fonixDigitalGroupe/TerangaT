<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Transaction;
use App\Services\PaydunyaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Page de paiement publique liée au QR code d'un marchand.
 * URL : /pay/{code}  (code = Agent::code, ex. TT-ABC123)
 *
 * Le client scanne le QR du marchand, choisit type / opérateur / montant :
 *  - RETRAIT : le client est débité (SoftPay sur son numéro), le marchand est
 *    crédité ; la transaction suit son cours comme un retrait de l'app.
 *  - DÉPÔT   : une transaction « à confirmer » est créée sans PayDunya ; le
 *    marchand la confirme ensuite dans l'app (il a reçu le cash) pour créditer
 *    le client.
 */
class PublicPaymentController extends Controller
{
    private const OPERATORS = [
        'wave'         => ['mode' => 'wave-senegal',         'name' => 'Wave'],
        'orange-money' => ['mode' => 'orange-money-senegal', 'name' => 'Orange Money'],
    ];

    public function __construct(private PaydunyaService $paydunya)
    {
    }

    /** Affiche la page de paiement du marchand. */
    public function show(string $code)
    {
        $agent = Agent::where('code', $code)->firstOrFail();

        return view('pay.show', [
            'agent'     => $agent,
            'merchant'  => $agent->shop_name ?: ($agent->user->name ?? 'Marchand Téranga'),
            'code'      => $agent->code,
            'feeGrid'   => (array) config('paydunya.fee_grid', []),
        ]);
    }

    /** Traite la demande de paiement soumise depuis la page web. */
    public function store(Request $request, string $code)
    {
        $agent = Agent::where('code', $code)->firstOrFail();

        $data = $request->validate([
            'type'         => 'required|in:depot,retrait',
            'operator'     => 'required|in:wave,orange-money',
            'amount'       => 'required|integer|min:100|max:50000',
            'client_phone' => 'required|string|max:20',
        ]);

        $net   = (int) $data['amount'];
        $frais = $this->gridFee($net);
        if ($frais === null) {
            return response()->json(['message' => 'Montant hors grille (100 – 50 000 FCFA).'], 422);
        }
        $merchantComm = (int) config('paydunya.merchant_commission', 50);
        $especes      = $net + $frais; // ce que le client paie / remet

        $type = $data['type'] === 'depot' ? 'dépôt' : 'retrait';

        $tx = Transaction::create([
            'agent_id'     => $agent->id,
            'type'         => $type,
            'operator'     => $data['operator'],
            'fee_strategy' => 'deducted',
            'amount'       => $net,
            'commission'   => $merchantComm,
            'total'        => $especes,
            'client_phone' => $data['client_phone'],
            'status'       => 'en attente',
            'source'       => 'web',
            'reference'    => 'TRX-' . strtoupper(Str::random(11)),
        ]);

        // DÉPÔT : rien n'est débité maintenant. Le marchand confirmera dans l'app
        // qu'il a bien reçu les espèces, ce qui déclenchera le crédit du client.
        if ($type === 'dépôt') {
            $tx->update(['status' => 'à confirmer']);

            return response()->json([
                'message'   => 'Demande envoyée. Remettez les espèces au marchand : il validera le dépôt.',
                'reference' => $tx->reference,
                'status'    => 'à confirmer',
            ]);
        }

        // RETRAIT : le client est débité (montant + frais) via SoftPay sur son numéro.
        if (config('paydunya.mock')) {
            $tx->update(['status' => 'completed']);

            return response()->json([
                'message'   => 'Transaction simulée (mode test).',
                'reference' => $tx->reference,
                'status'    => 'completed',
            ]);
        }

        $invoice = $this->paydunya->createInvoice(
            $especes,
            "Retrait Téranga — {$agent->code}",
            ['transaction_id' => $tx->id, 'web' => true]
        );
        if (! $invoice['ok'] || ! $invoice['token']) {
            $tx->update(['status' => 'échoué']);
            $reason = data_get($invoice['raw'], 'response_text') ?: 'Échec de création du paiement.';
            return response()->json(['message' => $reason], 422);
        }
        $tx->update(['paydunya_token' => $invoice['token']]);

        $pay = $data['operator'] === 'wave'
            ? $this->paydunya->softpayWave($invoice['token'], $data['client_phone'], $data['client_phone'])
            : $this->paydunya->softpayOrangeMoney($invoice['token'], $data['client_phone'], $data['client_phone']);

        if (! $pay['ok'] || empty($pay['url'])) {
            $tx->update(['status' => 'échoué']);
            return response()->json([
                'message' => $pay['message'] ?? 'Opérateur momentanément indisponible, réessayez.',
            ], 422);
        }

        return response()->json([
            'message'   => 'Validez le paiement dans votre application ' . self::OPERATORS[$data['operator']]['name'] . '.',
            'reference' => $tx->reference,
            'pay_url'   => $pay['url'],
            'status'    => 'en attente',
        ]);
    }

    private function gridFee(int $amount): ?int
    {
        foreach ((array) config('paydunya.fee_grid', []) as $tier) {
            if ($amount >= $tier['min'] && $amount <= $tier['max']) {
                return (int) $tier['fee'];
            }
        }

        return null;
    }
}
