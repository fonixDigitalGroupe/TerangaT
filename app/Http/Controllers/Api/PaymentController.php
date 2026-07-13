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
            'operator'    => 'required|in:wave,orange-money',
            'amount'      => 'required|integer|min:100',
            'from_number' => 'required|string|max:20',
            'to_number'   => 'required|string|max:20',
        ]);

        $agent = $request->user()->agent;
        if (! $agent) {
            return response()->json(['message' => 'Compte agent introuvable.'], 422);
        }

        try {
            $tx = $this->createTransaction($agent->id, 'dépôt', [
                'operator'     => $data['operator'],
                'client_phone' => $data['to_number'],   // Vers
                'amount'       => $data['amount'],
            ]);
            $tx->update(['sender_phone' => $data['from_number']]);

            // 1) Facture PayDunya
            $invoice = $this->paydunya->createInvoice(
                $data['amount'],
                "Transfert {$data['from_number']} -> {$data['to_number']}",
                ['transaction_id' => $tx->id, 'transfert' => true]
            );
            if (! $invoice['ok'] || ! $invoice['token']) {
                $tx->update(['status' => 'échoué']);
                return response()->json(['message' => 'Échec de création du paiement PayDunya.', 'details' => $invoice['raw']], 422);
            }
            $tx->update(['paydunya_token' => $invoice['token']]);

            // 2) Débit du numéro « De » via SOFTPAY (Wave -> pay.wave.com, OM -> Max it).
            //    Si SOFTPAY échoue, on bascule sur la page de paiement hébergée PayDunya.
            $name = $agent->user->name ?? 'Agent';

            $pay = $data['operator'] === 'wave'
                ? $this->paydunya->softpayWave($invoice['token'], $name, $data['from_number'])
                : $this->paydunya->softpayOrangeMoney($invoice['token'], $name, $data['from_number']);

            $payUrl = ($pay['ok'] && $pay['url']) ? $pay['url'] : ($invoice['url'] ?? null);

            // Frais réels renvoyés par PayDunya dès l'initiation (option B).
            if (! empty($pay['fees'])) {
                $tx->update(['commission' => (int) $pay['fees']]);
            }

            // Échec SOFTPAY ET pas de page hébergée : on abandonne (transaction échouée).
            if (! $pay['ok'] && ! $payUrl) {
                $tx->update(['status' => 'échoué']);
                return response()->json(['message' => $pay['message'] ?? 'Paiement indisponible.', 'details' => $pay['raw']], 422);
            }

            return response()->json([
                'message'   => 'Ouvrez le paiement pour valider le débit et finaliser le transfert.',
                'reference' => $tx->reference,
                'pay_url'   => $payUrl,   // pay.wave.com / Max it / page hébergée
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

        // Frais PayDunya : réels si renvoyés par l'API, sinon estimés via le taux configuré.
        $raw = $check['raw'] ?? [];
        $rawFee = (int) round(
            data_get($raw, 'invoice.fees')
            ?? data_get($raw, 'invoice.fee_amount')
            ?? data_get($raw, 'fees')
            ?? 0
        );
        $fee = $rawFee > 0
            ? $rawFee
            : (int) ceil($tx->amount * config('paydunya.fee_percent', 3) / 100);

        // Le « De » a été débité. Si c'est un transfert, on crédite le « Vers » (déboursement API PUSH v2).
        if ($tx->sender_phone) {
            $mode = self::OPERATORS[$tx->operator]['mode'] ?? 'wave-senegal';
            $disb = $this->paydunya->disburse($tx->client_phone, max(0, $tx->amount - $fee), $mode, $tx->reference);

            // success -> completed ; pending -> en attente (statut final via API) ; sinon échoué
            $status = ($disb['status'] ?? null) === 'pending'
                ? 'en attente'
                : ($disb['ok'] ? 'completed' : 'échoué');

            $tx->update(['status' => $status, 'commission' => $fee ?: $tx->commission]);
        } else {
            $tx->update(['status' => 'completed', 'commission' => $fee ?: $tx->commission]);
        }

        return response()->json(['message' => 'IPN traité.']);
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
