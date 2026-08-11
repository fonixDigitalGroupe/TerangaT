<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Operator;
use App\Models\Transaction;
use App\Services\PaydunyaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(private PaydunyaService $paydunya)
    {
    }

    /** Correspondance opérateur app -> PayDunya + nom en base */
    private const OPERATORS = [
        'wave'         => ['mode' => 'wave-senegal',         'name' => 'Wave'],
        'orange-money' => ['mode' => 'orange-money-senegal', 'name' => 'Orange Money'],
    ];

    /**
     * RETRAIT : le client envoie de l'argent vers l'agent (encaissement / SOFTPAY).
     * Body: operator (wave|orange-money), amount, client_phone, [otp] (requis pour OM)
     */
    public function retrait(Request $request)
    {
        $data = $request->validate([
            'operator'     => 'required|in:wave,orange-money',
            'amount'       => 'required|integer|min:100',
            'client_phone' => 'required|string|max:20',
        ]);

        $agent = $request->user()->agent;
        $tx = $this->createTransaction($agent->id, 'retrait', $data);

        // 1) Facture PayDunya
        $invoice = $this->paydunya->createInvoice(
            $data['amount'],
            "Retrait Téranga — {$data['client_phone']}",
            ['transaction_id' => $tx->id, 'agent_id' => $agent->id]
        );

        if (! $invoice['ok'] || ! $invoice['token']) {
            $tx->update(['status' => 'échoué']);
            return response()->json(['message' => 'Échec de création du paiement.', 'details' => $invoice['raw']], 422);
        }

        $tx->update(['paydunya_token' => $invoice['token']]);

        // 2) SOFTPAY (Wave -> pay.wave.com, OM -> Max it), sinon page hébergée PayDunya
        $name = $agent->user->name ?? 'Client';

        $pay = $data['operator'] === 'wave'
            ? $this->paydunya->softpayWave($invoice['token'], $name, $data['client_phone'])
            : $this->paydunya->softpayOrangeMoney($invoice['token'], $name, $data['client_phone']);

        $payUrl = ($pay['ok'] && $pay['url']) ? $pay['url'] : ($invoice['url'] ?? null);

        if (! empty($pay['fees'])) {
            $tx->update(['commission' => (int) $pay['fees']]);
        }

        if (! $pay['ok'] && ! $payUrl) {
            $tx->update(['status' => 'échoué']);
            return response()->json(['message' => $pay['message'] ?? 'Paiement indisponible.', 'details' => $pay['raw']], 422);
        }

        return response()->json([
            'message'   => 'Ouvrez le paiement pour valider.',
            'reference' => $tx->reference,
            'pay_url'   => $payUrl,
            'status'    => 'en attente',
        ]);
    }

    /**
     * DÉPÔT : l'agent envoie de l'argent vers le client (déboursement / PER).
     * Body: operator (wave|orange-money), amount, client_phone
     */
    public function depot(Request $request)
    {
        $data = $request->validate([
            'operator'     => 'required|in:wave,orange-money',
            'amount'       => 'required|integer|min:100',
            'client_phone' => 'required|string|max:20',
        ]);

        $agent = $request->user()->agent;
        $tx = $this->createTransaction($agent->id, 'dépôt', $data);

        $mode = self::OPERATORS[$data['operator']]['mode'];
        $res = $this->paydunya->disburse($data['client_phone'], $data['amount'], $mode, $tx->reference);

        $status = ($res['status'] ?? null) === 'pending'
            ? 'en attente'
            : ($res['ok'] ? 'completed' : 'échoué');
        $tx->update(['status' => $status]);

        return response()->json([
            'message'   => $res['ok'] ? 'Dépôt effectué avec succès.' : ($res['message'] ?? 'Échec du dépôt.'),
            'reference' => $tx->reference,
            'status'    => $tx->status,
            'details'   => $res['raw'] ?? null,
        ], $res['ok'] ? 200 : 422);
    }

    /**
     * TRANSFERT inter-wallet : débit du numéro « De » (agent) via SOFTPAY,
     * puis crédit du « Vers » (déboursement) déclenché à la confirmation (IPN).
     * Body: operator, amount, from_number (De = agent), to_number (Vers), [otp]
     */
    public function transfert(Request $request)
    {
        $data = $request->validate([
            'operator'     => 'required|in:wave,orange-money',   // wallet du marchand (débité)
            'to_operator'  => 'required|in:wave,orange-money',   // wallet du client (crédité)
            'amount'       => 'required|integer|min:100|max:50000', // montant reçu par le client
            'from_number'  => 'required|string|max:20',
            'to_number'    => 'required|string|max:20',
        ]);

        $agent = $request->user()->agent;
        if (! $agent) {
            return response()->json(['message' => 'Compte agent introuvable.'], 422);
        }

        // `amount` = montant que le CLIENT doit recevoir (net).
        // Espèces échangées = net + frais (grille). Le marchand y garde sa commission,
        // son wallet est donc débité de : brut = net + frais − commission_marchand.
        $net          = (int) $data['amount'];
        $frais        = $this->gridFee($net);
        if ($frais === null) {
            return response()->json(['message' => 'Montant hors grille (100 – 50 000 FCFA).'], 422);
        }
        $merchantComm = (int) config('paydunya.merchant_commission', 50);
        $brut         = $net + $frais - $merchantComm;

        try {
            $tx = $this->createTransaction($agent->id, 'dépôt', [
                'operator'     => $data['operator'],
                'client_phone' => $data['to_number'],   // Vers
                'amount'       => $net,                 // ce que le client reçoit
            ]);
            // Le marchand est débité sur `operator`, le client crédité sur `recipient_operator`.
            // total = montant brut réellement débité au marchand ; commission = commission marchand.
            $tx->update([
                'sender_phone'       => $data['from_number'],
                'recipient_operator' => $data['to_operator'],
                'total'              => $brut,
                'commission'         => $merchantComm,
            ]);

            // MODE TEST : on simule le succès sans appeler PayDunya (utile tant que le
            // KYC PayDunya n'est pas validé). Activé via PAYDUNYA_MOCK=true dans le .env.
            if (config('paydunya.mock')) {
                $tx->update(['status' => 'completed']);

                return response()->json([
                    'message'   => 'Transaction simulée (mode test, sans PayDunya).',
                    'reference' => $tx->reference,
                    'status'    => 'completed',
                ]);
            }

            // 1) Facture PayDunya sur le montant BRUT (c'est lui qui est débité au marchand).
            $invoice = $this->paydunya->createInvoice(
                $brut,
                "Transfert {$data['from_number']} -> {$data['to_number']}",
                ['transaction_id' => $tx->id, 'transfert' => true]
            );
            if (! $invoice['ok'] || ! $invoice['token']) {
                $tx->update(['status' => 'échoué']);
                // Remonte le motif exact de PayDunya (ex. « plafond de transaction atteint,
                // KYC à valider ») plutôt qu'un message générique.
                $reason = data_get($invoice['raw'], 'response_text') ?: 'Échec de création du paiement PayDunya.';
                return response()->json(['message' => $reason, 'details' => $invoice['raw']], 422);
            }
            $tx->update(['paydunya_token' => $invoice['token']]);

            // 2) Débit du numéro « De » (wallet du marchand) via SOFTPAY uniquement.
            //    Wave renvoie une URL pay.wave.com et OM une URL Max it : toutes deux
            //    ouvrent l'application du marchand pour qu'il valide le débit.
            //    Aucun repli sur la page de paiement hébergée PayDunya — le dépôt doit
            //    toujours passer par l'app du marchand, jamais par un formulaire web.
            $name = $agent->user->name ?? 'Agent';

            $pay = $data['operator'] === 'wave'
                ? $this->paydunya->softpayWave($invoice['token'], $name, $data['from_number'])
                : $this->paydunya->softpayOrangeMoney($invoice['token'], $name, $data['from_number']);

            // Les frais PayDunya réels sont déjà tracés dans les logs par le service.
            // On ne les stocke pas ici : la colonne `commission` porte désormais la
            // marge Téranga et ne doit pas être écrasée.

            // SOFTPAY indisponible : on abandonne au lieu d'ouvrir une page de paiement.
            if (! $pay['ok'] || empty($pay['url'])) {
                $tx->update(['status' => 'échoué']);
                return response()->json([
                    'message' => $pay['message'] ?? 'Opérateur momentanément indisponible, réessayez.',
                    'details' => $pay['raw'],
                ], 422);
            }

            return response()->json([
                'message'   => 'Validez le débit dans votre application ' . self::OPERATORS[$data['operator']]['name'] . '.',
                'reference' => $tx->reference,
                'pay_url'   => $pay['url'],   // pay.wave.com ou Max it -> ouvre l'app du marchand
                'status'    => 'en attente',
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('[PayDunya] transfert exception', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile() . ':' . $e->getLine(),
            ]);
            return response()->json([
                'message' => 'Erreur PayDunya : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * IPN : PayDunya notifie le serveur du statut final d'un paiement.
     * Route publique (pas d'auth) — PayDunya l'appelle.
     */
    public function ipn(Request $request)
    {
        // PayDunya renvoie le token de la facture dans data[invoice][token]
        $token = data_get($request->all(), 'data.invoice.token')
            ?? $request->input('token')
            ?? data_get($request->all(), 'invoice.token');

        // Pas de token = sonde d'accessibilité PayDunya (avant déboursement) -> répondre 200.
        if (! $token) {
            return response()->json(['message' => 'OK'], 200);
        }

        $tx = Transaction::where('paydunya_token', $token)->first();
        if (! $tx) {
            return response()->json(['message' => 'Transaction inconnue.'], 404);
        }

        $check = $this->paydunya->confirmInvoice($token);
        \Illuminate\Support\Facades\Log::info('[PayDunya] IPN confirm', ['ref' => $tx->reference, 'raw' => $check['raw'] ?? null]);

        if (! ($check['ok'] && $check['status'] === 'completed')) {
            $tx->update(['status' => $check['status'] === 'cancelled' ? 'échoué' : 'en attente']);
            return response()->json(['message' => 'IPN traité (non finalisé).']);
        }

        // Référence réelle de la collecte (traçable chez PayDunya/opérateur) — pour les litiges.
        $raw = $check['raw'] ?? [];
        $collectRef = data_get($raw, 'provider_reference') ?? data_get($raw, 'receipt_identifier');
        $tx->update(['paydunya_ref' => $collectRef]);

        // Le « De » a été débité du montant BRUT. Si c'est un transfert, on crédite le
        // « Vers » du montant NET (= $tx->amount, ce que le client doit recevoir). La
        // différence brut/net, après frais PayDunya, reste la marge Téranga.
        if ($tx->sender_phone) {
            // Le crédit part sur l'opérateur du CLIENT, pas sur celui du marchand :
            // marchand débité sur Wave, client crédité sur Orange Money si c'est son choix.
            $recipientOperator = $tx->recipient_operator ?? $tx->operator;
            $mode = self::OPERATORS[$recipientOperator]['mode'] ?? 'wave-senegal';
            $disb = $this->paydunya->disburse($tx->client_phone, (int) $tx->amount, $mode, $tx->reference);

            if ($disb['ok']) {
                // success -> completed ; pending -> en attente (statut final via API).
                $status = ($disb['status'] ?? null) === 'pending' ? 'en attente' : 'completed';
            } else {
                // La collecte a RÉUSSI (marchand débité) mais le reversement au client a
                // échoué (ex. solde PayDunya insuffisant). L'argent est chez Téranga :
                // statut « à reverser » (à relancer via paydunya:retry-disburse), pas « échoué ».
                $status = 'à reverser';
                \Illuminate\Support\Facades\Log::warning('[PayDunya] reversement échoué, à reverser', [
                    'ref'    => $tx->reference,
                    'raw'    => $disb['raw'] ?? null,
                ]);
            }

            // Référence réelle du déboursement (versement au client) — pour les litiges.
            $disburseRef = data_get($disb, 'raw.provider_ref') ?? data_get($disb, 'raw.transaction_id');

            // La commission (marge Téranga) a été fixée à la création : on ne l'écrase pas.
            $tx->update([
                'status'       => $status,
                'disburse_ref' => $disburseRef,
            ]);
        } else {
            $tx->update(['status' => 'completed']);
        }

        return response()->json(['message' => 'IPN traité.']);
    }

    /**
     * Frais facturés au client selon la grille tarifaire (config paydunya.fee_grid).
     * Renvoie null si le montant est hors des bornes.
     */
    private function gridFee(int $amount): ?int
    {
        foreach ((array) config('paydunya.fee_grid', []) as $tier) {
            if ($amount >= $tier['min'] && $amount <= $tier['max']) {
                return (int) $tier['fee'];
            }
        }

        return null;
    }

    /**
     * Crée la transaction (statut initial « en attente ») + la commission associée.
     */
    private function createTransaction(int $agentId, string $type, array $data): Transaction
    {
        $opName = self::OPERATORS[$data['operator']]['name'];
        $feePercent = (float) (Operator::where('name', $opName)->value('fee_percent') ?? 1.0);
        $commission = (int) round($data['amount'] * $feePercent / 100);

        $tx = Transaction::create([
            'agent_id'     => $agentId,
            'type'         => $type,
            'operator'     => $data['operator'],
            'fee_strategy' => 'deducted',
            'amount'       => $data['amount'],
            'commission'   => $commission,
            'total'        => $data['amount'] + $commission,
            'client_phone' => $data['client_phone'],
            'status'       => 'en attente',
            'reference'    => 'TRX-' . strtoupper(Str::random(11)),
        ]);

        $agentPart = (int) round($commission * 0.4);
        Commission::create([
            'transaction_id'  => $tx->id,
            'agent_amount'    => $agentPart,
            'platform_amount' => $commission - $agentPart,
        ]);

        return $tx;
    }
}
